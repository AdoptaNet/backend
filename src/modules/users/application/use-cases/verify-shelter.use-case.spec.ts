import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../../notifications/application/interfaces/email.service';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { VerifyShelterUseCase } from './verify-shelter.use-case';

describe('VerifyShelterUseCase', () => {
  let useCase: VerifyShelterUseCase;
  const mockUserRepository = {
    findByIdWithProfile: jest.fn(),
  };
  const mockShelterProfileRepository = {
    save: jest.fn(),
  };
  const mockEmailService = {
    sendShelterVerificationEmail: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyShelterUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: ShelterProfileRepository,
          useValue: mockShelterProfileRepository,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<VerifyShelterUseCase>(VerifyShelterUseCase);
  });

  it('should throw NotFoundException if shelter is not found', async () => {
    mockUserRepository.findByIdWithProfile.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-id', { isVerified: true }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should verify shelter, save, and send verification email', async () => {
    const shelterUser = new User();
    shelterUser.id = 'shelter-1';
    shelterUser.email = 'shelter@example.com';
    shelterUser.role = UserRole.SHELTER;

    const profile = new ShelterProfile();
    profile.id = 'prof-1';
    profile.organizationName = 'Refugio Huellitas';
    profile.isVerified = false;
    shelterUser.shelterProfile = profile;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(shelterUser);
    mockShelterProfileRepository.save.mockImplementation((p) =>
      Promise.resolve(p),
    );
    mockEmailService.sendShelterVerificationEmail.mockResolvedValue({
      id: 'email-1',
      success: true,
    });

    const result = await useCase.execute('shelter-1', { isVerified: true });

    expect(result.isVerified).toBe(true);
    expect(mockShelterProfileRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isVerified: true }),
    );
    expect(mockEmailService.sendShelterVerificationEmail).toHaveBeenCalledWith(
      'shelter@example.com',
      {
        userId: 'shelter-1',
        organizationName: 'Refugio Huellitas',
        isVerified: true,
        shelterUrl: 'http://localhost:3000/shelters/shelter-1',
      },
    );
  });
});
