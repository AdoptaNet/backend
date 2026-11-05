jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RequestPetReturnUseCase } from './request-pet-return.use-case';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { PetReturn } from '../../domain/entities/pet-return.entity';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { PetReturnStatus } from '../../domain/value-objects/pet-return-status.enum';
import { PetReturnReason } from '../../domain/value-objects/pet-return-reason.enum';

describe('RequestPetReturnUseCase', () => {
  let useCase: RequestPetReturnUseCase;
  let recordRepo: any;
  let petReturnRepo: any;
  let eventEmitter: any;

  beforeEach(() => {
    recordRepo = {
      findOne: jest.fn(),
    };
    petReturnRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((r) => ({ id: 'ret-1', ...r })),
      save: jest.fn().mockImplementation(async (r) => r),
    };
    eventEmitter = { emit: jest.fn() };

    useCase = new RequestPetReturnUseCase(
      recordRepo,
      petReturnRepo,
      eventEmitter,
    );
  });

  it('should throw NotFoundException if record is not found', async () => {
    recordRepo.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute('rec-missing', { reason: 'severe_allergy', explanation: 'Test' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the adopter', async () => {
    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      adopterId: 'other-user',
      status: FollowUpProcessStatus.IN_PROGRESS,
    });

    await expect(
      useCase.execute('rec-1', { reason: 'severe_allergy', explanation: 'Test' }, 'user-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should create return request mapping alias reason and including phone', async () => {
    recordRepo.findOne.mockResolvedValue({
      id: 'rec-1',
      adopterId: 'user-1',
      petId: 'pet-1',
      shelterId: 'shelter-1',
      status: FollowUpProcessStatus.IN_PROGRESS,
      pet: { name: 'Firulais' },
      adopter: { email: 'adopter@test.com' },
      shelter: { email: 'shelter@adopta.pe' },
    });

    const result = await useCase.execute(
      'rec-1',
      {
        reason: 'behavioral_challenges',
        explanation: 'Desafíos con otros animales',
        emergencyContactPhone: '951667124',
      },
      'user-1',
    );

    expect(result.reason).toBe(PetReturnReason.BEHAVIORAL_ISSUE);
    expect(result.explanation).toContain('Desafíos con otros animales');
    expect(result.explanation).toContain('951667124');
    expect(result.status).toBe(PetReturnStatus.REQUESTED);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'pet_return.requested',
      expect.objectContaining({
        followUpId: 'rec-1',
        petId: 'pet-1',
        reason: PetReturnReason.BEHAVIORAL_ISSUE,
      }),
    );
  });
});
