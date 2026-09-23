import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { ShelterProfile } from '../../domain/entities/shelter-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { GetPublicShelterUseCase } from './get-public-shelter.use-case';

describe('GetPublicShelterUseCase', () => {
  let useCase: GetPublicShelterUseCase;
  const mockUserRepository = {
    findByIdWithProfile: jest.fn(),
  };
  const mockPetRepository = {
    findByShelter: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPublicShelterUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PetRepository, useValue: mockPetRepository },
      ],
    }).compile();

    useCase = module.get<GetPublicShelterUseCase>(GetPublicShelterUseCase);
  });

  it('should throw NotFoundException if shelter user is not found', async () => {
    mockUserRepository.findByIdWithProfile.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if user is not a shelter', async () => {
    const adopterUser = new User();
    adopterUser.id = 'adopter-1';
    adopterUser.role = UserRole.ADOPTER;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(adopterUser);

    await expect(useCase.execute('adopter-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return public shelter details and available pets', async () => {
    const shelterUser = new User();
    shelterUser.id = 'shelter-1';
    shelterUser.email = 'refugio@patitas.org';
    shelterUser.fullName = 'Patitas Felices';
    shelterUser.role = UserRole.SHELTER;
    shelterUser.createdAt = new Date('2026-01-01');

    const profile = new ShelterProfile();
    profile.id = 'profile-1';
    profile.organizationName = 'Albergue Patitas Felices';
    profile.city = 'Miraflores';
    profile.department = 'Lima';
    profile.phoneNumber = '+51987654321';
    profile.isVerified = true;
    shelterUser.shelterProfile = profile;

    mockUserRepository.findByIdWithProfile.mockResolvedValue(shelterUser);
    mockPetRepository.findByShelter.mockResolvedValue([[], 0]);

    const result = await useCase.execute('shelter-1');

    expect(result.id).toBe('profile-1');
    expect(result.organizationName).toBe('Albergue Patitas Felices');
    expect(result.city).toBe('Miraflores');
    expect(result.isVerified).toBe(true);
    expect(result.availablePets).toEqual([]);
    expect(mockPetRepository.findByShelter).toHaveBeenCalledWith('shelter-1', {
      status: 'available',
      limit: 50,
    });
  });
});
