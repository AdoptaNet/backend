import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { JwtPayload, JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const mockUserRepository = {
    findById: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('test-jwt-secret');

    strategy = new JwtStrategy(
      mockConfigService as unknown as ConfigService,
      mockUserRepository as unknown as UserRepository,
    );
  });

  it('should throw error during construction if JWT_SECRET is missing', () => {
    const emptyConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(
      () =>
        new JwtStrategy(
          emptyConfigService,
          mockUserRepository as unknown as UserRepository,
        ),
    ).toThrow('JWT_SECRET environment variable is not defined');
  });

  it('should return user when payload is valid and user exists', async () => {
    const payload: JwtPayload = {
      sub: 'uuid-123',
      email: 'user@example.com',
      role: 'adopter',
    };

    const user = new User();
    user.id = 'uuid-123';
    user.email = 'user@example.com';
    user.role = UserRole.ADOPTER;

    mockUserRepository.findById.mockResolvedValue(user);

    const result = await strategy.validate(payload);

    expect(result).toBe(user);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('uuid-123');
  });

  it('should throw UnauthorizedException if sub is missing', async () => {
    const invalidPayload = {
      sub: '',
      email: 'user@example.com',
      role: 'adopter',
    };

    await expect(strategy.validate(invalidPayload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found in repository', async () => {
    const payload: JwtPayload = {
      sub: 'non-existent-uuid',
      email: 'user@example.com',
      role: 'adopter',
    };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
