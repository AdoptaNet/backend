import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { Pet } from '../../domain/entities/pet.entity';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { GetPetByIdUseCase } from './get-pet-by-id.use-case';

describe('GetPetByIdUseCase', () => {
  let useCase: GetPetByIdUseCase;
  const mockPetRepository = {
    findByIdWithPhotos: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPetByIdUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<GetPetByIdUseCase>(GetPetByIdUseCase);
  });

  it('should throw PetNotFoundException if pet does not exist', async () => {
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(null);
    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      PetNotFoundException,
    );
  });

  it('should throw PetNotFoundException if pet is draft and requested anonymously or by non-owner', async () => {
    const draftPet = new Pet();
    draftPet.id = 'pet-draft';
    draftPet.shelterId = 'shelter-1';
    draftPet.status = PetStatus.DRAFT;
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(draftPet);

    await expect(useCase.execute('pet-draft')).rejects.toThrow(
      PetNotFoundException,
    );

    const otherUser = { id: 'other-user', role: UserRole.ADOPTER } as User;
    await expect(useCase.execute('pet-draft', otherUser)).rejects.toThrow(
      PetNotFoundException,
    );
  });

  it('should return draft pet if requested by the owner shelter', async () => {
    const draftPet = new Pet();
    draftPet.id = 'pet-draft';
    draftPet.shelterId = 'shelter-1';
    draftPet.status = PetStatus.DRAFT;
    draftPet.photos = [];
    draftPet.createdAt = new Date();
    draftPet.updatedAt = new Date();
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(draftPet);

    const owner = { id: 'shelter-1', role: UserRole.SHELTER } as User;
    const result = await useCase.execute('pet-draft', owner);
    expect(result.id).toBe('pet-draft');
  });

  it('should return available pet for public access', async () => {
    const availablePet = new Pet();
    availablePet.id = 'pet-available';
    availablePet.shelterId = 'shelter-1';
    availablePet.status = PetStatus.AVAILABLE;
    availablePet.photos = [];
    availablePet.createdAt = new Date();
    availablePet.updatedAt = new Date();
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(availablePet);

    const result = await useCase.execute('pet-available');
    expect(result.id).toBe('pet-available');
  });
});
