import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { PetReturn } from '../../domain/entities/pet-return.entity';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { PetReturnStatus } from '../../domain/value-objects/pet-return-status.enum';
import { PetReturnReason } from '../../domain/value-objects/pet-return-reason.enum';
import { RequestPetReturnDto } from '../dtos/request-pet-return.dto';
import { PetReturnRequestedEvent } from '../../domain/events/pet-return-requested.event';

@Injectable()
export class RequestPetReturnUseCase {
  constructor(
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
    @InjectRepository(PetReturn)
    private readonly petReturnRepository: Repository<PetReturn>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    followUpId: string,
    dto: RequestPetReturnDto,
    userId: string,
  ): Promise<PetReturn> {
    const record = await this.followUpRecordRepository.findOne({
      where: { id: followUpId },
      relations: {
        pet: true,
        adopter: { adopterProfile: true },
        shelter: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`No se encontró el expediente #${followUpId}`);
    }

    if (record.adopterId !== userId) {
      throw new ForbiddenException('Solo el adoptante responsable puede solicitar el retorno de la mascota');
    }

    if (record.status === FollowUpProcessStatus.RETURNED) {
      throw new BadRequestException('Esta mascota ya fue devuelta previamente y su expediente está cerrado');
    }

    // Verificar si ya hay una solicitud pendiente o en coordinación
    const existingActive = await this.petReturnRepository.findOne({
      where: {
        followUpRecordId: record.id,
        status: PetReturnStatus.REQUESTED,
      },
    });

    if (existingActive) {
      throw new BadRequestException('Ya existe una solicitud de retorno en evaluación para esta mascota');
    }

    const mapToCanonicalReason = (rawReason: string): PetReturnReason => {
      switch (rawReason) {
        case 'severe_allergy':
          return PetReturnReason.SEVERE_ALLERGY;
        case 'behavioral_challenges':
        case 'behavioral_issue':
          return PetReturnReason.BEHAVIORAL_ISSUE;
        case 'housing_restriction':
        case 'landlord_issue':
          return PetReturnReason.LANDLORD_ISSUE;
        case 'financial_hardship':
        case 'personal_emergency':
        case 'unforeseen_emergency':
          return PetReturnReason.UNFORESEEN_EMERGENCY;
        default:
          return PetReturnReason.OTHER;
      }
    };

    const finalReason = mapToCanonicalReason(dto.reason);

    let fullExplanation = dto.explanation.trim();
    if (dto.emergencyContactPhone?.trim()) {
      fullExplanation += `\n\n[Contacto de emergencia: ${dto.emergencyContactPhone.trim()}]`;
    }

    const petReturn = this.petReturnRepository.create({
      followUpRecordId: record.id,
      petId: record.petId,
      adopterId: record.adopterId,
      shelterId: record.shelterId,
      reason: finalReason,
      explanation: fullExplanation,
      supportingDocumentUrl: dto.supportingDocumentUrl || null,
      status: PetReturnStatus.REQUESTED,
      requestedAt: new Date(),
    });

    const savedReturn = await this.petReturnRepository.save(petReturn);

    const adopterName =
      (record.adopter as any)?.adopterProfile?.fullName ||
      record.adopter?.email?.split('@')[0] ||
      'Adoptante';

    this.eventEmitter.emit(
      PetReturnRequestedEvent.EVENT_NAME,
      new PetReturnRequestedEvent(
        savedReturn.id,
        record.id,
        record.petId,
        record.pet?.name || 'Mascota',
        savedReturn.reason,
        savedReturn.explanation,
        adopterName,
        record.shelterId,
        record.shelter?.email || '',
      ),
    );

    return savedReturn;
  }
}
