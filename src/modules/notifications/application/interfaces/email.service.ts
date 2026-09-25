import * as React from 'react';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { NotificationType } from '../../domain/value-objects/notification-type.enum';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: React.ReactElement;
  text?: string;
  userId?: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
}

export interface SendEmailResult {
  id?: string;
  success: boolean;
}

export interface SendWelcomeEmailData {
  userId?: string;
  fullName?: string | null;
  role: UserRole;
}

export interface SendEmailVerificationData {
  userId?: string;
  fullName?: string | null;
  verificationUrl: string;
}

export interface SendPasswordResetData {
  userId?: string;
  fullName?: string | null;
  resetUrl: string;
}

export interface SendShelterVerificationData {
  userId?: string;
  organizationName?: string | null;
  isVerified: boolean;
  shelterUrl: string;
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
  abstract sendEmailVerification(
    to: string,
    data: SendEmailVerificationData,
  ): Promise<SendEmailResult>;
  abstract sendPasswordResetEmail(
    to: string,
    data: SendPasswordResetData,
  ): Promise<SendEmailResult>;
  abstract sendShelterVerificationEmail(
    to: string,
    data: SendShelterVerificationData,
  ): Promise<SendEmailResult>;
}
