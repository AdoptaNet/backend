import { Test, TestingModule } from '@nestjs/testing';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { EmailService } from '../interfaces/email.service';
import { AuthNotificationListener } from './auth-notification.listener';

describe('AuthNotificationListener', () => {
  let listener: AuthNotificationListener;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    mockEmailService = {
      sendEmail: jest.fn(),
      renderTemplate: jest.fn(),
      sendWelcomeEmail: jest
        .fn()
        .mockResolvedValue({ id: 'msg-1', success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthNotificationListener,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    listener = module.get<AuthNotificationListener>(AuthNotificationListener);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('should call emailService.sendWelcomeEmail when user.registered event is received', async () => {
    const event = new UserRegisteredEvent(
      'uuid-123',
      'carlos@example.com',
      'Carlos Mendoza',
      UserRole.ADOPTER,
    );

    await listener.handleUserRegistered(event);

    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      'carlos@example.com',
      {
        userId: 'uuid-123',
        fullName: 'Carlos Mendoza',
        role: UserRole.ADOPTER,
      },
    );
  });

  it('should not throw if emailService.sendWelcomeEmail fails', async () => {
    mockEmailService.sendWelcomeEmail.mockRejectedValue(
      new Error('Resend error'),
    );

    const event = new UserRegisteredEvent(
      'uuid-123',
      'carlos@example.com',
      'Carlos Mendoza',
      UserRole.SHELTER,
    );

    await expect(listener.handleUserRegistered(event)).resolves.not.toThrow();
  });
});
