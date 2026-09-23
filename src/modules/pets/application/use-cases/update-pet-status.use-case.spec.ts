import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { Pet } from '../../domain/entities/pet.entity';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { UpdatePetStatusUseCase } from './update-pet-status.use-case';

describe('UpdatePetStatusUseCase', () => {
  let useCase: UpdatePetStatusUseCase;
  const mockPetRepository = {
    findByIdWithPhotos: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePetStatusUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<UpdatePetStatusUseCase>(UpdatePetStatusUseCase);
  });

  const shelterUser: User = {
    id: 'shelter-1',
    role: UserRole.SHELTER,
  } as User;

  it('should throw PetNotFoundException if pet not found', async () => {
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(null);
    await expect(
      useCase.execute('invalid-id', shelterUser, { status: PetStatus.ADOPTED }),
    ).rejects.toThrow(PetNotFoundException);
  });

  it('should throw PetAccessForbiddenException if not owner or admin', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'other-shelter';
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);

    await expect(
      useCase.execute('pet-1', shelterUser, { status: PetStatus.ADOPTED }),
    ).rejects.toThrow(PetAccessForbiddenException);
  });

  it('should update status successfully', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.status = PetStatus.AVAILABLE;
    existingPet.photos = [];
    existingPet.createdAt = new Date();
    existingPet.updatedAt = new Date();
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);
    mockPetRepository.save.mockImplementation((pet: Pet) =>
      Promise.resolve(pet),
    );

    const result = await useCase.execute('pet-1', shelterUser, {
      status: PetStatus.ADOPTED,
    });

    expect(result.status).toBe(PetStatus.ADOPTED);
    expect(mockPetRepository.save).toHaveBeenCalled();
  });
});
