import { Test, TestingModule } from '@nestjs/testing';
import { ShelterProfile } from '../../../users/domain/entities/shelter-profile.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { ShelterProfileRepository } from '../../../users/domain/repositories/shelter-profile.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { Pet } from '../../domain/entities/pet.entity';
import { InvalidPhotoCountException } from '../../domain/exceptions/invalid-photo-count.exception';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { ShelterProfileIncompleteException } from '../../domain/exceptions/shelter-profile-incomplete.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetAgeCategory } from '../../domain/value-objects/pet-age-category.enum';
import { PetGender } from '../../domain/value-objects/pet-gender.enum';
import { PetSize } from '../../domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { CreatePetDto } from '../dtos/create-pet.dto';
import { CreatePetUseCase } from './create-pet.use-case';

describe('CreatePetUseCase', () => {
  let useCase: CreatePetUseCase;
  const mockPetRepository = {
    save: jest.fn(),
  };
  const mockShelterProfileRepository = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePetUseCase,
        { provide: PetRepository, useValue: mockPetRepository },
        {
          provide: ShelterProfileRepository,
          useValue: mockShelterProfileRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreatePetUseCase>(CreatePetUseCase);
  });

  const baseUser: User = {
    id: 'shelter-user-1',
    role: UserRole.SHELTER,
    email: 'albergue@test.com',
  } as User;

  const validProfile: ShelterProfile = {
    id: 'prof-1',
    userId: 'shelter-user-1',
    organizationName: 'Huellitas',
    phoneNumber: '+51999999999',
    city: 'Lima',
    department: 'Lima',
  } as ShelterProfile;

  const validDto: CreatePetDto = {
    name: 'Pelusa',
    species: PetSpecies.CAT,
    gender: PetGender.FEMALE,
    ageMonths: 8,
    size: PetSize.SMALL,
    energyLevel: 3,
    vocalizationLevel: 2,
    description: 'Gatita muy cariñosa y tranquila.',
    photos: [
      {
        url: 'https://cloudinary.com/firu/cat1.jpg',
        publicId: 'firu/cat1',
        isPrimary: true,
      },
    ],
  };

  it('should throw PetAccessForbiddenException if user is an adopter', async () => {
    const adopter = { ...baseUser, role: UserRole.ADOPTER } as User;
    await expect(useCase.execute(adopter, validDto)).rejects.toThrow(
      PetAccessForbiddenException,
    );
  });

  it('should throw ShelterProfileIncompleteException if shelter profile does not exist', async () => {
    mockShelterProfileRepository.findByUserId.mockResolvedValue(null);
    await expect(useCase.execute(baseUser, validDto)).rejects.toThrow(
      ShelterProfileIncompleteException,
    );
  });

  it('should throw ShelterProfileIncompleteException if profile is missing city or phone', async () => {
    mockShelterProfileRepository.findByUserId.mockResolvedValue({
      organizationName: 'Huellitas',
      phoneNumber: '',
      city: 'Lima',
    });
    await expect(useCase.execute(baseUser, validDto)).rejects.toThrow(
      ShelterProfileIncompleteException,
    );
  });

  it('should throw InvalidPhotoCountException if photos array is empty', async () => {
    mockShelterProfileRepository.findByUserId.mockResolvedValue(validProfile);
    const dtoWithoutPhotos = { ...validDto, photos: [] };
    await expect(useCase.execute(baseUser, dtoWithoutPhotos)).rejects.toThrow(
      InvalidPhotoCountException,
    );
  });

  it('should throw InvalidPhotoCountException if no primary photo is marked', async () => {
    mockShelterProfileRepository.findByUserId.mockResolvedValue(validProfile);
    const dtoNoPrimary = {
      ...validDto,
      photos: [
        {
          url: 'https://cloudinary.com/firu/cat1.jpg',
          publicId: 'firu/cat1',
          isPrimary: false,
        },
      ],
    };
    await expect(useCase.execute(baseUser, dtoNoPrimary)).rejects.toThrow(
      InvalidPhotoCountException,
    );
  });

  it('should create pet successfully, calculating ageCategory automatically if omitted', async () => {
    mockShelterProfileRepository.findByUserId.mockResolvedValue(validProfile);
    mockPetRepository.save.mockImplementation((pet: Pet) => {
      pet.id = 'pet-uuid-1';
      pet.createdAt = new Date();
      pet.updatedAt = new Date();
      return Promise.resolve(pet);
    });

    const result = await useCase.execute(baseUser, validDto);

    expect(result.id).toBe('pet-uuid-1');
    expect(result.name).toBe('Pelusa');
    expect(result.ageCategory).toBe(PetAgeCategory.PUPPY); // 8 months -> puppy
    expect(result.status).toBe(PetStatus.AVAILABLE);
    expect(result.photos).toHaveLength(1);
    expect(result.shelter?.organizationName).toBe('Huellitas');
    expect(mockPetRepository.save).toHaveBeenCalled();
  });
});
