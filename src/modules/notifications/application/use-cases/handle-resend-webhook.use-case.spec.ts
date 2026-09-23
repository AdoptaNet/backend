import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationStatus } from '../../domain/value-objects/notification-status.enum';
import { HandleResendWebhookUseCase } from './handle-resend-webhook.use-case';

describe('HandleResendWebhookUseCase', () => {
  let useCase: HandleResendWebhookUseCase;
  const mockNotificationRepository = {
    findByExternalId: jest.fn(),
    save: jest.fn(async (n) => n),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleResendWebhookUseCase,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RESEND_WEBHOOK_SECRET') return undefined; // No secret in default test
              return null;
            }),
          },
        },
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    useCase = module.get<HandleResendWebhookUseCase>(
      HandleResendWebhookUseCase,
    );
  });

  it('should update notification status to DELIVERED on email.delivered event', async () => {
    const notification = new Notification();
    notification.id = 'notif-1';
    notification.externalId = 're_123456';
    notification.status = NotificationStatus.SENT;

    mockNotificationRepository.findByExternalId.mockResolvedValue(notification);

    const payload = {
      type: 'email.delivered',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_123456',
        from: 'AdoptaNet <notificaciones@adoptanet.pe>',
        to: ['adopter@example.com'],
        subject: 'Bienvenido',
      },
    };

    const result = await useCase.execute(payload, {});

    expect(result.received).toBe(true);
    expect(result.status).toBe(NotificationStatus.DELIVERED);
    expect(notification.status).toBe(NotificationStatus.DELIVERED);
    expect(mockNotificationRepository.save).toHaveBeenCalledWith(notification);
  });

  it('should update notification status to BOUNCED on email.bounced event', async () => {
    const notification = new Notification();
    notification.id = 'notif-2';
    notification.externalId = 're_654321';
    notification.status = NotificationStatus.SENT;

    mockNotificationRepository.findByExternalId.mockResolvedValue(notification);

    const payload = {
      type: 'email.bounced',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_654321',
        bounce_type: 'permanent',
        message: 'Mailbox not found',
      },
    };

    const result = await useCase.execute(payload, {});

    expect(result.received).toBe(true);
    expect(result.status).toBe(NotificationStatus.BOUNCED);
    expect(notification.status).toBe(NotificationStatus.BOUNCED);
    expect(notification.errorMessage).toBe('Mailbox not found');
  });

  it('should update notification status to OPENED and mark isRead on email.opened event', async () => {
    const notification = new Notification();
    notification.id = 'notif-open';
    notification.externalId = 're_open123';
    notification.status = NotificationStatus.DELIVERED;
    notification.isRead = false;

    mockNotificationRepository.findByExternalId.mockResolvedValue(notification);

    const payload = {
      type: 'email.opened',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_open123',
      },
    };

    const result = await useCase.execute(payload, {});

    expect(result.received).toBe(true);
    expect(result.status).toBe(NotificationStatus.OPENED);
    expect(notification.status).toBe(NotificationStatus.OPENED);
    expect(notification.isRead).toBe(true);
    expect(notification.readAt).toBeDefined();
    expect(mockNotificationRepository.save).toHaveBeenCalledWith(notification);
  });

  it('should update notification status to COMPLAINED on email.complained event', async () => {
    const notification = new Notification();
    notification.id = 'notif-spam';
    notification.externalId = 're_spam123';
    notification.status = NotificationStatus.DELIVERED;

    mockNotificationRepository.findByExternalId.mockResolvedValue(notification);

    const payload = {
      type: 'email.complained',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_spam123',
      },
    };

    const result = await useCase.execute(payload, {});

    expect(result.received).toBe(true);
    expect(result.status).toBe(NotificationStatus.COMPLAINED);
    expect(notification.status).toBe(NotificationStatus.COMPLAINED);
    expect(mockNotificationRepository.save).toHaveBeenCalledWith(notification);
  });

  it('should safely ignore event if notification is not found in database', async () => {
    mockNotificationRepository.findByExternalId.mockResolvedValue(null);

    const payload = {
      type: 'email.delivered',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_unknown',
      },
    };

    const result = await useCase.execute(payload, {});

    expect(result.received).toBe(true);
    expect(mockNotificationRepository.save).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if RESEND_WEBHOOK_SECRET is set and signature is invalid', async () => {
    const moduleWithSecret = await Test.createTestingModule({
      providers: [
        HandleResendWebhookUseCase,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RESEND_WEBHOOK_SECRET')
                return 'whsec_testsecret1234567890';
              return null;
            }),
          },
        },
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    const useCaseWithSecret = moduleWithSecret.get<HandleResendWebhookUseCase>(
      HandleResendWebhookUseCase,
    );

    const payload = { type: 'email.delivered' };
    const invalidHeaders = {
      'svix-id': 'msg_1',
      'svix-timestamp': '123456',
      'svix-signature': 'v1,invalid_sig',
    };

    await expect(
      useCaseWithSecret.execute(payload, invalidHeaders),
    ).rejects.toThrow(UnauthorizedException);
  });
});
