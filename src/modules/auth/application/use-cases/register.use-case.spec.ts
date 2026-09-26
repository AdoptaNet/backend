import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadImageUseCase } from '../../../media/application/use-cases/upload-image.use-case';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { ShelterProfileRepository } from '../../../users/domain/repositories/shelter-profile.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { HashingService } from '../interfaces/hashing.service';
import { RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  const mockEventEmitter = {
    emit: jest.fn(),
  };
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
  const mockEmailService = {
    sendEmailVerification: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3001'),
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
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
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

  it('should register a new adopter user with isEmailVerified=false and send verification email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashingService.hash.mockResolvedValueOnce('hashed-password');

    const createdUser = new User();
    createdUser.email = 'test@example.com';
    createdUser.passwordHash = 'hashed-password';
    createdUser.role = UserRole.ADOPTER;
    createdUser.isEmailVerified = false;

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
    mockEmailService.sendEmailVerification.mockResolvedValue({ success: true });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    });

    expect(result.message).toContain('verifica tu correo');
    expect(result.email).toBe('test@example.com');
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isEmailVerified: false,
        roleSelected: true,
        emailVerificationTokenHash: expect.any(String),
        emailVerificationExpiresAt: expect.any(Date),
      }),
    );
    expect(mockEmailService.sendEmailVerification).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        userId: 'uuid-1',
        verificationUrl: expect.stringContaining('/verify-email?token='),
      }),
    );
    expect(mockAdopterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-1',
    });
  });

  it('should register a new shelter user and create initial shelter profile when role is shelter', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashingService.hash.mockResolvedValueOnce('hashed-password');

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
    mockEmailService.sendEmailVerification.mockResolvedValue({ success: true });

    const result = await useCase.execute({
      email: 'shelter@example.com',
      password: 'Password123!',
      fullName: 'Albergue Test',
      role: UserRole.SHELTER,
    });

    expect(result.role).toBe(UserRole.SHELTER);
    expect(mockShelterProfileRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-2',
    });
    expect(mockShelterProfileRepository.save).toHaveBeenCalled();
  });

  it('should upload avatar to Cloudinary when avatarFile is provided in registration', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashingService.hash.mockResolvedValueOnce('hashed-password');

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
    mockEmailService.sendEmailVerification.mockResolvedValue({ success: true });

    await useCase.execute(
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
  });
});
