import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { User } from '../../domain/entities/user.entity';
import { InvalidCurrentPasswordException } from '../../domain/exceptions/invalid-current-password.exception';
import { PasswordNotSetException } from '../../domain/exceptions/password-not-set.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ChangePasswordUseCase } from './change-password.use-case';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockHashingService = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', {
        currentPassword: 'old',
        newPassword: 'newPassword123!',
      }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw PasswordNotSetException if user registered with Google and has no password', async () => {
    const googleUser = new User();
    googleUser.id = 'uuid-google';
    googleUser.passwordHash = null;

    mockUserRepository.findById.mockResolvedValue(googleUser);

    await expect(
      useCase.execute('uuid-google', {
        currentPassword: 'any',
        newPassword: 'newPassword123!',
      }),
    ).rejects.toThrow(PasswordNotSetException);
  });

  it('should throw InvalidCurrentPasswordException if current password does not match', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.passwordHash = 'stored-hash';

    mockUserRepository.findById.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('uuid-1', {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123!',
      }),
    ).rejects.toThrow(InvalidCurrentPasswordException);
  });

  it('should hash new password and update user when current password is valid', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.passwordHash = 'stored-hash';

    mockUserRepository.findById.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(true);
    mockHashingService.hash.mockResolvedValue('new-hash-123');

    const result = await useCase.execute('uuid-1', {
      currentPassword: 'correctPassword',
      newPassword: 'newPassword123!',
    });

    expect(user.passwordHash).toBe('new-hash-123');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual({ message: 'Contraseña actualizada exitosamente' });
  });
});
