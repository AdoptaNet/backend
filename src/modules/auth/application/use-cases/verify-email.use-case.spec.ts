import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';
import { VerifyEmailUseCase } from './verify-email.use-case';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  const mockUserRepository = {
    findByVerificationTokenHash: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<VerifyEmailUseCase>(VerifyEmailUseCase);
  });

  it('should throw InvalidOrExpiredTokenException if token hash does not match any user', async () => {
    mockUserRepository.findByVerificationTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'non-existent-token' }),
    ).rejects.toThrow(InvalidOrExpiredTokenException);
  });

  it('should throw InvalidOrExpiredTokenException if token has expired', async () => {
    const user = new User();
    user.emailVerificationExpiresAt = new Date(Date.now() - 1000); // 1 sec in past
    mockUserRepository.findByVerificationTokenHash.mockResolvedValue(user);

    await expect(
      useCase.execute({ token: 'expired-token' }),
    ).rejects.toThrow(InvalidOrExpiredTokenException);
  });

  it('should activate user and clean token on valid token verification', async () => {
    const rawToken = 'valid-token-12345';
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = new User();
    user.isEmailVerified = false;
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpiresAt = new Date(Date.now() + 100000);

    mockUserRepository.findByVerificationTokenHash.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue(user);

    const result = await useCase.execute({ token: rawToken });

    expect(result.message).toContain('Cuenta activada exitosamente');
    expect(user.isEmailVerified).toBe(true);
    expect(user.emailVerifiedAt).toBeInstanceOf(Date);
    expect(user.emailVerificationTokenHash).toBeNull();
    expect(user.emailVerificationExpiresAt).toBeNull();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
