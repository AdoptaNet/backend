import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { EmailService } from '../interfaces/email.service';

@Injectable()
export class AuthNotificationListener {
  private readonly logger = new Logger(AuthNotificationListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent(UserRegisteredEvent.EVENT_NAME, { async: true })
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(
      `Procesando notificación de bienvenida para el usuario: ${event.email} (Rol: ${event.role})`,
    );

    try {
      await this.emailService.sendWelcomeEmail(event.email, {
        userId: event.userId,
        fullName: event.fullName,
        role: event.role,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Fallo al enviar correo de bienvenida a ${event.email}: ${message}`,
      );
    }
  }
}
