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
});
