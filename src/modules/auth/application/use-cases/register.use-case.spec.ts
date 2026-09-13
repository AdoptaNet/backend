import { Test, TestingModule } from '@nestjs/testing';
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
  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const mockTokenService = {
    generateTokens: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
        { provide: TokenService, useValue: mockTokenService },
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

  it('should register a new user, generate tokens and hash refresh token', async () => {
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
    expect(mockHashingService.hash).toHaveBeenCalledWith('Password123!');
    expect(mockHashingService.hash).toHaveBeenCalledWith('refresh-123');
    expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
  });
});
