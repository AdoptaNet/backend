import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../../domain/value-objects/adoption-rejection-reason.enum';
import { AdoptionStatusChangedEvent } from '../../domain/events/adoption-status-changed.event';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import {
  AdoptionActionNotAllowedException,
  AdoptionRequestNotFoundException,
  UnauthorizedShelterActionForbiddenException,
} from '../../domain/exceptions/adoption.exceptions';
import { ReviewAdoptionRequestDto } from '../dtos/review-adoption-request.dto';
import { AdoptionRequestResponseDto } from '../dtos/adoption-request-response.dto';
import { AdoptionRequestMapper } from '../mappers/adoption-request.mapper';

@Injectable()
export class ReviewAdoptionRequestUseCase {
  constructor(
    private readonly adoptionRepo: AdoptionRequestRepository,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    requestId: string,
    shelterId: string,
    dto: ReviewAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    const adoption = await this.adoptionRepo.findById(requestId);
    if (!adoption) {
      throw new AdoptionRequestNotFoundException(requestId);
    }

    // Regla de autorización estricta: solo el albergue custodio puede dictaminar
    if (adoption.shelterId !== shelterId) {
      throw new UnauthorizedShelterActionForbiddenException();
    }

    // No se puede modificar una solicitud ya concluida
    if (
      adoption.status === AdoptionStatus.APPROVED ||
      adoption.status === AdoptionStatus.REJECTED ||
      adoption.status === AdoptionStatus.CANCELLED
    ) {
      throw new AdoptionActionNotAllowedException(
        `La solicitud ya se encuentra finalizada en estado "${adoption.status}" y no puede ser modificada.`,
      );
    }

    if (dto.status === AdoptionStatus.UNDER_REVIEW) {
      adoption.status = AdoptionStatus.UNDER_REVIEW;
      const saved = await this.adoptionRepo.save(adoption);

      this.eventEmitter.emit(
        AdoptionStatusChangedEvent.EVENT_NAME,
        new AdoptionStatusChangedEvent(
          saved.id,
          saved.petId,
          saved.pet?.name || 'Mascota',
          saved.adopterId,
          saved.adopter?.fullName || 'Adoptante',
          saved.adopter?.email || '',
          saved.shelterId,
          AdoptionStatus.UNDER_REVIEW,
        ),
      );

      return AdoptionRequestMapper.toResponseDto(saved);
    }

    if (dto.status === AdoptionStatus.REJECTED) {
      if (!dto.rejectionReason) {
        throw new AdoptionActionNotAllowedException(
          'Es obligatorio seleccionar un motivo de rechazo del catálogo oficial.',
        );
      }

      adoption.status = AdoptionStatus.REJECTED;
      adoption.rejectionReason = dto.rejectionReason;
      adoption.rejectionNotes = dto.rejectionNotes?.trim() || null;
      adoption.rejectedAt = new Date();

      const saved = await this.adoptionRepo.save(adoption);

      this.eventEmitter.emit(
        AdoptionStatusChangedEvent.EVENT_NAME,
        new AdoptionStatusChangedEvent(
          saved.id,
          saved.petId,
          saved.pet?.name || 'Mascota',
          saved.adopterId,
          saved.adopter?.fullName || 'Adoptante',
          saved.adopter?.email || '',
          saved.shelterId,
          AdoptionStatus.REJECTED,
          saved.rejectionReason,
          saved.rejectionNotes,
        ),
      );

      return AdoptionRequestMapper.toResponseDto(saved);
    }

    if (dto.status === AdoptionStatus.APPROVED) {
      // US-16 Escenario 2: Aprobación atómica y cierre de postulaciones competidoras
      let savedApproved: AdoptionRequest;
      let closedCompetitors: AdoptionRequest[] = [];

      await this.dataSource.transaction(async (manager) => {
        // 1. Marcar solicitud como aprobada
        adoption.status = AdoptionStatus.APPROVED;
        adoption.approvedAt = new Date();
        savedApproved = await manager.save(AdoptionRequest, adoption);

        // 2. Actualizar estado de la mascota a adopted
        await manager.update(Pet, { id: adoption.petId }, {
          status: PetStatus.ADOPTED,
        });

        // 3. Buscar y rechazar atómicamente a los demás postulantes activos
        const competitors = await manager.find(AdoptionRequest, {
          where: {
            petId: adoption.petId,
          },
          relations: {
            adopter: true,
            pet: true,
          },
        });

        const activeCompetitors = competitors.filter(
          (c) =>
            c.id !== adoption.id &&
            (c.status === AdoptionStatus.PENDING ||
              c.status === AdoptionStatus.UNDER_REVIEW),
        );

        for (const competitor of activeCompetitors) {
          competitor.status = AdoptionStatus.REJECTED;
          competitor.rejectionReason =
            AdoptionRejectionReason.OTHER_APPLICANT_CHOSEN;
          competitor.rejectionNotes =
            'Se ha seleccionado a otro postulante idóneo para esta mascota. Te invitamos a postular a otros animales en el catálogo.';
          competitor.rejectedAt = new Date();
          await manager.save(AdoptionRequest, competitor);
        }

        closedCompetitors = activeCompetitors;
      });

      // 4. Emitir eventos de dominio tras el commit exitoso
      this.eventEmitter.emit(
        AdoptionStatusChangedEvent.EVENT_NAME,
        new AdoptionStatusChangedEvent(
          savedApproved!.id,
          savedApproved!.petId,
          savedApproved!.pet?.name || 'Mascota',
          savedApproved!.adopterId,
          savedApproved!.adopter?.fullName || 'Adoptante',
          savedApproved!.adopter?.email || '',
          savedApproved!.shelterId,
          AdoptionStatus.APPROVED,
        ),
      );

      for (const closed of closedCompetitors) {
        this.eventEmitter.emit(
          AdoptionStatusChangedEvent.EVENT_NAME,
          new AdoptionStatusChangedEvent(
            closed.id,
            closed.petId,
            closed.pet?.name || 'Mascota',
            closed.adopterId,
            closed.adopter?.fullName || 'Adoptante',
            closed.adopter?.email || '',
            closed.shelterId,
            AdoptionStatus.REJECTED,
            closed.rejectionReason,
            closed.rejectionNotes,
          ),
        );
      }

      return AdoptionRequestMapper.toResponseDto(savedApproved!);
    }

    throw new AdoptionActionNotAllowedException('Acción de revisión no válida.');
  }
}
