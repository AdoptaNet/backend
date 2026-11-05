jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubmitMilestoneEvidenceUseCase } from './submit-milestone-evidence.use-case';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { FollowUpEvidence } from '../../domain/entities/follow-up-evidence.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';

describe('SubmitMilestoneEvidenceUseCase', () => {
  let useCase: SubmitMilestoneEvidenceUseCase;
  let recordRepo: any;
  let milestoneRepo: any;
  let evidenceRepo: any;
  let configService: any;
  let eventEmitter: any;

  beforeEach(() => {
    recordRepo = { findOne: jest.fn() };
    milestoneRepo = { save: jest.fn().mockImplementation(async (m) => m) };
    evidenceRepo = {
      create: jest.fn().mockImplementation((e) => e),
      save: jest.fn().mockResolvedValue([]),
    };
    configService = { get: jest.fn().mockReturnValue('true') }; // demo mode
    eventEmitter = { emit: jest.fn() };

    useCase = new SubmitMilestoneEvidenceUseCase(
      recordRepo,
      milestoneRepo,
      evidenceRepo,
      configService,
      eventEmitter,
    );
  });

  it('should throw ForbiddenException if user is not the adopter', async () => {
    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      adopterId: 'user-adopter',
      status: FollowUpProcessStatus.IN_PROGRESS,
    });

    await expect(
      useCase.execute('rec-1', 'm-1', { adaptationNotes: 'Bien', evidences: [] }, 'other-user'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should save evidences and change status to SUBMITTED', async () => {
    const milestone: any = {
      id: 'm-1',
      milestoneType: MilestoneType.M30_DAYS,
      daysTarget: 30,
      status: MilestoneStatus.PENDING,
    };

    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      adopterId: 'user-adopter',
      status: FollowUpProcessStatus.IN_PROGRESS,
      milestones: [milestone],
      pet: { name: 'Firulais' },
      shelterId: 'shelter-1',
      shelter: { email: 'shelter@adopta.pe' },
      adopter: { email: 'adopter@test.com' },
    });

    const result = await useCase.execute(
      'rec-1',
      'm-1',
      {
        adaptationNotes: 'Todo excelente con Firulais',
        healthStatusReported: 'healthy',
        evidences: [{ evidenceType: 'pet_photo', mediaUrl: 'https://test.com/photo.jpg' }],
      },
      'user-adopter',
    );

    expect(result.status).toBe(MilestoneStatus.SUBMITTED);
    expect(result.adaptationNotes).toBe('Todo excelente con Firulais');
    expect(result.healthStatusReported).toBe('healthy');
    expect(evidenceRepo.create).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'follow_up.milestone_submitted',
      expect.objectContaining({
        followUpId: 'rec-1',
        milestoneId: 'm-1',
      }),
    );
  });

  it('should throw BadRequestException if non-demo and current date is before 7-day window', async () => {
    configService.get.mockReturnValue('false'); // non-demo mode

    // Due date 20 days in future (window opens in 13 days)
    const futureDueDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    const milestone: any = {
      id: 'm-30',
      milestoneType: MilestoneType.M30_DAYS,
      daysTarget: 30,
      dueDate: futureDueDate,
      status: MilestoneStatus.PENDING,
    };

    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      adopterId: 'user-adopter',
      status: FollowUpProcessStatus.IN_PROGRESS,
      milestones: [milestone],
      pet: { name: 'Firulais' },
      shelterId: 'shelter-1',
      shelter: { email: 'shelter@adopta.pe' },
      adopter: { email: 'adopter@test.com' },
    });

    await expect(
      useCase.execute(
        'rec-1',
        'm-30',
        {
          adaptationNotes: 'Demasiado pronto',
          evidences: [{ evidenceType: 'pet_photo', mediaUrl: 'https://test.com/photo.jpg' }],
        },
        'user-adopter',
      ),
    ).rejects.toThrow('Este hito estará disponible para envío a partir del');
  });

  it('should allow submission if non-demo and current date is within the 7-day window', async () => {
    configService.get.mockReturnValue('false'); // non-demo mode

    // Due date 5 days in future (window opened 2 days ago)
    const openDueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const milestone: any = {
      id: 'm-30',
      milestoneType: MilestoneType.M30_DAYS,
      daysTarget: 30,
      dueDate: openDueDate,
      status: MilestoneStatus.PENDING,
    };

    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      adopterId: 'user-adopter',
      status: FollowUpProcessStatus.IN_PROGRESS,
      milestones: [milestone],
      pet: { name: 'Firulais' },
      shelterId: 'shelter-1',
      shelter: { email: 'shelter@adopta.pe' },
      adopter: { email: 'adopter@test.com' },
    });

    const result = await useCase.execute(
      'rec-1',
      'm-30',
      {
        adaptationNotes: 'Dentro de la ventana permitida',
        evidences: [{ evidenceType: 'pet_photo', mediaUrl: 'https://test.com/photo.jpg' }],
      },
      'user-adopter',
    );

    expect(result.status).toBe(MilestoneStatus.SUBMITTED);
  });
});
