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

export interface SendNewAdoptionRequestData {
  userId?: string;
  petName: string;
  adopterName: string;
  applicationUrl: string;
}

export interface SendAdoptionStatusChangedData {
  userId?: string;
  adopterName: string;
  petName: string;
  isApproved: boolean;
  rejectionReasonText?: string | null;
  rejectionNotes?: string | null;
  actionUrl: string;
}

export interface SendFollowUpReminderData {
  userId?: string;
  adopterName: string;
  petName: string;
  milestoneDays: number;
  dueDate: string;
  actionUrl: string;
}

export interface SendMilestoneSubmittedData {
  userId?: string;
  shelterName?: string | null;
  adopterName: string;
  petName: string;
  milestoneDays: number;
  actionUrl: string;
}

export interface SendFollowUpOverdueData {
  userId?: string;
  adopterName: string;
  petName: string;
  milestoneDays: number;
  dueDate: string;
  actionUrl: string;
}

export interface SendFollowUpReviewData {
  userId?: string;
  adopterName: string;
  petName: string;
  milestoneDays: number;
  isApproved: boolean;
  reviewNotes?: string | null;
  actionUrl: string;
}

export interface SendFollowUpCompletedData {
  userId?: string;
  adopterName: string;
  petName: string;
  certificateCode: string;
  shelterName: string;
  actionUrl: string;
}

export interface SendPetReturnNotificationData {
  userId?: string;
  recipientName: string;
  petName: string;
  isCompleted: boolean;
  isAccepted?: boolean;
  reasonText?: string;
  actionUrl: string;
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
  abstract sendNewAdoptionRequestEmail(
    to: string,
    data: SendNewAdoptionRequestData,
  ): Promise<SendEmailResult>;
  abstract sendAdoptionStatusChangedEmail(
    to: string,
    data: SendAdoptionStatusChangedData,
  ): Promise<SendEmailResult>;
  abstract sendFollowUpReminderEmail(
    to: string,
    data: SendFollowUpReminderData,
  ): Promise<SendEmailResult>;
  abstract sendMilestoneSubmittedEmail(
    to: string,
    data: SendMilestoneSubmittedData,
  ): Promise<SendEmailResult>;
  abstract sendFollowUpOverdueEmail(
    to: string,
    data: SendFollowUpOverdueData,
  ): Promise<SendEmailResult>;
  abstract sendFollowUpReviewEmail(
    to: string,
    data: SendFollowUpReviewData,
  ): Promise<SendEmailResult>;
  abstract sendFollowUpCompletedEmail(
    to: string,
    data: SendFollowUpCompletedData,
  ): Promise<SendEmailResult>;
  abstract sendPetReturnNotificationEmail(
    to: string,
    data: SendPetReturnNotificationData,
  ): Promise<SendEmailResult>;
}
