import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { MediaService } from '../../../media/application/interfaces/media.service';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { AccountDeletionBlockedException } from '../../domain/exceptions/account-deletion-blocked.exception';
import { InvalidCurrentPasswordException } from '../../domain/exceptions/invalid-current-password.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { DeleteAccountUseCase } from './delete-account.use-case';

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const mockPetRepository = {
    findByShelter: jest.fn(),
  };
  const mockMediaService = {
    deleteImage: jest.fn(),
  };
  const mockHashingService = {
    compare: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccountUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PetRepository, useValue: mockPetRepository },
        { provide: MediaService, useValue: mockMediaService },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    useCase = module.get<DeleteAccountUseCase>(DeleteAccountUseCase);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('should throw InvalidCurrentPasswordException if password account does not provide password', async () => {
    const user = new User();
    user.id = 'user-1';
    user.passwordHash = 'hash';
    mockUserRepository.findById.mockResolvedValue(user);

    await expect(useCase.execute('user-1', {})).rejects.toThrow(
      InvalidCurrentPasswordException,
    );
  });

  it('should throw InvalidCurrentPasswordException if password does not match', async () => {
    const user = new User();
    user.id = 'user-1';
    user.passwordHash = 'hash';
    mockUserRepository.findById.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('user-1', { password: 'wrong-password' }),
    ).rejects.toThrow(InvalidCurrentPasswordException);
  });

  it('should throw AccountDeletionBlockedException if shelter has available or in_process pets', async () => {
    const shelterUser = new User();
    shelterUser.id = 'shelter-1';
    shelterUser.role = UserRole.SHELTER;
    shelterUser.passwordHash = null;

    mockUserRepository.findById.mockResolvedValue(shelterUser);
    mockPetRepository.findByShelter
      .mockResolvedValueOnce([[], 2]) // 2 available pets
      .mockResolvedValueOnce([[], 0]); // 0 in_process pets

    await expect(useCase.execute('shelter-1')).rejects.toThrow(
      AccountDeletionBlockedException,
    );
  });

  it('should successfully soft-delete and anonymize user under Ley 29733', async () => {
    const user = new User();
    user.id = 'uuid-arco-1';
    user.email = 'original@example.com';
    user.fullName = 'Juan Perez';
    user.role = UserRole.ADOPTER;
    user.passwordHash = 'hash123';
    user.avatarKey = 'avatars/pic_1';
    user.avatarUrl = 'https://cloudinary.com/pic_1';
    user.googleId = 'google-123';
    user.refreshTokenHash = 'refresh-123';
    user.isActive = true;

    mockUserRepository.findById.mockResolvedValue(user);
    mockHashingService.compare.mockResolvedValue(true);
    mockMediaService.deleteImage.mockResolvedValue(undefined);
    mockUserRepository.save.mockResolvedValue(user);

    const result = await useCase.execute('uuid-arco-1', {
      password: 'CorrectPassword123!',
    });

    expect(result.message).toContain('Ley N° 29733');
    expect(user.isActive).toBe(false);
    expect(user.deletedAt).toBeInstanceOf(Date);
    expect(user.email).toBe('anon_uuid-arco-1@deleted.adoptanet.pe');
    expect(user.fullName).toBe('Usuario Eliminado');
    expect(user.avatarUrl).toBeNull();
    expect(user.avatarKey).toBeNull();
    expect(user.googleId).toBeNull();
    expect(user.passwordHash).toBeNull();
    expect(user.refreshTokenHash).toBeNull();
    expect(mockMediaService.deleteImage).toHaveBeenCalledWith('avatars/pic_1');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
});
