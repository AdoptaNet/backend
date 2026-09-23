import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RateLimitExceededException } from '../../domain/exceptions/rate-limit-exceeded.exception';
import { ResendVerificationDto } from '../dtos/resend-verification.dto';

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: ResendVerificationDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(email);

    // Prevención de enumeración de usuarios
    if (!user) {
      return {
        message:
          'Si la dirección está registrada y pendiente de verificación, recibirás un nuevo enlace.',
      };
    }

    if (user.isEmailVerified) {
      return {
        message:
          'Tu cuenta ya se encuentra verificada. Puedes iniciar sesión normalmente.',
      };
    }

    // Control de abuso (Rate Limiting de 2 minutos)
    if (user.emailVerificationExpiresAt) {
      const issuedAt =
        user.emailVerificationExpiresAt.getTime() - 24 * 60 * 60 * 1000;
      const elapsedMs = Date.now() - issuedAt;
      const twoMinutesMs = 2 * 60 * 1000;

      if (elapsedMs < twoMinutesMs) {
        const remainingSeconds = Math.ceil((twoMinutesMs - elapsedMs) / 1000);
        throw new RateLimitExceededException(
          `Debes esperar ${remainingSeconds} segundos antes de solicitar un nuevo enlace de verificación.`,
        );
      }
    }

    // Generar nuevo token seguro y actualizar hash (invalida el anterior)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpiresAt = expiresAt;
    await this.userRepository.save(user);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const verificationUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

    await this.emailService.sendEmailVerification(user.email, {
      userId: user.id,
      fullName: user.fullName,
      verificationUrl,
    });

    return {
      message:
        'Si la dirección está registrada y pendiente de verificación, recibirás un nuevo enlace.',
    };
  }
}
