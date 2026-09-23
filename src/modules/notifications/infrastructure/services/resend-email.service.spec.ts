import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { EmailService } from '../../application/interfaces/email.service';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { SampleEmailTemplate } from '../../presentation/templates/sample-email.template';
import { ResendEmailService } from './resend-email.service';

jest.mock('@react-email/components', () => {
  const actual = jest.requireActual('@react-email/components');
  return {
    ...actual,
    render: jest.fn(async (element: React.ReactElement) => {
      return ReactDOMServer.renderToStaticMarkup(element);
    }),
  };
});

describe('ResendEmailService', () => {
  let service: ResendEmailService;
  let configService: ConfigService;
  const mockNotificationRepository = {
    create: jest.fn((data) => ({
      ...data,
      id: 'notif-1',
      isRead: false,
      createdAt: new Date(),
    })),
    save: jest.fn(async (data) => data),
    findById: jest.fn(),
    findByExternalId: jest.fn(),
    findByUserId: jest.fn(),
    findUnreadByUserId: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendEmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RESEND_API_KEY') return undefined; // dry-run mode for tests
              if (key === 'EMAIL_FROM') return 'Adoptanet <test@adoptanet.pe>';
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

    service = module.get<ResendEmailService>(ResendEmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should render a React Email template to an HTML string containing Adoptanet branding', async () => {
    const template = React.createElement(SampleEmailTemplate, {
      title: '¡Bienvenido a Adoptanet!',
      name: 'María',
      message: 'Tu cuenta ha sido activada con éxito.',
    });

    const html = await service.renderTemplate(template);

    expect(html).toContain('🐾 AdoptaNet');
    expect(html).toContain('¡Hola, <strong>María</strong>!');
    expect(html).toContain('Tu cuenta ha sido activada con éxito.');
    expect(html).toContain('Ver en la plataforma');
    expect(html).toContain('©');
  });

  it('should perform a dry-run send when RESEND_API_KEY is not configured', async () => {
    const template = React.createElement(SampleEmailTemplate, {
      title: 'Prueba Dry-Run',
      name: 'Tester',
    });

    const result = await service.sendEmail({
      to: 'tester@example.com',
      subject: 'Prueba de correo',
      template,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dry-run-preview-id');
  });

  it('should send welcome email for an adopter successfully in dry-run mode', async () => {
    const result = await service.sendWelcomeEmail('adopter@example.com', {
      fullName: 'Ana Sofía',
      role: UserRole.ADOPTER,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dry-run-preview-id');
  });

  it('should send welcome email for a shelter successfully in dry-run mode', async () => {
    const result = await service.sendWelcomeEmail('shelter@example.com', {
      fullName: 'Albergue Huellitas',
      role: UserRole.SHELTER,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('dry-run-preview-id');
  });
});
