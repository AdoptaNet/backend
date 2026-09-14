import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { DeleteAvatarUseCase } from '../../application/use-cases/delete-avatar.use-case';
import { GetMyProfileUseCase } from '../../application/use-cases/get-my-profile.use-case';
import { UpdateAdopterProfileUseCase } from '../../application/use-cases/update-adopter-profile.use-case';
import { UpdateAvatarUseCase } from '../../application/use-cases/update-avatar.use-case';
import { UpdateShelterProfileUseCase } from '../../application/use-cases/update-shelter-profile.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  const mockGetMyProfileUseCase = { execute: jest.fn() };
  const mockUpdateUserUseCase = { execute: jest.fn() };
  const mockUpdateAvatarUseCase = { execute: jest.fn() };
  const mockDeleteAvatarUseCase = { execute: jest.fn() };
  const mockChangePasswordUseCase = { execute: jest.fn() };
  const mockUpdateAdopterProfileUseCase = { execute: jest.fn() };
  const mockUpdateShelterProfileUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: GetMyProfileUseCase, useValue: mockGetMyProfileUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: UpdateAvatarUseCase, useValue: mockUpdateAvatarUseCase },
        { provide: DeleteAvatarUseCase, useValue: mockDeleteAvatarUseCase },
        { provide: ChangePasswordUseCase, useValue: mockChangePasswordUseCase },
        {
          provide: UpdateAdopterProfileUseCase,
          useValue: mockUpdateAdopterProfileUseCase,
        },
        {
          provide: UpdateShelterProfileUseCase,
          useValue: mockUpdateShelterProfileUseCase,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should call GetMyProfileUseCase on getMe', async () => {
    const user = new User();
    user.id = 'uuid-1';
    const profile = {
      id: 'uuid-1',
      email: 'test@test.com',
      role: UserRole.ADOPTER,
    };
    mockGetMyProfileUseCase.execute.mockResolvedValue(profile);

    const result = await controller.getMe(user);

    expect(result).toBe(profile);
    expect(mockGetMyProfileUseCase.execute).toHaveBeenCalledWith('uuid-1');
  });

  it('should call UpdateUserUseCase on updateMe', async () => {
    const user = new User();
    user.id = 'uuid-1';
    const dto = { fullName: 'New Name' };
    const updated = { id: 'uuid-1', fullName: 'New Name' };
    mockUpdateUserUseCase.execute.mockResolvedValue(updated);

    const result = await controller.updateMe(user, dto);

    expect(result).toBe(updated);
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('should call UpdateAvatarUseCase on updateAvatar', async () => {
    const user = new User();
    user.id = 'uuid-1';
    const file = { mimetype: 'image/jpeg' } as Express.Multer.File;
    const updated = {
      id: 'uuid-1',
      avatarUrl: 'https://res.cloudinary.com/avatar.jpg',
    };
    mockUpdateAvatarUseCase.execute.mockResolvedValue(updated);

    const result = await controller.updateAvatar(user, file);

    expect(result).toBe(updated);
    expect(mockUpdateAvatarUseCase.execute).toHaveBeenCalledWith(
      'uuid-1',
      file,
    );
  });

  it('should call DeleteAvatarUseCase on deleteAvatar', async () => {
    const user = new User();
    user.id = 'uuid-1';
    const updated = { id: 'uuid-1', avatarUrl: null };
    mockDeleteAvatarUseCase.execute.mockResolvedValue(updated);

    const result = await controller.deleteAvatar(user);

    expect(result).toBe(updated);
    expect(mockDeleteAvatarUseCase.execute).toHaveBeenCalledWith('uuid-1');
  });

  it('should call ChangePasswordUseCase on changePassword', async () => {
    const user = new User();
    user.id = 'uuid-1';
    const dto = { currentPassword: 'old', newPassword: 'newPassword123!' };
    mockChangePasswordUseCase.execute.mockResolvedValue({ message: 'OK' });

    const result = await controller.changePassword(user, dto);

    expect(result).toEqual({ message: 'OK' });
    expect(mockChangePasswordUseCase.execute).toHaveBeenCalledWith(
      'uuid-1',
      dto,
    );
  });

  it('should call UpdateAdopterProfileUseCase on updateAdopterProfile', async () => {
    const user = new User();
    user.id = 'uuid-1';
    const dto = { department: 'Lima' };
    const profile = { id: 'prof-1', userId: 'uuid-1', department: 'Lima' };
    mockUpdateAdopterProfileUseCase.execute.mockResolvedValue(profile);

    const result = await controller.updateAdopterProfile(user, dto);

    expect(result).toBe(profile);
    expect(mockUpdateAdopterProfileUseCase.execute).toHaveBeenCalledWith(
      'uuid-1',
      dto,
    );
  });

  it('should call UpdateShelterProfileUseCase on updateShelterProfile', async () => {
    const user = new User();
    user.id = 'uuid-2';
    const dto = { organizationName: 'Patitas' };
    const profile = {
      id: 'shelter-1',
      userId: 'uuid-2',
      organizationName: 'Patitas',
    };
    mockUpdateShelterProfileUseCase.execute.mockResolvedValue(profile);

    const result = await controller.updateShelterProfile(user, dto);

    expect(result).toBe(profile);
    expect(mockUpdateShelterProfileUseCase.execute).toHaveBeenCalledWith(
      'uuid-2',
      dto,
    );
  });
});
