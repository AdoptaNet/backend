import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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

    adoption.status = AdoptionStatus.CANCELLED;
    adoption.cancelledAt = new Date();

    const saved = await this.adoptionRepo.save(adoption);

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
