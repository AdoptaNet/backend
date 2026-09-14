import * as React from 'react';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: React.ReactElement;
  text?: string;
}

export interface SendEmailResult {
  id?: string;
  success: boolean;
}

export interface SendWelcomeEmailData {
  fullName?: string | null;
  role: UserRole;
}

/**
 * Contrato abstracto del servicio de correo electrónico (Clean Architecture).
 * Desacopla la lógica de negocio de la implementación de despacho (Resend, etc.).
 */
export abstract class EmailService {
  abstract sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
  abstract renderTemplate(template: React.ReactElement): Promise<string>;
  abstract sendWelcomeEmail(
    to: string,
    data: SendWelcomeEmailData,
  ): Promise<SendEmailResult>;
}
