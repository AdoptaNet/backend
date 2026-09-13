import { Injectable } from '@nestjs/common';
import { RoleMismatchException } from '../../domain/exceptions/role-mismatch.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { ShelterProfileResponseDto } from '../dtos/shelter-profile-response.dto';
import { UpdateShelterProfileDto } from '../dtos/update-shelter-profile.dto';

@Injectable()
export class UpdateShelterProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateShelterProfileDto,
  ): Promise<ShelterProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (user.role !== UserRole.SHELTER) {
      throw new RoleMismatchException(UserRole.SHELTER, user.role);
    }

    let profile = await this.shelterProfileRepository.findByUserId(userId);
    if (!profile) {
      profile = this.shelterProfileRepository.create({
        userId,
        ...dto,
      });
    } else {
      Object.assign(profile, dto);
    }

    const saved = await this.shelterProfileRepository.save(profile);

    return {
      id: saved.id,
      userId: saved.userId,
      organizationName: saved.organizationName,
      address: saved.address,
      city: saved.city,
      department: saved.department,
      phoneNumber: saved.phoneNumber,
      contactEmail: saved.contactEmail,
      description: saved.description,
      rescueCapacity: saved.rescueCapacity,
      facebookUrl: saved.facebookUrl,
      instagramUrl: saved.instagramUrl,
      latitude: saved.latitude,
      longitude: saved.longitude,
      isVerified: saved.isVerified,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
