import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdoptionSubmittedEvent } from '../../../adoptions/domain/events/adoption-submitted.event';
import { AdoptionStatusChangedEvent } from '../../../adoptions/domain/events/adoption-status-changed.event';
import { AdoptionStatus } from '../../../adoptions/domain/value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../../../adoptions/domain/value-objects/adoption-rejection-reason.enum';
import { EmailService } from '../interfaces/email.service';
import { AdoptionNotificationListener } from './adoption-notification.listener';

describe('AdoptionNotificationListener', () => {
  let listener: AdoptionNotificationListener;
  let mockEmailService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockEmailService = {
      sendNewAdoptionRequestEmail: jest.fn().mockResolvedValue({ success: true }),
      sendAdoptionStatusChangedEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdoptionNotificationListener,
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    listener = module.get<AdoptionNotificationListener>(
      AdoptionNotificationListener,
    );
  });

  it('should notify shelter on AdoptionSubmittedEvent', async () => {
    const event = new AdoptionSubmittedEvent(
      'adoption-1',
      'pet-1',
      'Bobby',
      'adopter-1',
      'María López',
      'maria@test.com',
      'shelter-1',
      'shelter@test.com',
    );

    await listener.handleAdoptionSubmitted(event);

    expect(mockEmailService.sendNewAdoptionRequestEmail).toHaveBeenCalledWith(
      'shelter@test.com',
      expect.objectContaining({
        petName: 'Bobby',
        adopterName: 'María López',
      }),
    );
  });

  it('should notify adopter on AdoptionStatusChangedEvent when approved', async () => {
    const event = new AdoptionStatusChangedEvent(
      'adoption-1',
      'pet-1',
      'Bobby',
      'adopter-1',
      'María López',
      'maria@test.com',
      'shelter-1',
      AdoptionStatus.APPROVED,
    );

    await listener.handleAdoptionStatusChanged(event);

    expect(mockEmailService.sendAdoptionStatusChangedEmail).toHaveBeenCalledWith(
      'maria@test.com',
      expect.objectContaining({
        isApproved: true,
        petName: 'Bobby',
      }),
    );
  });

  it('should notify adopter on AdoptionStatusChangedEvent when rejected with reason', async () => {
    const event = new AdoptionStatusChangedEvent(
      'adoption-1',
      'pet-1',
      'Bobby',
      'adopter-1',
      'María López',
      'maria@test.com',
      'shelter-1',
      AdoptionStatus.REJECTED,
      AdoptionRejectionReason.INCOMPATIBLE_HOUSING,
      'No tiene cerco perimétrico seguro.',
    );

    await listener.handleAdoptionStatusChanged(event);

    expect(mockEmailService.sendAdoptionStatusChangedEmail).toHaveBeenCalledWith(
      'maria@test.com',
      expect.objectContaining({
        isApproved: false,
        rejectionNotes: 'No tiene cerco perimétrico seguro.',
      }),
    );
  });
});
