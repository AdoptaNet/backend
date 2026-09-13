import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
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
        RefreshTokenUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should throw UnauthorizedException if user not found or has no refresh token', async () => {
    mockTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'uuid-1',
      email: 'a@b.com',
      role: 'adopter',
    });
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ refreshToken: 'some-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should invalidate session and throw UnauthorizedException if token does not match stored hash', async () => {
    mockTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'uuid-1',
      email: 'a@b.com',
      role: 'adopter',
    });
    const user = new User();
    user.id = 'uuid-1';
    user.refreshTokenHash = 'stored-hash';
    mockUserRepository.findById.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ refreshToken: 'stolen-or-outdated-token' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(user.refreshTokenHash).toBeNull();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });

  it('should rotate tokens successfully on valid refresh token', async () => {
    mockTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'uuid-1',
      email: 'user@example.com',
      role: 'adopter',
    });

    const user = new User();
    user.id = 'uuid-1';
    user.email = 'user@example.com';
    user.role = UserRole.ADOPTER;
    user.refreshTokenHash = 'valid-hash';
    user.createdAt = new Date();

    mockUserRepository.findById.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(true);
    mockHashingService.hash.mockResolvedValue('new-hash');
    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    mockUserRepository.save.mockResolvedValue(user);

    const result = await useCase.execute({ refreshToken: 'valid-refresh' });

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(user.refreshTokenHash).toBe('new-hash');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
