import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';
import { GoogleLoginUseCase } from './google-login.use-case';

describe('GoogleLoginUseCase', () => {
  let useCase: GoogleLoginUseCase;
  const mockEventEmitter = {
    emit: jest.fn(),
  };
  const mockUserRepository = {
    findByGoogleId: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockHashingService = {
    hash: jest.fn(),
  };
  const mockTokenService = {
    generateTokens: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleLoginUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    useCase = module.get<GoogleLoginUseCase>(GoogleLoginUseCase);
  });

  it('should create new user with roleSelected=false and isEmailVerified=true on first-time login', async () => {
    mockUserRepository.findByGoogleId.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const newUser = new User();
    newUser.googleId = 'google-123';
    newUser.email = 'newgoogle@example.com';
    newUser.role = UserRole.ADOPTER;
    newUser.roleSelected = false;
    newUser.isEmailVerified = true;

    const savedUser = new User();
    Object.assign(savedUser, newUser, { id: 'uuid-1', createdAt: new Date() });

    mockUserRepository.create.mockReturnValue(newUser);
    mockUserRepository.save.mockResolvedValue(savedUser);
    mockHashingService.hash.mockResolvedValue('hashed-refresh');
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await useCase.execute({
      googleId: 'google-123',
      email: 'newgoogle@example.com',
      fullName: 'Google User',
    });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(result.isNewUser).toBe(true);
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        googleId: 'google-123',
        email: 'newgoogle@example.com',
        roleSelected: false,
        isEmailVerified: true,
      }),
    );
  });

  it('should link googleId to existing user with same email and verify email', async () => {
    mockUserRepository.findByGoogleId.mockResolvedValue(null);

    const existingUser = new User();
    existingUser.id = 'uuid-2';
    existingUser.email = 'existing@example.com';
    existingUser.googleId = null;
    existingUser.role = UserRole.ADOPTER;
    existingUser.isEmailVerified = false;
    existingUser.createdAt = new Date();

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    mockUserRepository.save.mockResolvedValue(existingUser);
    mockHashingService.hash.mockResolvedValue('hashed-refresh');
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await useCase.execute({
      googleId: 'google-123',
      email: 'existing@example.com',
      avatarUrl: 'https://avatar.jpg',
    });

    expect(result.user.id).toBe('uuid-2');
    expect(result.isNewUser).toBe(false);
    expect(existingUser.googleId).toBe('google-123');
    expect(existingUser.avatarUrl).toBe('https://avatar.jpg');
    expect(existingUser.isEmailVerified).toBe(true); // US-02 Escenario 4
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
