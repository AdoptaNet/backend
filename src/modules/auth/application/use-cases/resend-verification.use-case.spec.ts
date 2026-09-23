import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RateLimitExceededException } from '../../domain/exceptions/rate-limit-exceeded.exception';
import { ResendVerificationUseCase } from './resend-verification.use-case';

describe('ResendVerificationUseCase', () => {
  let useCase: ResendVerificationUseCase;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };
  const mockEmailService = {
    sendEmailVerification: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3001'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendVerificationUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<ResendVerificationUseCase>(ResendVerificationUseCase);
  });

  it('should return uniform message if user not found (enumeration defense)', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'unknown@example.com' });
    expect(result.message).toContain('Si la dirección está registrada');
    expect(mockEmailService.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('should return already verified message if user is already verified', async () => {
    const user = new User();
    user.email = 'verified@example.com';
    user.isEmailVerified = true;
    mockUserRepository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute({ email: 'verified@example.com' });
    expect(result.message).toContain('ya se encuentra verificada');
    expect(mockEmailService.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('should throw RateLimitExceededException if requested within 2 minutes of prior token', async () => {
    const user = new User();
    user.email = 'pending@example.com';
    user.isEmailVerified = false;
    // Issued 30 seconds ago (expires in 24h - 30s)
    user.emailVerificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 30 * 1000,
    );
    mockUserRepository.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute({ email: 'pending@example.com' }),
    ).rejects.toThrow(RateLimitExceededException);
  });

  it('should regenerate token and dispatch email if more than 2 minutes have passed', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.email = 'pending@example.com';
    user.isEmailVerified = false;
    // Issued 5 minutes ago
    user.emailVerificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 5 * 60 * 1000,
    );
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue(user);
    mockEmailService.sendEmailVerification.mockResolvedValue({ success: true });

    const result = await useCase.execute({ email: 'pending@example.com' });

    expect(result.message).toContain('Si la dirección está registrada');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(mockEmailService.sendEmailVerification).toHaveBeenCalledWith(
      'pending@example.com',
      expect.objectContaining({
        userId: 'uuid-1',
        verificationUrl: expect.stringContaining('/verify-email?token='),
      }),
    );
  });
});
