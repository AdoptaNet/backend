import { Test, TestingModule } from '@nestjs/testing';
import { AdopterProfile } from '../../domain/entities/adopter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { GetMyProfileUseCase } from './get-my-profile.use-case';

describe('GetMyProfileUseCase', () => {
  let useCase: GetMyProfileUseCase;
  const mockUserRepository = {
    findByIdWithProfile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyProfileUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetMyProfileUseCase>(GetMyProfileUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findByIdWithProfile.mockResolvedValue(null);

    await expect(useCase.execute('uuid-unknown')).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('should return user with adopterProfile when profile exists', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.email = 'adopter@test.com';
    user.fullName = 'Adopter Test';
    user.avatarUrl = null;
    user.role = UserRole.ADOPTER;
    user.createdAt = new Date('2026-01-01');

    const adopterProfile = new AdopterProfile();
    Object.assign(adopterProfile, {
      id: 'prof-1',
      userId: 'uuid-1',
      department: 'Lima',
      zoneType: null,
      housingType: null,
      outdoorSpace: null,
      isFenced: null,
      tenureType: null,
      householdSize: null,
      childrenAgeRange: null,
      hasElderly: null,
      allergyType: null,
      currentPets: null,
      currentPetsSociability: null,
      hoursAlone: null,
      workSchedule: null,
      activityLevel: null,
      walkTime: null,
      monthlyBudget: null,
      vetBudget: null,
      experienceLevel: null,
      preferredSpecies: null,
      preferredSize: null,
      preferredAge: null,
      preferredSex: null,
      preferredTemperament: null,
      furPreference: null,
      noiseTolerance: null,
      specialNeedsAcceptance: null,
      sterilizationCommitment: null,
      adoptionMotivation: null,
      followUpAcceptance: null,
      adopterAgeRange: null,
      phoneNumber: '+51987654321',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    user.adopterProfile = adopterProfile;
    user.shelterProfile = null;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(user);

    const result = await useCase.execute('uuid-1');

    expect(result.id).toBe('uuid-1');
    expect(result.email).toBe('adopter@test.com');
    expect(result.adopterProfile?.department).toBe('Lima');
    expect(result.adopterProfile?.phoneNumber).toBe('+51987654321');
    expect(result.shelterProfile).toBeNull();
  });
});
