import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';

@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token.trim())
      .digest('hex');

    const user =
      await this.userRepository.findByVerificationTokenHash(tokenHash);
    if (!user) {
      throw new InvalidOrExpiredTokenException();
    }

    if (
      user.emailVerificationExpiresAt &&
      new Date() > user.emailVerificationExpiresAt
    ) {
      throw new InvalidOrExpiredTokenException(
        'El enlace de verificación ha expirado. Por favor solicita uno nuevo.',
      );
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;

    await this.userRepository.save(user);

    return { message: 'Cuenta activada exitosamente' };
  }
}
