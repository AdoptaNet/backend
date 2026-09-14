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
} from '../../application/interfaces/email.service';
import { WelcomeEmailTemplate } from '../../presentation/templates/welcome-email.template';

@Injectable()
export class ResendEmailService implements EmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
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
   * Envía un correo electrónico renderizando la plantilla TSX y despachando vía Resend API.
   * Si no hay API Key configurada, realiza una simulación segura registrando los detalles en el logger.
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, template, text } = options;

    const html = await this.renderTemplate(template);

    if (!this.resend) {
      this.logger.log(
        `[DRY-RUN EMAIL] Para: ${Array.isArray(to) ? to.join(', ') : to} | Asunto: "${subject}" | Longitud HTML: ${html.length} caracteres`,
      );
      return {
        id: 'dry-run-preview-id',
        success: true,
      };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        for (const tos of Array.isArray(to) ? to : [to]) {
          this.logger.error(
            `Error al enviar correo vía Resend a ${tos}: ${error.message}`,
          );
        }
        return {
          success: false,
        };
      }

      for (const tos of Array.isArray(to) ? to : [to]) {
        this.logger.log(
          `Correo enviado con éxito a ${tos}. Resend ID: ${data?.id}`,
        );
      }

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

    return await this.sendEmail({
      to,
      subject: '🐾 ¡Te damos la bienvenida a Adoptanet!',
      template,
    });
  }
}
