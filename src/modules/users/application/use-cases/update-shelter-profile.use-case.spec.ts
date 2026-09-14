import { Test, TestingModule } from '@nestjs/testing';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { RoleMismatchException } from '../../domain/exceptions/role-mismatch.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { UpdateShelterProfileUseCase } from './update-shelter-profile.use-case';

describe('UpdateShelterProfileUseCase', () => {
  let useCase: UpdateShelterProfileUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
  };
  const mockShelterProfileRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateShelterProfileUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: ShelterProfileRepository,
          useValue: mockShelterProfileRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateShelterProfileUseCase>(
      UpdateShelterProfileUseCase,
    );
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', { organizationName: 'Patitas' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw RoleMismatchException if user is not a shelter', async () => {
    const adopterUser = new User();
    adopterUser.id = 'uuid-adopter';
    adopterUser.role = UserRole.ADOPTER;

    mockUserRepository.findById.mockResolvedValue(adopterUser);

    await expect(
      useCase.execute('uuid-adopter', { organizationName: 'Patitas' }),
    ).rejects.toThrow(RoleMismatchException);
  });

  it('should create and save profile if one does not exist', async () => {
    const shelterUser = new User();
    shelterUser.id = 'uuid-shelter';
    shelterUser.role = UserRole.SHELTER;

    mockUserRepository.findById.mockResolvedValue(shelterUser);
    mockShelterProfileRepository.findByUserId.mockResolvedValue(null);

    const newProfile = new ShelterProfile();
    newProfile.id = 'shelter-prof-1';
    newProfile.userId = 'uuid-shelter';
    newProfile.organizationName = 'Patitas Felices';
    newProfile.rescueCapacity = 25;
    newProfile.isVerified = false;

    mockShelterProfileRepository.create.mockReturnValue(newProfile);
    mockShelterProfileRepository.save.mockResolvedValue(newProfile);

    const result = await useCase.execute('uuid-shelter', {
      organizationName: 'Patitas Felices',
      rescueCapacity: 25,
    });

    expect(result.organizationName).toBe('Patitas Felices');
    expect(result.rescueCapacity).toBe(25);
    expect(result.isVerified).toBe(false);
    expect(mockShelterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-shelter',
      organizationName: 'Patitas Felices',
      rescueCapacity: 25,
    });
    expect(mockShelterProfileRepository.save).toHaveBeenCalledWith(newProfile);
  });

  it('should update existing profile if one exists', async () => {
    const shelterUser = new User();
    shelterUser.id = 'uuid-shelter';
    shelterUser.role = UserRole.SHELTER;

    mockUserRepository.findById.mockResolvedValue(shelterUser);

    const existingProfile = new ShelterProfile();
    existingProfile.id = 'shelter-prof-1';
    existingProfile.userId = 'uuid-shelter';
    existingProfile.organizationName = 'Patitas';
    existingProfile.city = 'Lima';
    existingProfile.isVerified = true;

    mockShelterProfileRepository.findByUserId.mockResolvedValue(
      existingProfile,
    );
    mockShelterProfileRepository.save.mockImplementation((p: ShelterProfile) =>
      Promise.resolve(p),
    );

    const result = await useCase.execute('uuid-shelter', {
      city: 'Cusco',
      phoneNumber: '+51999888777',
    });

    expect(result.organizationName).toBe('Patitas');
    expect(result.city).toBe('Cusco');
    expect(result.phoneNumber).toBe('+51999888777');
    expect(result.isVerified).toBe(true);
    expect(mockShelterProfileRepository.save).toHaveBeenCalledWith(
      existingProfile,
    );
  });
});
