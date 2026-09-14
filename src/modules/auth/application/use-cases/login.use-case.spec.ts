import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };
  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const mockTokenService = {
    generateTokens: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should throw InvalidCredentialsException if user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'Pass' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException if user has no passwordHash (Google OAuth user)', async () => {
    const googleUser = new User();
    googleUser.email = 'google@example.com';
    googleUser.passwordHash = null;
    mockUserRepository.findByEmail.mockResolvedValue(googleUser);

    await expect(
      useCase.execute({ email: 'google@example.com', password: 'Pass' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException if password does not match', async () => {
    const user = new User();
    user.email = 'user@example.com';
    user.passwordHash = 'hash';
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'Wrong' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should return tokens and user profile on successful login', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.email = 'user@example.com';
    user.passwordHash = 'hash';
    user.role = UserRole.ADOPTER;
    user.createdAt = new Date();

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(true);
    mockHashingService.hash.mockResolvedValue('hashed-new-refresh');
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockUserRepository.save.mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'CorrectPassword',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.id).toBe('uuid-1');
    expect(user.refreshTokenHash).toBe('hashed-new-refresh');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
