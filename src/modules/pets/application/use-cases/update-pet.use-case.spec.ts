import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { Pet } from '../../domain/entities/pet.entity';
import { InvalidPhotoCountException } from '../../domain/exceptions/invalid-photo-count.exception';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { UpdatePetUseCase } from './update-pet.use-case';

describe('UpdatePetUseCase', () => {
  let useCase: UpdatePetUseCase;
  const mockPetRepository = {
    findByIdWithPhotos: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePetUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<UpdatePetUseCase>(UpdatePetUseCase);
  });

  const shelterUser: User = {
    id: 'shelter-1',
    role: UserRole.SHELTER,
  } as User;

  it('should throw PetNotFoundException if pet not found', async () => {
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(null);
    await expect(
      useCase.execute('invalid-id', shelterUser, { name: 'New Name' }),
    ).rejects.toThrow(PetNotFoundException);
  });

  it('should throw PetAccessForbiddenException if pet does not belong to user', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'other-shelter';
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);

    await expect(
      useCase.execute('pet-1', shelterUser, { name: 'New Name' }),
    ).rejects.toThrow(PetAccessForbiddenException);
  });

  it('should throw InvalidPhotoCountException if updated photos array is empty or lacks primary', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);

    await expect(
      useCase.execute('pet-1', shelterUser, { photos: [] }),
    ).rejects.toThrow(InvalidPhotoCountException);

    await expect(
      useCase.execute('pet-1', shelterUser, {
        photos: [
          {
            url: 'https://cloudinary.com/pic1.jpg',
            publicId: 'pic1',
            isPrimary: false,
          },
        ],
      }),
    ).rejects.toThrow(InvalidPhotoCountException);
  });

  it('should update pet successfully when owner updates it', async () => {
    const existingPet = new Pet();
    existingPet.id = 'pet-1';
    existingPet.shelterId = 'shelter-1';
    existingPet.name = 'Old Name';
    existingPet.photos = [];
    existingPet.createdAt = new Date();
    existingPet.updatedAt = new Date();
    mockPetRepository.findByIdWithPhotos.mockResolvedValue(existingPet);
    mockPetRepository.save.mockImplementation((pet: Pet) =>
      Promise.resolve(pet),
    );

    const result = await useCase.execute('pet-1', shelterUser, {
      name: 'New Name',
      energyLevel: 4,
    });

    expect(result.name).toBe('New Name');
    expect(result.energyLevel).toBe(4);
    expect(mockPetRepository.save).toHaveBeenCalled();
  });
});
