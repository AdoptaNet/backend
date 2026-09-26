import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { Pet } from '../../domain/entities/pet.entity';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetDeletionBlockedException } from '../../domain/exceptions/pet-deletion-blocked.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { DeletePetUseCase } from './delete-pet.use-case';

describe('DeletePetUseCase', () => {
  let useCase: DeletePetUseCase;
  const mockPetRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePetUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<DeletePetUseCase>(DeletePetUseCase);
  });

  const shelterUser: User = {
    id: 'shelter-1',
    role: UserRole.SHELTER,
  } as User;

  it('should throw PetNotFoundException if pet not found', async () => {
    mockPetRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('invalid-id', shelterUser)).rejects.toThrow(
      PetNotFoundException,
    );
  });

  it('should throw PetAccessForbiddenException if pet belongs to another shelter', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'other-shelter';
    mockPetRepository.findById.mockResolvedValue(existingPet);

    await expect(useCase.execute('pet-1', shelterUser)).rejects.toThrow(
      PetAccessForbiddenException,
    );
  });

  it('should throw PetDeletionBlockedException if pet is in_process (CA-10.4)', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.status = PetStatus.IN_PROCESS;
    mockPetRepository.findById.mockResolvedValue(existingPet);

    await expect(useCase.execute('pet-1', shelterUser)).rejects.toThrow(
      PetDeletionBlockedException,
    );
  });

  it('should throw PetDeletionBlockedException if pet is adopted (CA-10.4)', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.status = PetStatus.ADOPTED;
    mockPetRepository.findById.mockResolvedValue(existingPet);

    await expect(useCase.execute('pet-1', shelterUser)).rejects.toThrow(
      PetDeletionBlockedException,
    );
  });

  it('should soft delete pet successfully if available or draft without active processes', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.status = PetStatus.AVAILABLE;
    mockPetRepository.findById.mockResolvedValue(existingPet);
    mockPetRepository.softDelete.mockResolvedValue(undefined);

    await useCase.execute('pet-1', shelterUser);

    expect(mockPetRepository.softDelete).toHaveBeenCalledWith('pet-1');
  });
});
