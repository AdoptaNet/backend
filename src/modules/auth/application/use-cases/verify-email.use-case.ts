import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

    this.eventEmitter.emit(
      UserRegisteredEvent.EVENT_NAME,
      new UserRegisteredEvent(
        user.id,
        user.email,
        user.fullName ?? null,
        user.role,
      ),
    );

    return { message: 'Cuenta activada exitosamente' };
  }
}
