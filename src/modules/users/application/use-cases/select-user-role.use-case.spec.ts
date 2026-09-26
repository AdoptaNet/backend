import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { TokenService } from '../../../auth/application/interfaces/token.service';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { AdopterProfile } from '../../domain/entities/adopter-profile.entity';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { RoleChangeNotAllowedException } from '../../domain/exceptions/role-change-not-allowed.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AdopterProfileRepository } from '../../domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { SelectUserRoleUseCase } from './select-user-role.use-case';

describe('SelectUserRoleUseCase', () => {
  let useCase: SelectUserRoleUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockAdopterProfileRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteByUserId: jest.fn(),
  };
  const mockShelterProfileRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteByUserId: jest.fn(),
  };
  const mockHashingService = {
    hash: jest.fn(),
  };
  const mockTokenService = {
    generateTokens: jest.fn(),
  };
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelectUserRoleUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: AdopterProfileRepository,
          useValue: mockAdopterProfileRepository,
        },
        {
          provide: ShelterProfileRepository,
          useValue: mockShelterProfileRepository,
        },
        { provide: HashingService, useValue: mockHashingService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<SelectUserRoleUseCase>(SelectUserRoleUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-unknown', { role: UserRole.SHELTER }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw RoleChangeNotAllowedException if user already selected/confirmed role', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.roleSelected = true;
    mockUserRepository.findById.mockResolvedValue(user);

    await expect(
      useCase.execute('uuid-1', { role: UserRole.SHELTER }),
    ).rejects.toThrow(RoleChangeNotAllowedException);
  });

  it('should throw RoleChangeNotAllowedException if user registered with password', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.roleSelected = false;
    user.passwordHash = 'hashed-password';
    mockUserRepository.findById.mockResolvedValue(user);

    await expect(
      useCase.execute('uuid-1', { role: UserRole.SHELTER }),
    ).rejects.toThrow(RoleChangeNotAllowedException);
  });

  it('should throw RoleChangeNotAllowedException if adopterProfile is configured', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.passwordHash = null;
    user.role = UserRole.ADOPTER;
    user.roleSelected = false;
    mockUserRepository.findById.mockResolvedValue(user);

    const adopterProfile = new AdopterProfile();
    adopterProfile.department = 'Lima';
    mockAdopterProfileRepository.findByUserId.mockResolvedValue(adopterProfile);
    mockShelterProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-1', { role: UserRole.SHELTER }),
    ).rejects.toThrow(RoleChangeNotAllowedException);
  });

  it('should throw RoleChangeNotAllowedException if shelterProfile is configured', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.passwordHash = null;
    user.role = UserRole.SHELTER;
    user.roleSelected = false;
    mockUserRepository.findById.mockResolvedValue(user);

    const shelterProfile = new ShelterProfile();
    shelterProfile.organizationName = 'Albergue Amigo';
    mockAdopterProfileRepository.findByUserId.mockResolvedValue(null);
    mockShelterProfileRepository.findByUserId.mockResolvedValue(shelterProfile);

    await expect(
      useCase.execute('uuid-1', { role: UserRole.ADOPTER }),
    ).rejects.toThrow(RoleChangeNotAllowedException);
  });

  it('should switch role to SHELTER, delete empty adopter profile and create shelter profile', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.email = 'oauth@google.com';
    user.passwordHash = null;
    user.role = UserRole.ADOPTER;
    user.roleSelected = false;
    mockUserRepository.findById.mockResolvedValue(user);

    // Empty adopter profile
    const emptyAdopterProfile = new AdopterProfile();
    emptyAdopterProfile.department = null;
    emptyAdopterProfile.housingType = null;
    emptyAdopterProfile.householdSize = null;
    emptyAdopterProfile.preferredSpecies = null;
    emptyAdopterProfile.phoneNumber = null;

    mockAdopterProfileRepository.findByUserId.mockResolvedValue(
      emptyAdopterProfile,
    );
    mockShelterProfileRepository.findByUserId.mockResolvedValue(null);

    const newShelterProfile = new ShelterProfile();
    newShelterProfile.userId = 'uuid-1';
    mockShelterProfileRepository.create.mockReturnValue(newShelterProfile);
    mockShelterProfileRepository.save.mockResolvedValue(newShelterProfile);

    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    mockHashingService.hash.mockResolvedValue('hashed-new-refresh');
    mockUserRepository.save.mockImplementation((u) => Promise.resolve(u));

    const result = await useCase.execute('uuid-1', { role: UserRole.SHELTER });

    expect(mockAdopterProfileRepository.deleteByUserId).toHaveBeenCalledWith(
      'uuid-1',
    );
    expect(mockShelterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-1',
    });
    expect(mockShelterProfileRepository.save).toHaveBeenCalledWith(
      newShelterProfile,
    );
    expect(mockTokenService.generateTokens).toHaveBeenCalledWith({
      sub: 'uuid-1',
      email: 'oauth@google.com',
      role: UserRole.SHELTER,
    });
    expect(result.user.role).toBe(UserRole.SHELTER);
    expect(result.user.roleSelected).toBe(true);
    expect(result.accessToken).toBe('new-access-token');
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      UserRegisteredEvent.EVENT_NAME,
      expect.objectContaining({
        role: UserRole.SHELTER,
      }),
    );
  });

  it('should switch role to ADOPTER, delete empty shelter profile and create adopter profile', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.email = 'oauth@google.com';
    user.passwordHash = null;
    user.role = UserRole.SHELTER;
    user.roleSelected = false;
    mockUserRepository.findById.mockResolvedValue(user);

    // Empty shelter profile
    const emptyShelterProfile = new ShelterProfile();
    emptyShelterProfile.organizationName = null;
    emptyShelterProfile.address = null;
    emptyShelterProfile.phoneNumber = null;
    emptyShelterProfile.description = null;

    mockAdopterProfileRepository.findByUserId.mockResolvedValue(null);
    mockShelterProfileRepository.findByUserId.mockResolvedValue(
      emptyShelterProfile,
    );

    const newAdopterProfile = new AdopterProfile();
    newAdopterProfile.userId = 'uuid-1';
    mockAdopterProfileRepository.create.mockReturnValue(newAdopterProfile);
    mockAdopterProfileRepository.save.mockResolvedValue(newAdopterProfile);

    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    mockHashingService.hash.mockResolvedValue('hashed-new-refresh');
    mockUserRepository.save.mockImplementation((u) => Promise.resolve(u));

    const result = await useCase.execute('uuid-1', { role: UserRole.ADOPTER });

    expect(mockShelterProfileRepository.deleteByUserId).toHaveBeenCalledWith(
      'uuid-1',
    );
    expect(mockAdopterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-1',
    });
    expect(mockAdopterProfileRepository.save).toHaveBeenCalledWith(
      newAdopterProfile,
    );
    expect(result.user.role).toBe(UserRole.ADOPTER);
    expect(result.user.roleSelected).toBe(true);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      UserRegisteredEvent.EVENT_NAME,
      expect.objectContaining({
        role: UserRole.ADOPTER,
      }),
    );
  });
});
