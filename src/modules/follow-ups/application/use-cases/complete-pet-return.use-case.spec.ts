jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: (entity: any) => `${entity?.name || entity}Repository`,
}));

import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompletePetReturnUseCase } from './complete-pet-return.use-case';
import { PetReturn } from '../../domain/entities/pet-return.entity';
import { FollowUpRecord } from '../../domain/entities/follow-up-record.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { PetReturnStatus } from '../../domain/value-objects/pet-return-status.enum';
import { FollowUpProcessStatus } from '../../domain/value-objects/follow-up-process-status.enum';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';

describe('CompletePetReturnUseCase', () => {
  let useCase: CompletePetReturnUseCase;
  let returnRepo: any;
  let recordRepo: any;
  let petRepo: any;
  let eventEmitter: any;

  beforeEach(() => {
    returnRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (r) => r),
    };
    recordRepo = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    petRepo = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    eventEmitter = { emit: jest.fn() };

    useCase = new CompletePetReturnUseCase(
      returnRepo,
      recordRepo,
      petRepo,
      eventEmitter,
    );
  });

  it('should accept return, mark record as RETURNED and reactivate pet to AVAILABLE', async () => {
    const petReturn: any = {
      id: 'ret-1',
      followUpRecordId: 'rec-1',
      petId: 'pet-1',
      adopterId: 'adopter-1',
      shelterId: 'shelter-1',
      status: PetReturnStatus.UNDER_COORDINATION,
      pet: { name: 'Firulais' },
      adopter: { email: 'adopter@test.com' },
      shelter: { email: 'shelter@adopta.pe' },
    };

    returnRepo.findOne.mockResolvedValue(petReturn);

    const result = await useCase.execute(
      'ret-1',
      { decision: 'accept', shelterObservations: 'Mascota recibida en buen estado' },
      'shelter-1',
      UserRole.SHELTER,
    );

    expect(result.status).toBe(PetReturnStatus.RETURNED);
    expect(result.shelterObservations).toBe('Mascota recibida en buen estado');
    expect(recordRepo.update).toHaveBeenCalledWith('rec-1', {
      status: FollowUpProcessStatus.RETURNED,
    });
    expect(petRepo.update).toHaveBeenCalledWith('pet-1', {
      status: PetStatus.AVAILABLE,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'pet_return.completed',
      expect.objectContaining({ isAccepted: true }),
    );
  });
});
