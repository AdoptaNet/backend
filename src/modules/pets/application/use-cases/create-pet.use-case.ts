import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { ShelterProfileRepository } from '../../../users/domain/repositories/shelter-profile.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetPhoto } from '../../domain/entities/pet-photo.entity';
import { Pet } from '../../domain/entities/pet.entity';
import { InvalidPhotoCountException } from '../../domain/exceptions/invalid-photo-count.exception';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { ShelterProfileIncompleteException } from '../../domain/exceptions/shelter-profile-incomplete.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { calculateAgeCategory } from '../../domain/utils/calculate-age-category.util';
import { PetFurLength } from '../../domain/value-objects/pet-fur-length.enum';
import { PetHealthStatus } from '../../domain/value-objects/pet-health-status.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { PetTrainingLevel } from '../../domain/value-objects/pet-training-level.enum';
import { CreatePetDto } from '../dtos/create-pet.dto';
import { PetResponseDto } from '../dtos/pet-response.dto';

@Injectable()
export class CreatePetUseCase {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly shelterProfileRepository: ShelterProfileRepository,
  ) {}

  async execute(user: User, dto: CreatePetDto): Promise<PetResponseDto> {
    if (user.role !== UserRole.SHELTER && user.role !== UserRole.ADMIN) {
      throw new PetAccessForbiddenException(
        'Solo los usuarios con rol de albergue pueden registrar mascotas',
      );
    }

    const shelterProfile = await this.shelterProfileRepository.findByUserId(
      user.id,
    );

    if (
      !shelterProfile ||
      !shelterProfile.organizationName?.trim() ||
      !shelterProfile.phoneNumber?.trim() ||
      !shelterProfile.city?.trim()
    ) {
      throw new ShelterProfileIncompleteException();
    }

    if (!dto.photos || dto.photos.length < 1 || dto.photos.length > 6) {
      throw new InvalidPhotoCountException(
        'Debe incluir entre 1 y 6 fotografías',
      );
    }

    const primaryPhotos = dto.photos.filter((photo) => photo.isPrimary);
    if (primaryPhotos.length !== 1) {
      throw new InvalidPhotoCountException(
        'Debe haber exactamente una fotografía principal marcada',
      );
    }

    const ageCategory = dto.ageCategory || calculateAgeCategory(dto.ageMonths);

    const pet = new Pet();
    pet.shelterId = user.id;
    pet.name = dto.name.trim();
    pet.species = dto.species;
    pet.breed = dto.breed?.trim() || 'Mestizo';
    pet.gender = dto.gender;
    pet.ageMonths = dto.ageMonths;
    pet.ageCategory = ageCategory;
    pet.size = dto.size;
    pet.furLength = dto.furLength ?? PetFurLength.SHORT;
    pet.isSterilized = dto.isSterilized ?? false;
    pet.isVaccinated = dto.isVaccinated ?? false;
    pet.healthStatus = dto.healthStatus ?? PetHealthStatus.HEALTHY;
    pet.healthNotes = dto.healthNotes?.trim() || null;
    pet.energyLevel = dto.energyLevel;
    pet.goodWithChildren = dto.goodWithChildren ?? null;
    pet.goodWithDogs = dto.goodWithDogs ?? null;
    pet.goodWithCats = dto.goodWithCats ?? null;
    pet.vocalizationLevel = dto.vocalizationLevel;
    pet.trainingLevel = dto.trainingLevel ?? PetTrainingLevel.NONE;
    pet.timeAloneToleranceHours = dto.timeAloneToleranceHours ?? null;
    pet.shelterStayMonths = dto.shelterStayMonths ?? 0;
    pet.description = dto.description.trim();
    pet.status = dto.status ?? PetStatus.AVAILABLE;

    pet.photos = dto.photos.map((p, index) => {
      const photo = new PetPhoto();
      photo.url = p.url;
      photo.publicId = p.publicId;
      photo.isPrimary = p.isPrimary;
      photo.order = p.order !== undefined ? p.order : index;
      return photo;
    });

    const savedPet = await this.petRepository.save(pet);
    return PetResponseDto.fromEntity(savedPet, shelterProfile);
  }
}
