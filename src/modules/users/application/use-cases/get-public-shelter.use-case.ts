import { Injectable, NotFoundException } from '@nestjs/common';
import { PetResponseDto } from '../../../pets/application/dtos/pet-response.dto';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { PublicShelterResponseDto } from '../dtos/public-shelter-response.dto';

@Injectable()
export class GetPublicShelterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly petRepository: PetRepository,
  ) {}

  async execute(identifier: string): Promise<PublicShelterResponseDto> {
    const user = await this.userRepository.findByIdWithProfile(identifier);

    if (!user || user.role !== UserRole.SHELTER || !user.shelterProfile) {
      throw new NotFoundException('Albergue no encontrado');
    }

    const [pets] = await this.petRepository.findByShelter(user.id, {
      status: PetStatus.AVAILABLE,
      limit: 50,
    });

    const availablePets = pets.map((pet) =>
      PetResponseDto.fromEntity(pet, user.shelterProfile),
    );

    const profile = user.shelterProfile;

    return {
      id: profile.id,
      userId: user.id,
      organizationName:
        profile.organizationName || user.fullName || 'Albergue sin nombre',
      description: profile.description,
      address: profile.address,
      city: profile.city,
      department: profile.department,
      phoneNumber: profile.phoneNumber,
      contactEmail: profile.contactEmail || user.email,
      rescueCapacity: profile.rescueCapacity,
      facebookUrl: profile.facebookUrl,
      instagramUrl: profile.instagramUrl,
      latitude: profile.latitude,
      longitude: profile.longitude,
      isVerified: profile.isVerified,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      availablePets,
    };
  }
}
