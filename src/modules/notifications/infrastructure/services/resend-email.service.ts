import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import * as React from 'react';
import { Resend } from 'resend';
import {
  EmailService,
  SendEmailOptions,
  SendEmailResult,
  SendWelcomeEmailData,
  SendEmailVerificationData,
  SendPasswordResetData,
  SendShelterVerificationData,
} from '../../application/interfaces/email.service';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationChannel } from '../../domain/value-objects/notification-channel.enum';
import { NotificationStatus } from '../../domain/value-objects/notification-status.enum';
import { NotificationType } from '../../domain/value-objects/notification-type.enum';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { WelcomeEmailTemplate } from '../../presentation/templates/welcome-email.template';
import { EmailVerificationTemplate } from '../../presentation/templates/email-verification.template';
import { PasswordResetTemplate } from '../../presentation/templates/password-reset.template';
import { ShelterVerificationTemplate } from '../../presentation/templates/shelter-verification.template';

@Injectable()
export class ResendEmailService implements EmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationRepository: NotificationRepository,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ??
      'Adoptanet <onboarding@resend.dev>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY no configurada. El servicio de correo operará en modo simulación (dry-run).',
      );
    }
  }

  /**
   * Renderiza un componente React Email (.tsx) a un string HTML compatible con clientes de correo.
   */
  async renderTemplate(template: React.ReactElement): Promise<string> {
    return await render(template);
  }

  /**
   * Envía un correo electrónico registrando su ciclo de vida en la base de datos (Notification).
   * Si no hay API Key configurada, realiza una simulación segura registrando los detalles en BD y logger.
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, template, text, userId, type, metadata } = options;
    const recipientEmail = Array.isArray(to) ? to[0] : to;

    const html = await this.renderTemplate(template);

    // 1. Persistir estado inicial PENDING en base de datos
    let notification = this.notificationRepository.create({
      userId: userId ?? null,
      recipientEmail,
      subject,
      body: text ?? subject,
      type: type ?? NotificationType.CUSTOM,
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.PENDING,
      metadata: metadata ?? null,
      isRead: false,
    });
    notification = await this.notificationRepository.save(notification);

    // 2. Si no hay cliente Resend (modo desarrollo/dry-run)
    if (!this.resend) {
      this.logger.log(
        `[DRY-RUN EMAIL] Para: ${Array.isArray(to) ? to.join(', ') : to} | Asunto: "${subject}" | Longitud HTML: ${html.length} caracteres`,
      );

      notification.status = NotificationStatus.SENT;
      notification.externalId = 'dry-run-preview-id';
      notification.sentAt = new Date();
      await this.notificationRepository.save(notification);

      return {
        id: notification.externalId,
        success: true,
      };
    }

    // 3. Despacho vía Resend API
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.error(
          `Error al enviar correo vía Resend a ${recipientEmail}: ${error.message}`,
        );

        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = error.message;
        await this.notificationRepository.save(notification);

        return {
          success: false,
        };
      }

      this.logger.log(
        `Correo enviado con éxito a ${recipientEmail}. Resend ID: ${data?.id}`,
      );

      notification.status = NotificationStatus.SENT;
      notification.externalId = data?.id ?? null;
      notification.sentAt = new Date();
      await this.notificationRepository.save(notification);

      return {
        id: data?.id,
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(
        `Excepción no controlada enviando correo vía Resend: ${errorMessage}`,
      );

      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = errorMessage;
      await this.notificationRepository.save(notification);

      return {
        success: false,
      };
    }
  }

  /**
   * Envía el correo de bienvenida personalizado según el rol del usuario registrado.
   */
  async sendWelcomeEmail(
    to: string,
    data: SendWelcomeEmailData,
  ): Promise<SendEmailResult> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const template = React.createElement(WelcomeEmailTemplate, {
      fullName: data.fullName,
      role: data.role,
      frontendUrl,
    });

    const isAdopter = data.role === UserRole.ADOPTER;
    const subject = isAdopter
      ? '🐾 ¡Te damos la bienvenida a Adoptanet! Encuentra a tu compañero ideal'
      : '🏡 ¡Te damos la bienvenida a Adoptanet! Gestiona tu albergue y rescates';

    return await this.sendEmail({
      to,
      subject,
      template,
      userId: data.userId,
      type: NotificationType.WELCOME,
      metadata: { role: data.role },
    });
  }

  /**
   * Envía el correo de verificación para activar la cuenta de un usuario recién registrado (US-01).
   */
  async sendEmailVerification(
    to: string,
    data: SendEmailVerificationData,
  ): Promise<SendEmailResult> {
    const template = React.createElement(EmailVerificationTemplate, {
      fullName: data.fullName,
      verificationUrl: data.verificationUrl,
    });

    return await this.sendEmail({
      to,
      subject: '✉️ Confirma tu correo para activar tu cuenta en Adoptanet',
      template,
      userId: data.userId,
      type: NotificationType.EMAIL_VERIFICATION,
    });
  }

  /**
   * Envía el correo con enlace seguro para restablecer la contraseña (US-04).
   */
  async sendPasswordResetEmail(
    to: string,
    data: SendPasswordResetData,
  ): Promise<SendEmailResult> {
    const template = React.createElement(PasswordResetTemplate, {
      fullName: data.fullName,
      resetUrl: data.resetUrl,
    });

    return await this.sendEmail({
      to,
      subject: '🔑 Restablece tu contraseña en Adoptanet',
      template,
      userId: data.userId,
      type: NotificationType.PASSWORD_RESET,
    });
  }

  /**
   * Envía la notificación de verificación o acreditación oficial a un albergue (US-08).
   */
  async sendShelterVerificationEmail(
    to: string,
    data: SendShelterVerificationData,
  ): Promise<SendEmailResult> {
    const template = React.createElement(ShelterVerificationTemplate, {
      organizationName: data.organizationName,
      isVerified: data.isVerified,
      shelterUrl: data.shelterUrl,
    });

    const subject = data.isVerified
      ? '🎉 ¡Tu albergue ha sido verificado en AdoptaNet!'
      : 'ℹ️ Actualización del estado de verificación de tu albergue';

    return await this.sendEmail({
      to,
      subject,
      template,
      userId: data.userId,
      type: NotificationType.SHELTER_VERIFIED,
      metadata: { isVerified: data.isVerified },
    });
  }
}

