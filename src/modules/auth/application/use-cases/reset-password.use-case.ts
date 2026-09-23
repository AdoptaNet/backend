import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { HashingService } from '../interfaces/hashing.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token.trim())
      .digest('hex');

    const user =
      await this.userRepository.findByPasswordResetTokenHash(tokenHash);
    if (!user) {
      throw new InvalidOrExpiredTokenException(
        'El enlace de restablecimiento es inválido o ya ha sido utilizado.',
      );
    }

    if (
      user.passwordResetExpiresAt &&
      new Date() > user.passwordResetExpiresAt
    ) {
      throw new InvalidOrExpiredTokenException(
        'El enlace de restablecimiento ha expirado. Por favor solicita uno nuevo.',
      );
    }

    // Hashear nueva contraseña con bcrypt
    user.passwordHash = await this.hashingService.hash(dto.newPassword);

    // Limpiar tokens de recuperación y revocar sesiones activas (US-04 Escenario 2)
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.refreshTokenHash = null;
    user.isEmailVerified = true;

    await this.userRepository.save(user);

    return {
      message:
        'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    };
  }
}
