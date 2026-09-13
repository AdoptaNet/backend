import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { GetMyProfileUseCase } from './get-my-profile.use-case';
import { UpdateUserUseCase } from './update-user.use-case';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockGetMyProfileUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: GetMyProfileUseCase, useValue: mockGetMyProfileUseCase },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', { fullName: 'Updated' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should update fullName and avatarUrl, then return profile from getMyProfileUseCase', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.fullName = 'Old Name';
    user.avatarUrl = null;

    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue(user);

    const expectedProfile = {
      id: 'uuid-1',
      email: 'user@test.com',
      fullName: 'New Name',
      avatarUrl: 'https://avatar.com/photo.jpg',
      role: UserRole.ADOPTER,
      createdAt: new Date(),
    };
    mockGetMyProfileUseCase.execute.mockResolvedValue(expectedProfile);

    const result = await useCase.execute('uuid-1', {
      fullName: 'New Name',
      avatarUrl: 'https://avatar.com/photo.jpg',
    });

    expect(user.fullName).toBe('New Name');
    expect(user.avatarUrl).toBe('https://avatar.com/photo.jpg');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(result).toBe(expectedProfile);
  });
});
