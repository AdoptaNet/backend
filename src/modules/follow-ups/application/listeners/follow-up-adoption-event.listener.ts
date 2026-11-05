import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdoptionStatusChangedEvent } from '../../../adoptions/domain/events/adoption-status-changed.event';
import { AdoptionStatus } from '../../../adoptions/domain/value-objects/adoption-status.enum';
import { InitializeFollowUpUseCase } from '../use-cases/initialize-follow-up.use-case';

@Injectable()
export class FollowUpAdoptionEventListener {
  private readonly logger = new Logger(FollowUpAdoptionEventListener.name);

  constructor(
    private readonly initializeFollowUpUseCase: InitializeFollowUpUseCase,
  ) {}

  @OnEvent(AdoptionStatusChangedEvent.EVENT_NAME, { async: true })
  async handleAdoptionStatusChanged(event: AdoptionStatusChangedEvent): Promise<void> {
    if (event.newStatus !== AdoptionStatus.APPROVED) {
      return;
    }

    this.logger.log(
      `Adopción #${event.adoptionId} aprobada. Inicializando expediente y cronograma de seguimiento post-adopción.`,
    );

    try {
      await this.initializeFollowUpUseCase.execute(event.adoptionId);
    } catch (error: any) {
      this.logger.error(
        `Fallo al inicializar seguimiento para la adopción #${event.adoptionId}: ${error.message}`,
      );
    }
  }
}
