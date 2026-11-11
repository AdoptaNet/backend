import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShelterProfileRepository } from '../../domain/repositories/shelter-profile.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { ShelterProfileResponseDto } from '../dtos/shelter-profile-response.dto';

@Injectable()
export class RequestShelterVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
  ) {}

  async execute(userId: string): Promise<ShelterProfileResponseDto> {
    const user = await this.userRepository.findByIdWithProfile(userId);

    if (!user || user.role !== UserRole.SHELTER || !user.shelterProfile) {
      throw new NotFoundException('Perfil de albergue no encontrado');
    }

    if (user.shelterProfile.isVerified) {
      throw new BadRequestException('El albergue ya se encuentra verificado');
    }

    if (user.shelterProfile.verificationRequested) {
      throw new BadRequestException(
        'Ya existe una solicitud de verificación en revisión por la administración',
      );
    }

    const profile = user.shelterProfile;
    if (!profile.organizationName?.trim()) {
      throw new BadRequestException(
        'Debes registrar el nombre de tu organización antes de solicitar la verificación',
      );
    }

    if (!profile.phoneNumber?.trim() && !profile.contactEmail?.trim()) {
      throw new BadRequestException(
        'Debes ingresar al menos un dato de contacto (teléfono o correo público) antes de solicitar la verificación',
      );
    }

    profile.verificationRequested = true;
    profile.verificationRequestedAt = new Date();

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
      verificationRequested: saved.verificationRequested,
      verificationRequestedAt: saved.verificationRequestedAt,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
