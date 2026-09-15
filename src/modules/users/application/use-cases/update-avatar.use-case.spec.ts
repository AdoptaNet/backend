import { Test, TestingModule } from '@nestjs/testing';
import { UploadImageUseCase } from '../../../media/application/use-cases/upload-image.use-case';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { GetMyProfileUseCase } from './get-my-profile.use-case';
import { UpdateAvatarUseCase } from './update-avatar.use-case';

describe('UpdateAvatarUseCase', () => {
  let useCase: UpdateAvatarUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockUploadImageUseCase = {
    execute: jest.fn(),
  };
  const mockGetMyProfileUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAvatarUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: UploadImageUseCase, useValue: mockUploadImageUseCase },
        { provide: GetMyProfileUseCase, useValue: mockGetMyProfileUseCase },
      ],
    }).compile();

    useCase = module.get<UpdateAvatarUseCase>(UpdateAvatarUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', {} as Express.Multer.File),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should upload avatar, update user, and return profile', async () => {
    const user = new User();
    user.id = 'uuid-1';
    user.avatarUrl = null;
    user.avatarKey = null;

    const file = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('photo'),
    } as Express.Multer.File;

    mockUserRepository.findById.mockResolvedValue(user);
    mockUploadImageUseCase.execute.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
      publicId: 'firu-api/avatars/123',
      format: 'webp',
      bytes: 2048,
    });
    mockUserRepository.save.mockResolvedValue(user);
    mockGetMyProfileUseCase.execute.mockResolvedValue({
      id: 'uuid-1',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
    });

    const result = await useCase.execute('uuid-1', file);

    expect(mockUploadImageUseCase.execute).toHaveBeenCalledWith(file, {
      folder: 'avatars',
    });
    expect(user.avatarUrl).toBe(
      'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
    );
    expect(user.avatarKey).toBe('firu-api/avatars/123');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    expect(result.avatarUrl).toBe(
      'https://res.cloudinary.com/demo/image/upload/v1/avatar.webp',
    );
  });
});
