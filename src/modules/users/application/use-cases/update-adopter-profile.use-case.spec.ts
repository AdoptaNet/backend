import { Test, TestingModule } from '@nestjs/testing';
import { AdopterProfile } from '../../domain/entities/adopter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { RoleMismatchException } from '../../domain/exceptions/role-mismatch.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AdopterProfileRepository } from '../../domain/repositories/adopter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import {
  HousingType,
  PreferredSpecies,
  ZoneType,
} from '../../domain/value-objects/adopter-profile.enums';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { UpdateAdopterProfileUseCase } from './update-adopter-profile.use-case';

import { EventEmitter2 } from '@nestjs/event-emitter';

describe('UpdateAdopterProfileUseCase', () => {
  let useCase: UpdateAdopterProfileUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
  };
  const mockAdopterProfileRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAdopterProfileUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: AdopterProfileRepository,
          useValue: mockAdopterProfileRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    useCase = module.get<UpdateAdopterProfileUseCase>(
      UpdateAdopterProfileUseCase,
    );
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', { department: 'Lima' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw RoleMismatchException if user is not an adopter', async () => {
    const shelterUser = new User();
    shelterUser.id = 'uuid-shelter';
    shelterUser.role = UserRole.SHELTER;

    mockUserRepository.findById.mockResolvedValue(shelterUser);

    await expect(
      useCase.execute('uuid-shelter', { department: 'Lima' }),
    ).rejects.toThrow(RoleMismatchException);
  });

  it('should create and save profile if one does not exist', async () => {
    const adopterUser = new User();
    adopterUser.id = 'uuid-adopter';
    adopterUser.role = UserRole.ADOPTER;

    mockUserRepository.findById.mockResolvedValue(adopterUser);
    mockAdopterProfileRepository.findByUserId.mockResolvedValue(null);

    const newProfile = new AdopterProfile();
    newProfile.id = 'prof-1';
    newProfile.userId = 'uuid-adopter';
    newProfile.department = 'Arequipa';
    newProfile.housingType = HousingType.APARTMENT;

    mockAdopterProfileRepository.create.mockReturnValue(newProfile);
    mockAdopterProfileRepository.save.mockResolvedValue(newProfile);

    const result = await useCase.execute('uuid-adopter', {
      department: 'Arequipa',
      housingType: HousingType.APARTMENT,
    });

    expect(result.department).toBe('Arequipa');
    expect(result.housingType).toBe(HousingType.APARTMENT);
    expect(mockAdopterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-adopter',
      department: 'Arequipa',
      housingType: HousingType.APARTMENT,
    });
    expect(mockAdopterProfileRepository.save).toHaveBeenCalledWith(newProfile);
  });

  it('should update existing profile if one exists', async () => {
    const adopterUser = new User();
    adopterUser.id = 'uuid-adopter';
    adopterUser.role = UserRole.ADOPTER;

    mockUserRepository.findById.mockResolvedValue(adopterUser);

    const existingProfile = new AdopterProfile();
    existingProfile.id = 'prof-1';
    existingProfile.userId = 'uuid-adopter';
    existingProfile.department = 'Lima';
    existingProfile.zoneType = ZoneType.URBAN_QUIET;

    mockAdopterProfileRepository.findByUserId.mockResolvedValue(
      existingProfile,
    );
    mockAdopterProfileRepository.save.mockImplementation((p: AdopterProfile) =>
      Promise.resolve(p),
    );

    const result = await useCase.execute('uuid-adopter', {
      department: 'Cusco',
      preferredSpecies: PreferredSpecies.DOG,
    });

    expect(result.department).toBe('Cusco');
    expect(result.zoneType).toBe(ZoneType.URBAN_QUIET);
    expect(result.preferredSpecies).toBe(PreferredSpecies.DOG);
    expect(mockAdopterProfileRepository.save).toHaveBeenCalledWith(
      existingProfile,
    );
  });
});
