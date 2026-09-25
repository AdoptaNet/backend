import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { ForgotPasswordUseCase } from './forgot-password.use-case';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };
  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3001'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
  });

  it('should return uniform message and not send email if user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'nonexistent@example.com' });
    expect(result.message).toContain('Si el correo electrónico está registrado');
    expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should generate reset token and send email if user is active and exists', async () => {
    const user = new User();
    user.id = 'user-1';
    user.email = 'user@example.com';
    user.isActive = true;
    user.deletedAt = null;

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue(user);
    mockEmailService.sendPasswordResetEmail.mockResolvedValue({
      success: true,
    });

    const result = await useCase.execute({ email: 'user@example.com' });

    expect(result.message).toContain('Si el correo electrónico está registrado');
    expect(user.passwordResetTokenHash).toBeDefined();
    expect(user.passwordResetExpiresAt).toBeDefined();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({
        userId: 'user-1',
        resetUrl: expect.stringContaining('/reset-password?token='),
      }),
    );
  });
});
