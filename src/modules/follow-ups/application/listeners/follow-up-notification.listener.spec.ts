import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FollowUpNotificationListener } from './follow-up-notification.listener';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { MilestoneSubmittedEvent } from '../../domain/events/milestone-submitted.event';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';

describe('FollowUpNotificationListener', () => {
  let listener: FollowUpNotificationListener;
  let emailService: jest.Mocked<Partial<EmailService>>;

  beforeEach(async () => {
    emailService = {
      sendMilestoneSubmittedEmail: jest.fn().mockResolvedValue({ success: true, id: 'test-id' }),
      sendFollowUpReviewEmail: jest.fn().mockResolvedValue({ success: true, id: 'test-id' }),
      sendFollowUpCompletedEmail: jest.fn().mockResolvedValue({ success: true, id: 'test-id' }),
      sendPetReturnNotificationEmail: jest.fn().mockResolvedValue({ success: true, id: 'test-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUpNotificationListener,
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    listener = module.get<FollowUpNotificationListener>(FollowUpNotificationListener);
  });

  it('should call sendMilestoneSubmittedEmail when MilestoneSubmittedEvent is handled', async () => {
    const event = new MilestoneSubmittedEvent(
      'follow-up-1',
      'milestone-1',
      MilestoneType.M30_DAYS,
      'Max',
      'Carlos Gómez',
      'shelter-1',
      'shelter@example.com',
    );

    await listener.handleMilestoneSubmitted(event);

    expect(emailService.sendMilestoneSubmittedEmail).toHaveBeenCalledWith(
      'shelter@example.com',
      {
        userId: 'shelter-1',
        adopterName: 'Carlos Gómez',
        petName: 'Max',
        milestoneDays: 30,
        actionUrl: 'http://localhost:3000/follow-up',
      },
    );
  });
});
