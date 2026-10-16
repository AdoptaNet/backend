import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { PetNotFoundException } from '../../../pets/domain/exceptions/pet-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { User } from '../../../users/domain/entities/user.entity';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { AdopterProfile } from '../../../users/domain/entities/adopter-profile.entity';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionSubmittedEvent } from '../../domain/events/adoption-submitted.event';
import {
  DuplicateAdoptionRequestConflictException,
  IncompleteAdopterSurveyException,
  MaxActiveAdoptionsConflictException,
  PetNotAvailableConflictException,
  ShelterCannotAdoptOwnPetException,
} from '../../domain/exceptions/adoption.exceptions';
import { SubmitAdoptionRequestUseCase } from './submit-adoption-request.use-case';

describe('SubmitAdoptionRequestUseCase', () => {
  let useCase: SubmitAdoptionRequestUseCase;

  const mockAdoptionRepo = {
    countActiveByAdopterId: jest.fn(),
    findActiveByPetAndAdopter: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
  };

  const mockPetRepo = {
    findById: jest.fn(),
    findByIdWithPhotos: jest.fn(),
  };

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const mockAdopterProfileRepo = {
    findByUserId: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitAdoptionRequestUseCase,
        { provide: AdoptionRequestRepository, useValue: mockAdoptionRepo },
        { provide: PetRepository, useValue: mockPetRepo },
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AdopterProfileRepository, useValue: mockAdopterProfileRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<SubmitAdoptionRequestUseCase>(
      SubmitAdoptionRequestUseCase,
    );
  });

  const adopterUser: User = {
    id: 'adopter-1',
    role: UserRole.ADOPTER,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
  } as User;

  const validProfile: AdopterProfile = {
    id: 'profile-1',
    userId: 'adopter-1',
    isSurveyCompleted: true,
    housingType: 'apartment',
    hasYard: false,
    ownsHome: true,
    allowPetsPolicy: true,
    householdAdults: 2,
    householdChildren: 0,
    hasOtherPets: false,
    petExperienceLevel: 'intermediate',
    hoursAloneDaily: 4,
    emergencyCaregiver: 'Sister',
    lifestyleEnergy: 'medium',
    budgetMonthly: '150-300',
  } as unknown as AdopterProfile;

  const samplePet: Pet = {
    id: 'pet-1',
    name: 'Firulais',
    shelterId: 'shelter-1',
    status: PetStatus.AVAILABLE,
    shelter: {
      id: 'shelter-1',
      organizationName: 'Refugio Esperanza',
      user: {
        email: 'refugio@example.com',
      },
    },
  } as unknown as Pet;

  it('should throw IncompleteAdopterSurveyException if profile is incomplete or missing', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue({
      ...validProfile,
      isSurveyCompleted: false,
    });

    await expect(
      useCase.execute('adopter-1', {
        petId: 'pet-1',
        motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
        pledgeAccepted: true,
      }),
    ).rejects.toThrow(IncompleteAdopterSurveyException);
  });

  it('should throw PetNotFoundException if pet does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue(validProfile);
    mockPetRepo.findByIdWithPhotos.mockResolvedValue(null);

    await expect(
      useCase.execute('adopter-1', {
        petId: 'non-existing',
        motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
        pledgeAccepted: true,
      }),
    ).rejects.toThrow(PetNotFoundException);
  });

  it('should throw ShelterCannotAdoptOwnPetException if shelter tries to adopt own pet', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue(validProfile);
    mockPetRepo.findByIdWithPhotos.mockResolvedValue({
      ...samplePet,
      shelterId: 'adopter-1',
    });

    await expect(
      useCase.execute('adopter-1', {
        petId: 'pet-1',
        motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
        pledgeAccepted: true,
      }),
    ).rejects.toThrow(ShelterCannotAdoptOwnPetException);
  });

  it('should throw PetNotAvailableConflictException if pet is already adopted', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue(validProfile);
    mockPetRepo.findByIdWithPhotos.mockResolvedValue({
      ...samplePet,
      status: PetStatus.ADOPTED,
    });

    await expect(
      useCase.execute('adopter-1', {
        petId: 'pet-1',
        motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
        pledgeAccepted: true,
      }),
    ).rejects.toThrow(PetNotAvailableConflictException);
  });

  it('should throw MaxActiveAdoptionsConflictException if user already has 3 active requests', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue(validProfile);
    mockPetRepo.findByIdWithPhotos.mockResolvedValue(samplePet);
    mockAdoptionRepo.countActiveByAdopterId.mockResolvedValue(3);

    await expect(
      useCase.execute('adopter-1', {
        petId: 'pet-1',
        motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
        pledgeAccepted: true,
      }),
    ).rejects.toThrow(MaxActiveAdoptionsConflictException);
  });

  it('should throw DuplicateAdoptionRequestConflictException if user already has active application for this pet', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue(validProfile);
    mockPetRepo.findByIdWithPhotos.mockResolvedValue(samplePet);
    mockAdoptionRepo.countActiveByAdopterId.mockResolvedValue(1);
    mockAdoptionRepo.findActiveByPetAndAdopter.mockResolvedValue(new AdoptionRequest());

    await expect(
      useCase.execute('adopter-1', {
        petId: 'pet-1',
        motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
        pledgeAccepted: true,
      }),
    ).rejects.toThrow(DuplicateAdoptionRequestConflictException);
  });

  it('should successfully submit adoption request, persist snapshot, and emit event', async () => {
    mockUserRepo.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepo.findByUserId.mockResolvedValue(validProfile);
    mockPetRepo.findByIdWithPhotos.mockResolvedValue(samplePet);
    mockAdoptionRepo.countActiveByAdopterId.mockResolvedValue(1);
    mockAdoptionRepo.findActiveByPetAndAdopter.mockResolvedValue(null);

    const createdEntity: AdoptionRequest = {
      id: 'req-123',
      petId: 'pet-1',
      adopterId: 'adopter-1',
      shelterId: 'shelter-1',
      status: AdoptionStatus.PENDING,
      motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
      adopterSnapshot: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AdoptionRequest;

    mockAdoptionRepo.create.mockReturnValue(createdEntity);
    mockAdoptionRepo.save.mockResolvedValue(createdEntity);

    const populatedEntity: AdoptionRequest = {
      ...createdEntity,
      pet: samplePet,
      adopter: adopterUser,
    } as AdoptionRequest;

    mockAdoptionRepo.findById.mockResolvedValue(populatedEntity);

    const result = await useCase.execute('adopter-1', {
      petId: 'pet-1',
      motivationLetter: 'Quiero adoptar porque amo a los animales y tengo espacio suficiente.',
      pledgeAccepted: true,
    });

    expect(result.id).toBe('req-123');
    expect(result.status).toBe(AdoptionStatus.PENDING);
    expect(mockAdoptionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        petId: 'pet-1',
        adopterId: 'adopter-1',
        shelterId: 'shelter-1',
        status: AdoptionStatus.PENDING,
      }),
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      AdoptionSubmittedEvent.EVENT_NAME,
      expect.any(AdoptionSubmittedEvent),
    );
  });
});
