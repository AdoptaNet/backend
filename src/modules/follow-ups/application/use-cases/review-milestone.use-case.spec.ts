jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReviewMilestoneUseCase } from './review-milestone.use-case';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';

describe('ReviewMilestoneUseCase', () => {
  let useCase: ReviewMilestoneUseCase;
  let recordRepo: any;
  let milestoneRepo: any;
  let eventEmitter: any;

  beforeEach(() => {
    recordRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (r) => r),
    };
    milestoneRepo = {
      save: jest.fn().mockImplementation(async (m) => m),
    };
    eventEmitter = { emit: jest.fn() };

    useCase = new ReviewMilestoneUseCase(
      recordRepo,
      milestoneRepo,
      eventEmitter,
    );
  });

  it('should approve milestone 30d and emit review event', async () => {
    const milestone: any = {
      id: 'm-30',
      milestoneType: MilestoneType.M30_DAYS,
      status: MilestoneStatus.SUBMITTED,
    };

    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
      status: FollowUpProcessStatus.IN_PROGRESS,
      milestones: [milestone],
      pet: { name: 'Firulais' },
      shelter: { email: 'shelter@adopta.pe' },
      adopter: { email: 'adopter@adopta.pe' },
    });

    const result = await useCase.execute(
      'rec-1',
      'm-30',
      { decision: 'approved', reviewNotes: 'Muy bien adaptado' },
      'shelter-1',
      UserRole.SHELTER,
    );

    expect(result.milestone.status).toBe(MilestoneStatus.COMPLETED);
    expect(result.milestone.reviewNotes).toBe('Muy bien adaptado');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'follow_up.milestone_reviewed',
      expect.objectContaining({ isApproved: true }),
    );
  });

  it('should complete follow-up and issue certificate if approving milestone 180d', async () => {
    const milestone: any = {
      id: 'm-180',
      milestoneType: MilestoneType.M180_DAYS,
      status: MilestoneStatus.SUBMITTED,
    };

    const record: any = {
      id: 'rec-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
      status: FollowUpProcessStatus.IN_PROGRESS,
      milestones: [milestone],
      pet: { name: 'Firulais' },
      shelter: { email: 'shelter@adopta.pe' },
      adopter: { email: 'adopter@adopta.pe' },
    };

    recordRepo.findOne.mockResolvedValue(record);

    const result = await useCase.execute(
      'rec-1',
      'm-180',
      { decision: 'approved', reviewNotes: 'Proceso culminado exitosamente' },
      'shelter-1',
      UserRole.SHELTER,
    );

    expect(result.milestone.status).toBe(MilestoneStatus.COMPLETED);
    expect(result.record.status).toBe(FollowUpProcessStatus.COMPLETED);
    expect(result.record.certificateCode).toMatch(/^CERT-ADOPTA-/);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'follow_up.completed',
      expect.objectContaining({
        certificateCode: expect.stringMatching(/^CERT-ADOPTA-/),
      }),
    );
  });
});
