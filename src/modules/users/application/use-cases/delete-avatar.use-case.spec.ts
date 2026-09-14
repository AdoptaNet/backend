import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../../../media/application/interfaces/media.service';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { DeleteAvatarUseCase } from './delete-avatar.use-case';
import { GetMyProfileUseCase } from './get-my-profile.use-case';

describe('DeleteAvatarUseCase', () => {
  let useCase: DeleteAvatarUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockMediaService = {
    deleteImage: jest.fn(),
  };
  const mockGetMyProfileUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAvatarUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: MediaService, useValue: mockMediaService },
        { provide: GetMyProfileUseCase, useValue: mockGetMyProfileUseCase },
      ],
    }).compile();

    useCase = module.get<DeleteAvatarUseCase>(DeleteAvatarUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id')).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('should delete avatar from Cloudinary, clear fields, and return profile', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.avatarUrl = 'https://res.cloudinary.com/avatar.webp';
    user.avatarKey = 'firu-api/avatars/123';

    mockUserRepository.findById.mockResolvedValue(user);
    mockMediaService.deleteImage.mockResolvedValue(true);
    mockUserRepository.save.mockResolvedValue(user);
    mockGetMyProfileUseCase.execute.mockResolvedValue({
      id: 'uuid-1',
      avatarUrl: null,
    });

    const result = await useCase.execute('uuid-1');

    expect(mockMediaService.deleteImage).toHaveBeenCalledWith(
      'firu-api/avatars/123',
    );
    expect(user.avatarUrl).toBeNull();
    expect(user.avatarKey).toBeNull();
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(result.avatarUrl).toBeNull();
  });

  it('should clear avatar fields when user has no Cloudinary key', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.avatarUrl = 'https://google.com/photo.jpg';
    user.avatarKey = null;

    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue(user);
    mockGetMyProfileUseCase.execute.mockResolvedValue({
      id: 'uuid-1',
      avatarUrl: null,
    });

    const result = await useCase.execute('uuid-1');

    expect(mockMediaService.deleteImage).not.toHaveBeenCalled();
    expect(user.avatarUrl).toBeNull();
    expect(result.avatarUrl).toBeNull();
  });
});
