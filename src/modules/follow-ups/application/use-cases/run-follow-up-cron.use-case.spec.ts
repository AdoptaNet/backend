jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { ConfigService } from '@nestjs/config';
import { RunFollowUpCronUseCase } from './run-follow-up-cron.use-case';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { EmailService } from '../../../notifications/application/interfaces/email.service';

describe('RunFollowUpCronUseCase', () => {
  let useCase: RunFollowUpCronUseCase;
  let milestoneRepo: any;
  let emailService: any;
  let configService: any;

  beforeEach(() => {
    const qb = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    milestoneRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      save: jest.fn().mockImplementation(async (m) => m),
    };

    emailService = {
      sendFollowUpReminderEmail: jest.fn().mockResolvedValue({ success: true }),
      sendFollowUpOverdueEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    };

    useCase = new RunFollowUpCronUseCase(
      milestoneRepo,
      emailService,
      configService,
    );
  });

  it('should detect milestones due within 7 days and send reminder email', async () => {
    const dueDateIn3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const mockMilestone: any = {
      id: 'm-30',
      milestoneType: MilestoneType.M30_DAYS,
      daysTarget: 30,
      dueDate: dueDateIn3Days,
      status: MilestoneStatus.PENDING,
      reminderSentAt: null,
      record: {
        pet: { name: 'Firulais' },
        adopter: { email: 'adopter@test.com' },
        shelter: { email: 'shelter@adopta.pe' },
      },
    };

    const qb = milestoneRepo.createQueryBuilder();
    qb.getMany.mockResolvedValue([mockMilestone]);

    const result = await useCase.execute();

    expect(result.scanned).toBe(1);
    expect(result.remindersSent).toBe(1);
    expect(mockMilestone.reminderSentAt).toBeDefined();
    expect(emailService.sendFollowUpReminderEmail).toHaveBeenCalledWith(
      'adopter@test.com',
      expect.objectContaining({ petName: 'Firulais', milestoneDays: 30 }),
    );
  });

  it('should mark milestones overdue when past due by more than 7 days and send alert email', async () => {
    const dueDatePast10Days = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const mockMilestone: any = {
      id: 'm-30',
      milestoneType: MilestoneType.M30_DAYS,
      daysTarget: 30,
      dueDate: dueDatePast10Days,
      status: MilestoneStatus.PENDING,
      overdueNotifiedAt: null,
      record: {
        pet: { name: 'Firulais' },
        adopter: { email: 'adopter@test.com' },
        shelter: { email: 'shelter@adopta.pe' },
      },
    };

    const qb = milestoneRepo.createQueryBuilder();
    qb.getMany.mockResolvedValue([mockMilestone]);

    const result = await useCase.execute();

    expect(result.scanned).toBe(1);
    expect(result.overdueMarked).toBe(1);
    expect(mockMilestone.status).toBe(MilestoneStatus.OVERDUE);
    expect(mockMilestone.overdueNotifiedAt).toBeDefined();
    expect(emailService.sendFollowUpOverdueEmail).toHaveBeenCalledWith(
      'adopter@test.com',
      expect.objectContaining({ petName: 'Firulais', milestoneDays: 30 }),
    );
  });
});
