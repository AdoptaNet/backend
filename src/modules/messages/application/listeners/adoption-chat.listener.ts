import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdoptionStatusChangedEvent } from '../../../adoptions/domain/events/adoption-status-changed.event';
import { AdoptionCancelledEvent } from '../../../adoptions/domain/events/adoption-cancelled.event';
import { AdoptionStatus } from '../../../adoptions/domain/value-objects/adoption-status.enum';
import { ProvisionChatRoomUseCase } from '../use-cases/provision-chat-room.use-case';

@Injectable()
export class AdoptionChatListener {
  private readonly logger = new Logger(AdoptionChatListener.name);

  constructor(
    private readonly provisionChatRoomUseCase: ProvisionChatRoomUseCase,
  ) {}

  @OnEvent(AdoptionStatusChangedEvent.EVENT_NAME, { async: true })
  async handleAdoptionStatusChanged(
    event: AdoptionStatusChangedEvent,
  ): Promise<void> {
    try {
      if (
        event.newStatus === AdoptionStatus.UNDER_REVIEW ||
        event.newStatus === AdoptionStatus.APPROVED
      ) {
        this.logger.log(
          `Aprovisionando sala de chat para la adopción ${event.adoptionId} en estado ${event.newStatus}`,
        );
        await this.provisionChatRoomUseCase.execute(event.adoptionId, true);
      } else if (event.newStatus === AdoptionStatus.REJECTED) {
        this.logger.log(
          `Congelando sala de chat para adopción rechazada ${event.adoptionId}`,
        );
        await this.provisionChatRoomUseCase.execute(event.adoptionId, false);
      }
    } catch (error) {
      this.logger.error(
        `Error al procesar AdoptionStatusChangedEvent en AdoptionChatListener: ${error?.message}`,
        error?.stack,
      );
    }
  }

  @OnEvent(AdoptionCancelledEvent.EVENT_NAME, { async: true })
  async handleAdoptionCancelled(event: AdoptionCancelledEvent): Promise<void> {
    try {
      this.logger.log(
        `Congelando sala de chat para adopción cancelada ${event.adoptionId}`,
      );
      await this.provisionChatRoomUseCase.execute(event.adoptionId, false);
    } catch (error) {
      this.logger.error(
        `Error al procesar AdoptionCancelledEvent en AdoptionChatListener: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
