import { Test, TestingModule } from '@nestjs/testing';
import { UploadImageUseCase } from '../../../media/application/use-cases/upload-image.use-case';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from '../../../users/domain/repositories/shelter-profile.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';
import { RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockAdopterProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByUserId: jest.fn(),
  };
  const mockShelterProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByUserId: jest.fn(),
  };
  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const mockTokenService = {
    generateTokens: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };
  const mockUploadImageUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
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
        { provide: UploadImageUseCase, useValue: mockUploadImageUseCase },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should throw EmailAlreadyInUseException if email already registered', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(new User());

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(EmailAlreadyInUseException);
  });

  it('should register a new adopter user and create initial adopter profile', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashingService.hash
      .mockResolvedValueOnce('hashed-password')
      .mockResolvedValueOnce('hashed-refresh-token');

    const createdUser = new User();
    createdUser.email = 'test@example.com';
    createdUser.passwordHash = 'hashed-password';
    createdUser.role = UserRole.ADOPTER;

    const savedUser = new User();
    Object.assign(savedUser, createdUser, {
      id: 'uuid-1',
      createdAt: new Date(),
    });

    mockUserRepository.create.mockReturnValue(createdUser);
    mockUserRepository.save.mockResolvedValue(savedUser);
    mockAdopterProfileRepository.create.mockReturnValue({ userId: 'uuid-1' });
    mockAdopterProfileRepository.save.mockResolvedValue({
      id: 'prof-1',
      userId: 'uuid-1',
    });
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    });

    expect(result.accessToken).toBe('access-123');
    expect(result.refreshToken).toBe('refresh-123');
    expect(result.user.email).toBe('test@example.com');
    expect(mockAdopterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-1',
    });
    expect(mockAdopterProfileRepository.save).toHaveBeenCalled();
  });

  it('should register a new shelter user and create initial shelter profile when role is shelter', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashingService.hash
      .mockResolvedValueOnce('hashed-password')
      .mockResolvedValueOnce('hashed-refresh-token');

    const createdUser = new User();
    createdUser.email = 'shelter@example.com';
    createdUser.passwordHash = 'hashed-password';
    createdUser.role = UserRole.SHELTER;

    const savedUser = new User();
    Object.assign(savedUser, createdUser, {
      id: 'uuid-2',
      createdAt: new Date(),
    });

    mockUserRepository.create.mockReturnValue(createdUser);
    mockUserRepository.save.mockResolvedValue(savedUser);
    mockShelterProfileRepository.create.mockReturnValue({ userId: 'uuid-2' });
    mockShelterProfileRepository.save.mockResolvedValue({
      id: 'shelter-prof-1',
      userId: 'uuid-2',
    });
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access-456',
      refreshToken: 'refresh-456',
    });

    const result = await useCase.execute({
      email: 'shelter@example.com',
      password: 'Password123!',
      fullName: 'Albergue Test',
      role: UserRole.SHELTER,
    });

    expect(result.user.role).toBe(UserRole.SHELTER);
    expect(mockShelterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-2',
    });
    expect(mockShelterProfileRepository.save).toHaveBeenCalled();
  });

  it('should upload avatar to Cloudinary when avatarFile is provided in registration', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashingService.hash
      .mockResolvedValueOnce('hashed-password')
      .mockResolvedValueOnce('hashed-refresh-token');

    const avatarFile = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('avatar-bytes'),
    } as Express.Multer.File;

    mockUploadImageUseCase.execute.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
      publicId: 'firu-api/avatars/avatar_123',
      format: 'webp',
      bytes: 2048,
    });

    const createdUser = new User();
    createdUser.email = 'avatar@example.com';
    createdUser.role = UserRole.ADOPTER;
    createdUser.avatarUrl =
      'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp';
    createdUser.avatarKey = 'firu-api/avatars/avatar_123';

    const savedUser = new User();
    Object.assign(savedUser, createdUser, {
      id: 'uuid-3',
      createdAt: new Date(),
    });

    mockUserRepository.create.mockReturnValue(createdUser);
    mockUserRepository.save.mockResolvedValue(savedUser);
    mockAdopterProfileRepository.create.mockReturnValue({ userId: 'uuid-3' });
    mockAdopterProfileRepository.save.mockResolvedValue({
      id: 'prof-3',
      userId: 'uuid-3',
    });
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access-789',
      refreshToken: 'refresh-789',
    });

    const result = await useCase.execute(
      {
        email: 'avatar@example.com',
        password: 'Password123!',
      },
      avatarFile,
    );

    expect(mockUploadImageUseCase.execute).toHaveBeenCalledWith(avatarFile, {
      folder: 'avatars',
    });
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarUrl:
          'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
        avatarKey: 'firu-api/avatars/avatar_123',
      }),
    );
    expect(result.user.avatarUrl).toBe(
      'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
    );
  });
});
