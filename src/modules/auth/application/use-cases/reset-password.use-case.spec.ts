import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';
import { HashingService } from '../interfaces/hashing.service';
import { ResetPasswordUseCase } from './reset-password.use-case';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  const mockUserRepository = {
    findByPasswordResetTokenHash: jest.fn(),
    save: jest.fn(),
  };
  const mockHashingService = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  it('should throw InvalidOrExpiredTokenException if token hash not found', async () => {
    mockUserRepository.findByPasswordResetTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'invalid-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(InvalidOrExpiredTokenException);
  });

  it('should throw InvalidOrExpiredTokenException if reset token expired', async () => {
    const user = new User();
    user.passwordResetExpiresAt = new Date(Date.now() - 1000);
    mockUserRepository.findByPasswordResetTokenHash.mockResolvedValue(user);

    await expect(
      useCase.execute({ token: 'expired-token', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(InvalidOrExpiredTokenException);
  });

  it('should update password and revoke active sessions on valid reset token', async () => {
    const rawToken = 'valid-reset-token';
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = new User();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 20 * 60 * 1000);
    user.refreshTokenHash = 'active-session-hash';

    mockUserRepository.findByPasswordResetTokenHash.mockResolvedValue(user);
    mockHashingService.hash.mockResolvedValue('hashed-new-password');
    mockUserRepository.save.mockResolvedValue(user);

    const result = await useCase.execute({
      token: rawToken,
      newPassword: 'NewPassword123!',
    });

    expect(result.message).toContain('Contraseña restablecida exitosamente');
    expect(user.passwordHash).toBe('hashed-new-password');
    expect(user.passwordResetTokenHash).toBeNull();
    expect(user.passwordResetExpiresAt).toBeNull();
    expect(user.refreshTokenHash).toBeNull(); // US-04 Escenario 2: Revocación de sesiones activas
    expect(user.isEmailVerified).toBe(true);
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
