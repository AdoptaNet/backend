import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { RequestShelterVerificationUseCase } from './request-shelter-verification.use-case';

describe('RequestShelterVerificationUseCase', () => {
  let useCase: RequestShelterVerificationUseCase;
  const mockUserRepository = {
    findByIdWithProfile: jest.fn(),
  };
  const mockShelterProfileRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestShelterVerificationUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: ShelterProfileRepository,
          useValue: mockShelterProfileRepository,
        },
      ],
    }).compile();

    useCase = module.get<RequestShelterVerificationUseCase>(
      RequestShelterVerificationUseCase,
    );
  });

  it('should throw NotFoundException if shelter user is not found', async () => {
    mockUserRepository.findByIdWithProfile.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if already verified', async () => {
    const user = new User();
    user.id = 'shelter-1';
    user.role = UserRole.SHELTER;
    const profile = new ShelterProfile();
    profile.isVerified = true;
    user.shelterProfile = profile;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(user);

    await expect(useCase.execute('shelter-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if already requested', async () => {
    const user = new User();
    user.id = 'shelter-1';
    user.role = UserRole.SHELTER;
    const profile = new ShelterProfile();
    profile.isVerified = false;
    profile.verificationRequested = true;
    user.shelterProfile = profile;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(user);

    await expect(useCase.execute('shelter-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if organizationName is missing', async () => {
    const user = new User();
    user.id = 'shelter-1';
    user.role = UserRole.SHELTER;
    const profile = new ShelterProfile();
    profile.isVerified = false;
    profile.verificationRequested = false;
    profile.organizationName = '';
    user.shelterProfile = profile;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(user);

    await expect(useCase.execute('shelter-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should successfully request verification and mark verificationRequested=true', async () => {
    const user = new User();
    user.id = 'shelter-1';
    user.role = UserRole.SHELTER;
    const profile = new ShelterProfile();
    profile.id = 'prof-1';
    profile.userId = 'shelter-1';
    profile.organizationName = 'Albergue Huellitas Felices';
    profile.phoneNumber = '+51 987654321';
    profile.isVerified = false;
    profile.verificationRequested = false;
    user.shelterProfile = profile;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(user);
    mockShelterProfileRepository.save.mockImplementation((p) =>
      Promise.resolve(p),
    );

    const result = await useCase.execute('shelter-1');

    expect(result.verificationRequested).toBe(true);
    expect(result.verificationRequestedAt).toBeInstanceOf(Date);
    expect(mockShelterProfileRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationRequested: true,
      }),
    );
  });
});
