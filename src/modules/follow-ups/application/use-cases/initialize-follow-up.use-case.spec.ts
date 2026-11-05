jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { EventEmitter2 } from '@nestjs/event-emitter';
import { InitializeFollowUpUseCase } from './initialize-follow-up.use-case';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { FollowUpMilestone } from '../../domain/entities/follow-up-milestone.entity';
import { AdoptionRequest } from '../../../adoptions/domain/entities/adoption-request.entity';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { MilestoneType } from '../../domain/value-objects/milestone-type.enum';
import { MilestoneStatus } from '../../domain/value-objects/milestone-status.enum';

describe('InitializeFollowUpUseCase', () => {
  let useCase: InitializeFollowUpUseCase;
  let recordRepo: any;
  let milestoneRepo: any;
  let adoptionRepo: any;
  let eventEmitter: any;

  beforeEach(() => {
    recordRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => ({ id: 'rec-1', ...data })),
      save: jest.fn().mockImplementation(async (data) => data),
    };

    milestoneRepo = {
      create: jest.fn().mockImplementation((data) => ({ id: `m-${data.milestoneType}`, ...data })),
      save: jest.fn().mockImplementation(async (data) => data),
    };

    adoptionRepo = {
      findOne: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    useCase = new InitializeFollowUpUseCase(
      recordRepo,
      milestoneRepo,
      adoptionRepo,
      eventEmitter,
    );
  });

  it('should return existing record if already initialized', async () => {
    const existing = { id: 'rec-1', adoptionId: 'adopt-1', status: FollowUpProcessStatus.IN_PROGRESS };
    recordRepo.findOne.mockResolvedValue(existing);

    const result = await useCase.execute('adopt-1');
    expect(result).toBe(existing);
    expect(adoptionRepo.findOne).not.toHaveBeenCalled();
  });

  it('should initialize follow-up with 3 milestones (30d, 90d, 180d) and emit event', async () => {
    recordRepo.findOne.mockResolvedValue(null);
    adoptionRepo.findOne.mockResolvedValue({
      id: 'adopt-1',
      petId: 'pet-1',
      adopterId: 'user-1',
      shelterId: 'shelter-1',
      pet: { name: 'Firulais' },
      adopter: { email: 'adopter@test.com' },
      shelter: { email: 'shelter@test.com' },
    });

    const result = await useCase.execute('adopt-1');

    expect(result).toBeDefined();
    expect(recordRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        adoptionId: 'adopt-1',
        petId: 'pet-1',
        adopterId: 'user-1',
        shelterId: 'shelter-1',
        status: FollowUpProcessStatus.IN_PROGRESS,
      }),
    );
    expect(milestoneRepo.create).toHaveBeenCalledTimes(3);
    expect(milestoneRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        milestoneType: MilestoneType.M30_DAYS,
        daysTarget: 30,
        status: MilestoneStatus.PENDING,
      }),
    );
    expect(milestoneRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        milestoneType: MilestoneType.M90_DAYS,
        daysTarget: 90,
      }),
    );
    expect(milestoneRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        milestoneType: MilestoneType.M180_DAYS,
        daysTarget: 180,
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'follow_up.initialized',
      expect.objectContaining({
        followUpId: 'rec-1',
        petName: 'Firulais',
      }),
    );
  });
});
