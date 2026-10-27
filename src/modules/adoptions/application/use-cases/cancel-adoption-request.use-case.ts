import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionCancelledEvent } from '../../domain/events/adoption-cancelled.event';
import {
  AdoptionActionNotAllowedException,
  AdoptionRequestNotFoundException,
} from '../../domain/exceptions/adoption.exceptions';
import { AdoptionRequestResponseDto } from '../dtos/adoption-request-response.dto';
import { AdoptionRequestMapper } from '../mappers/adoption-request.mapper';

@Injectable()
export class CancelAdoptionRequestUseCase {
  constructor(
    private readonly adoptionRepo: AdoptionRequestRepository,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    requestId: string,
    adopterId: string,
  ): Promise<AdoptionRequestResponseDto> {
    const adoption = await this.adoptionRepo.findById(requestId);
    if (!adoption || adoption.adopterId !== adopterId) {
      throw new AdoptionRequestNotFoundException(requestId);
    }

    if (
      adoption.status !== AdoptionStatus.PENDING &&
      adoption.status !== AdoptionStatus.UNDER_REVIEW
    ) {
      throw new AdoptionActionNotAllowedException(
        `No se puede cancelar una postulación en estado "${adoption.status}". Solo es posible desistir de solicitudes pendientes o en evaluación.`,
      );
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      adoption.status = AdoptionStatus.CANCELLED;
      adoption.cancelledAt = new Date();
      const savedAdoption = await manager.save(AdoptionRequest, adoption);

      // Si no quedan solicitudes en evaluación, restaurar mascota a available
      const remainingUnderReview = await manager.count(AdoptionRequest, {
        where: {
          petId: adoption.petId,
          status: AdoptionStatus.UNDER_REVIEW,
        },
      });

      if (remainingUnderReview === 0) {
        await manager.update(
          Pet,
          { id: adoption.petId, status: PetStatus.IN_PROCESS },
          { status: PetStatus.AVAILABLE },
        );
      }

      return savedAdoption;
    });

    this.eventEmitter.emit(
      AdoptionCancelledEvent.EVENT_NAME,
      new AdoptionCancelledEvent(
        saved.id,
        saved.petId,
        saved.pet?.name || 'Mascota',
        saved.adopterId,
        saved.shelterId,
      ),
    );

    return AdoptionRequestMapper.toResponseDto(saved);
  }
}
