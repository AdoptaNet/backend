import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { Pet } from '../../domain/entities/pet.entity';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { GetMyPetsUseCase } from './get-my-pets.use-case';

describe('GetMyPetsUseCase', () => {
  let useCase: GetMyPetsUseCase;
  const mockPetRepository = {
    findByShelter: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyPetsUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<GetMyPetsUseCase>(GetMyPetsUseCase);
  });

  const shelterUser: User = {
    id: 'shelter-1',
    role: UserRole.SHELTER,
  } as User;

  it('should throw PetAccessForbiddenException if user role is not shelter or admin', async () => {
    const adopter = { id: 'adopter-1', role: UserRole.ADOPTER } as User;
    await expect(useCase.execute(adopter, {})).rejects.toThrow(
      PetAccessForbiddenException,
    );
  });

  it('should return paginated pets for the shelter user', async () => {
    const pet1 = new Pet();
    pet1.id = 'pet-1';
    pet1.shelterId = 'shelter-1';
    pet1.name = 'Bobby';
    pet1.status = PetStatus.AVAILABLE;
    pet1.photos = [];
    pet1.createdAt = new Date();
    pet1.updatedAt = new Date();

    mockPetRepository.findByShelter.mockResolvedValue([[pet1], 1]);

    const result = await useCase.execute(shelterUser, {
      page: 1,
      limit: 10,
      status: PetStatus.AVAILABLE,
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Bobby');
    expect(mockPetRepository.findByShelter).toHaveBeenCalledWith('shelter-1', {
      status: PetStatus.AVAILABLE,
      search: undefined,
      page: 1,
      limit: 10,
    });
  });
});
