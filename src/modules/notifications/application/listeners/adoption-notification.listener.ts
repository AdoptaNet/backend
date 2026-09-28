import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { AdoptionSubmittedEvent } from '../../../adoptions/domain/events/adoption-submitted.event';
import { AdoptionStatusChangedEvent } from '../../../adoptions/domain/events/adoption-status-changed.event';
import { AdoptionStatus } from '../../../adoptions/domain/value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../../../adoptions/domain/value-objects/adoption-rejection-reason.enum';
import { EmailService } from '../interfaces/email.service';

const REJECTION_REASON_LABELS: Record<AdoptionRejectionReason, string> = {
  [AdoptionRejectionReason.INCOMPATIBLE_HOUSING]:
    'Condiciones de vivienda no compatibles con la mascota',
  [AdoptionRejectionReason.UNSUITABLE_SCHEDULE]:
    'Disponibilidad de tiempo y rutina no acordes a los requerimientos del animal',
  [AdoptionRejectionReason.FINANCIAL_INCOMPATIBILITY]:
    'Capacidad de cobertura médica y manutención insuficiente',
  [AdoptionRejectionReason.OTHER_APPLICANT_CHOSEN]:
    'Se ha formalizado la adopción con otro postulante seleccionado para este caso',
  [AdoptionRejectionReason.INCOMPLETE_PROFILE]:
    'Expediente o información de postulación insuficiente',
  [AdoptionRejectionReason.OTHER]:
    'Otras consideraciones específicas detalladas por el albergue',
};

@Injectable()
export class AdoptionNotificationListener {
  private readonly logger = new Logger(AdoptionNotificationListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(AdoptionSubmittedEvent.EVENT_NAME, { async: true })
  async handleAdoptionSubmitted(event: AdoptionSubmittedEvent): Promise<void> {
    this.logger.log(
      `Notificando al albergue ${event.shelterEmail} sobre nueva solicitud #${event.adoptionId} para ${event.petName}`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.emailService.sendNewAdoptionRequestEmail(event.shelterEmail, {
        userId: event.shelterId,
        petName: event.petName,
        adopterName: event.adopterName,
        applicationUrl: `${frontendUrl}/applications`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Fallo al enviar correo de nueva solicitud a ${event.shelterEmail}: ${message}`,
      );
    }
  }

  @OnEvent(AdoptionStatusChangedEvent.EVENT_NAME, { async: true })
  async handleAdoptionStatusChanged(
    event: AdoptionStatusChangedEvent,
  ): Promise<void> {
    // Solo notificamos al adoptante cuando hay resolución (aprobada o rechazada)
    if (
      event.newStatus !== AdoptionStatus.APPROVED &&
      event.newStatus !== AdoptionStatus.REJECTED
    ) {
      return;
    }

    const isApproved = event.newStatus === AdoptionStatus.APPROVED;
    this.logger.log(
      `Notificando al adoptante ${event.adopterEmail} sobre resolución (${event.newStatus}) de solicitud #${event.adoptionId} para ${event.petName}`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const rejectionReasonText = event.rejectionReason
      ? REJECTION_REASON_LABELS[event.rejectionReason] || event.rejectionReason
      : null;

    const actionUrl = isApproved
      ? `${frontendUrl}/applications`
      : `${frontendUrl}/pets`;

    try {
      await this.emailService.sendAdoptionStatusChangedEmail(
        event.adopterEmail,
        {
          userId: event.adopterId,
          adopterName: event.adopterName,
          petName: event.petName,
          isApproved,
          rejectionReasonText,
          rejectionNotes: event.rejectionNotes,
          actionUrl,
        },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Fallo al enviar notificación de estado de adopción a ${event.adopterEmail}: ${message}`,
      );
    }
  }
}
