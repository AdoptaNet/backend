import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetReturn } from '../../domain/entities/pet-return.entity';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { PetReturnStatus } from '../../domain/value-objects/pet-return-status.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { CompletePetReturnDto } from '../dtos/complete-pet-return.dto';
import { PetReturnCompletedEvent } from '../../domain/events/pet-return-completed.event';

@Injectable()
export class CompletePetReturnUseCase {
  constructor(
    @InjectRepository(PetReturn)
    private readonly petReturnRepository: Repository<PetReturn>,
    @InjectRepository(FollowUpRecord)
    private readonly followUpRecordRepository: Repository<FollowUpRecord>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    returnId: string,
    dto: CompletePetReturnDto,
    shelterId: string,
    role: UserRole,
  ): Promise<PetReturn> {
    const petReturn = await this.petReturnRepository.findOne({
      where: { id: returnId },
      relations: {
        pet: true,
        followUpRecord: true,
        shelter: { shelterProfile: true },
        adopter: { adopterProfile: true },
      },
    });

    if (!petReturn) {
      throw new NotFoundException(`No se encontró la solicitud de retorno #${returnId}`);
    }

    if (role !== UserRole.ADMIN && petReturn.shelterId !== shelterId) {
      throw new ForbiddenException('Solo el albergue receptor puede concluir este retorno');
    }

    if (petReturn.status === PetReturnStatus.RETURNED) {
      throw new BadRequestException('Este retorno ya fue formalizado previamente');
    }

    const isAccepted = dto.decision === 'accept';
    petReturn.completedAt = new Date();
    petReturn.shelterObservations = dto.shelterObservations?.trim() || null;
    petReturn.status = isAccepted ? PetReturnStatus.RETURNED : PetReturnStatus.REJECTED;

    const savedReturn = await this.petReturnRepository.save(petReturn);

    if (isAccepted) {
      // 1. Marcar expediente de seguimiento como 'returned'
      await this.followUpRecordRepository.update(petReturn.followUpRecordId, {
        status: FollowUpProcessStatus.RETURNED,
      });

      // 2. Reactivar mascota en el catálogo público
      await this.petRepository.update(petReturn.petId, {
        status: PetStatus.AVAILABLE,
      });
    }

    const adopterName =
      (petReturn.adopter as any)?.adopterProfile?.fullName ||
      petReturn.adopter?.email?.split('@')[0] ||
      'Adoptante';

    const shelterName =
      (petReturn.shelter as any)?.shelterProfile?.shelterName ||
      petReturn.shelter?.email?.split('@')[0] ||
      'Albergue';

    this.eventEmitter.emit(
      PetReturnCompletedEvent.EVENT_NAME,
      new PetReturnCompletedEvent(
        savedReturn.id,
        petReturn.followUpRecordId,
        petReturn.petId,
        petReturn.pet?.name || 'Mascota',
        isAccepted,
        petReturn.adopterId,
        petReturn.adopter?.email || '',
        adopterName,
        shelterName,
      ),
    );

    return savedReturn;
  }
}
