import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { MilestoneSubmittedEvent } from '../../domain/events/milestone-submitted.event';
import { MilestoneReviewedEvent } from '../../domain/events/milestone-reviewed.event';
import { FollowUpCompletedEvent } from '../../domain/events/follow-up-completed.event';
import { PetReturnRequestedEvent } from '../../domain/events/pet-return-requested.event';
import { PetReturnCompletedEvent } from '../../domain/events/pet-return-completed.event';

@Injectable()
export class FollowUpNotificationListener {
  private readonly logger = new Logger(FollowUpNotificationListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(MilestoneSubmittedEvent.EVENT_NAME, { async: true })
  async handleMilestoneSubmitted(event: MilestoneSubmittedEvent): Promise<void> {
    this.logger.log(
      `Notificando al albergue ${event.shelterEmail} sobre evidencias subidas para ${event.petName} (${event.milestoneType}).`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.emailService.sendEmail({
        to: event.shelterEmail,
        subject: `📸 Nuevas evidencias de seguimiento para ${event.petName}`,
        template: null as any,
        text: `Hola, el adoptante ${event.adopterName} ha remitido nuevas evidencias para el hito de ${event.milestoneType} de ${event.petName}. Puedes revisarlas y emitir dictamen en: ${frontendUrl}/follow-up`,
        userId: event.shelterId,
      });
    } catch (err: any) {
      this.logger.error(`Error notificando evidencias enviadas a ${event.shelterEmail}: ${err.message}`);
    }
  }

  @OnEvent(MilestoneReviewedEvent.EVENT_NAME, { async: true })
  async handleMilestoneReviewed(event: MilestoneReviewedEvent): Promise<void> {
    this.logger.log(
      `Notificando a adoptante ${event.adopterEmail} sobre dictamen de hito para ${event.petName} (Aprobado: ${event.isApproved}).`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.emailService.sendFollowUpReviewEmail(event.adopterEmail, {
        userId: event.adopterId,
        adopterName: event.adopterName,
        petName: event.petName,
        milestoneDays: event.milestoneType === '30_days' ? 30 : event.milestoneType === '90_days' ? 90 : 180,
        isApproved: event.isApproved,
        reviewNotes: event.reviewNotes,
        actionUrl: `${frontendUrl}/follow-up`,
      });
    } catch (err: any) {
      this.logger.error(`Error enviando email de dictamen a ${event.adopterEmail}: ${err.message}`);
    }
  }

  @OnEvent(FollowUpCompletedEvent.EVENT_NAME, { async: true })
  async handleFollowUpCompleted(event: FollowUpCompletedEvent): Promise<void> {
    this.logger.log(
      `Notificando constancia formal de adopción a ${event.adopterEmail} para ${event.petName} (Código: ${event.certificateCode}).`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.emailService.sendFollowUpCompletedEmail(event.adopterEmail, {
        userId: event.adopterId,
        adopterName: event.adopterName,
        petName: event.petName,
        certificateCode: event.certificateCode,
        shelterName: event.shelterName,
        actionUrl: `${frontendUrl}/follow-up`,
      });
    } catch (err: any) {
      this.logger.error(`Error enviando email de constancia a ${event.adopterEmail}: ${err.message}`);
    }
  }

  @OnEvent(PetReturnRequestedEvent.EVENT_NAME, { async: true })
  async handlePetReturnRequested(event: PetReturnRequestedEvent): Promise<void> {
    this.logger.log(
      `Notificando al albergue ${event.shelterEmail} sobre solicitud de retorno para ${event.petName}.`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.emailService.sendPetReturnNotificationEmail(event.shelterEmail, {
        userId: event.shelterId,
        recipientName: 'Equipo del Albergue',
        petName: event.petName,
        isCompleted: false,
        reasonText: `${event.reason}: ${event.explanation}`,
        actionUrl: `${frontendUrl}/follow-up`,
      });
    } catch (err: any) {
      this.logger.error(`Error enviando aviso de retorno a ${event.shelterEmail}: ${err.message}`);
    }
  }

  @OnEvent(PetReturnCompletedEvent.EVENT_NAME, { async: true })
  async handlePetReturnCompleted(event: PetReturnCompletedEvent): Promise<void> {
    this.logger.log(
      `Notificando resolución de retorno a adoptante ${event.adopterEmail} para ${event.petName}.`,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.emailService.sendPetReturnNotificationEmail(event.adopterEmail, {
        userId: event.adopterId,
        recipientName: event.adopterName,
        petName: event.petName,
        isCompleted: true,
        isAccepted: event.isAccepted,
        actionUrl: `${frontendUrl}/follow-up`,
      });
    } catch (err: any) {
      this.logger.error(`Error enviando aviso de fin de retorno a ${event.adopterEmail}: ${err.message}`);
    }
  }
}
