import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationStatus } from '../../domain/value-objects/notification-status.enum';

export interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    message?: string;
    bounce_type?: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class HandleResendWebhookUseCase {
  private readonly logger = new Logger(HandleResendWebhookUseCase.name);
  private readonly webhookSecret: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationRepository: NotificationRepository,
  ) {
    this.webhookSecret = this.configService.get<string>(
      'RESEND_WEBHOOK_SECRET',
    );
  }

  /**
   * Verifica la firma Svix (estándar de Resend) utilizando Node.js crypto.
   * Evita problemas de interoperabilidad ESM de la biblioteca svix en entornos CommonJS/Jest.
   */
  private verifySignature(
    secret: string,
    payloadString: string,
    headers: Record<string, string | string[] | undefined>,
  ): boolean {
    const svixId = (headers['svix-id'] || headers['Svix-Id']) as string;
    const svixTimestamp = (headers['svix-timestamp'] ||
      headers['Svix-Timestamp']) as string;
    const svixSignature = (headers['svix-signature'] ||
      headers['Svix-Signature']) as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return false;
    }

    try {
      const cleanSecret = secret.startsWith('whsec_')
        ? secret.slice(6)
        : secret;
      const secretKey = Buffer.from(cleanSecret, 'base64');
      const toSign = `${svixId}.${svixTimestamp}.${payloadString}`;
      const expectedSig = crypto
        .createHmac('sha256', secretKey)
        .update(toSign)
        .digest('base64');

      const signatures = svixSignature.split(' ');
      return signatures.some((sig) => {
        const parts = sig.split(',');
        if (parts.length < 2 || parts[0] !== 'v1') return false;
        const actualSig = parts[1];

        const bufA = Buffer.from(actualSig);
        const bufB = Buffer.from(expectedSig);
        return (
          bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
        );
      });
    } catch {
      return false;
    }
  }

  async execute(
    payload: unknown,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ received: boolean; status?: string }> {
    const rawPayload =
      typeof payload === 'string'
        ? payload
        : Buffer.isBuffer(payload)
          ? payload.toString('utf8')
          : JSON.stringify(payload);

    // 1. Verificación criptográfica con Svix si el secreto está configurado
    if (this.webhookSecret) {
      const isValid = this.verifySignature(
        this.webhookSecret,
        rawPayload,
        headers,
      );
      if (!isValid) {
        this.logger.error(
          'Fallo en la verificación de firma del webhook de Resend',
        );
        throw new UnauthorizedException('Firma de webhook inválida');
      }
    } else {
      this.logger.warn(
        'RESEND_WEBHOOK_SECRET no configurada. Omitiendo validación de firma en entorno de desarrollo.',
      );
    }

    const event: ResendWebhookEvent =
      typeof payload === 'string'
        ? JSON.parse(payload)
        : Buffer.isBuffer(payload)
          ? JSON.parse(payload.toString('utf8'))
          : payload;

    if (!event || !event.type) {
      return { received: false };
    }

    const emailId = event.data?.email_id || event.data?.id;
    if (!emailId) {
      this.logger.debug(`Evento de Resend sin email_id: tipo ${event.type}`);
      return { received: true };
    }

    // 2. Buscar notificación en base de datos por el externalId (ID devuelto por Resend)
    const notification =
      await this.notificationRepository.findByExternalId(emailId);

    if (!notification) {
      this.logger.debug(
        `Notificación no encontrada en base de datos para externalId: ${emailId}`,
      );
      return { received: true };
    }

    // 3. Actualizar ciclo de vida según el evento de Resend
    switch (event.type) {
      case 'email.delivered':
        notification.status = NotificationStatus.DELIVERED;
        await this.notificationRepository.save(notification);
        this.logger.log(
          `Notificación ${notification.id} (externalId: ${emailId}) actualizada a DELIVERED`,
        );
        return { received: true, status: NotificationStatus.DELIVERED };

      case 'email.opened':
        notification.status = NotificationStatus.OPENED;
        notification.isRead = true;
        notification.readAt = notification.readAt ?? new Date();
        await this.notificationRepository.save(notification);
        this.logger.log(
          `Notificación ${notification.id} (externalId: ${emailId}) abierta por el destinatario (OPENED)`,
        );
        return { received: true, status: NotificationStatus.OPENED };

      case 'email.bounced':
        notification.status = NotificationStatus.BOUNCED;
        notification.errorMessage =
          event.data?.message || event.data?.bounce_type || 'Correo rebotado';
        await this.notificationRepository.save(notification);
        this.logger.warn(
          `Notificación ${notification.id} (externalId: ${emailId}) rebotó: ${notification.errorMessage}`,
        );
        return { received: true, status: NotificationStatus.BOUNCED };

      case 'email.complained':
        notification.status = NotificationStatus.COMPLAINED;
        notification.errorMessage = 'Reportado como spam por el destinatario';
        await this.notificationRepository.save(notification);
        this.logger.warn(
          `Notificación ${notification.id} (externalId: ${emailId}) reportada como spam (COMPLAINED)`,
        );
        return { received: true, status: NotificationStatus.COMPLAINED };

      default:
        this.logger.debug(
          `Evento no procesable para cambio de estado: ${event.type}`,
        );
        return { received: true };
    }
  }
}
