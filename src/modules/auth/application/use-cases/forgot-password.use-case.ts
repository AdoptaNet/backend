import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(email);

    if (user && user.isActive && !user.deletedAt) {
      // Token seguro aleatorio con expiración de 30 minutos (US-04 Escenario 1)
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = expiresAt;
      await this.userRepository.save(user);

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      await this.emailService.sendPasswordResetEmail(user.email, {
        userId: user.id,
        fullName: user.fullName,
        resetUrl,
      });
    }

    // Mensaje uniforme para prevenir la enumeración de usuarios
    return {
      message:
        'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.',
    };
  }
}
