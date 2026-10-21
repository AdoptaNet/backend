import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MediaService } from '../../../media/application/interfaces/media.service';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetPhoto } from '../../domain/entities/pet-photo.entity';
import { PetUpdatedEvent } from '../../domain/events/pet-updated.event';
import { InvalidPhotoCountException } from '../../domain/exceptions/invalid-photo-count.exception';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { calculateAgeCategory } from '../../domain/utils/calculate-age-category.util';
import { buildPetCharacteristics } from '../../domain/utils/pet-characteristics.util';
import { PetResponseDto } from '../dtos/pet-response.dto';
import { UpdatePetDto } from '../dtos/update-pet.dto';

@Injectable()
export class UpdatePetUseCase {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly mediaService: MediaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    user: User,
    dto: UpdatePetDto,
  ): Promise<PetResponseDto> {
    const pet = await this.petRepository.findByIdWithPhotos(id);
    if (!pet) {
      throw new PetNotFoundException(id);
    }

    if (pet.shelterId !== user.id && user.role !== UserRole.ADMIN) {
      throw new PetAccessForbiddenException(
        'No tienes permisos para modificar esta mascota',
      );
    }

    if (dto.photos !== undefined) {
      if (dto.photos.length < 3 || dto.photos.length > 6) {
        throw new InvalidPhotoCountException(
          'Debe incluir entre 3 y 6 fotografías',
        );
      }
      const primaryCount = dto.photos.filter((p) => p.isPrimary).length;
      if (primaryCount !== 1) {
        throw new InvalidPhotoCountException(
          'Debe haber exactamente una fotografía principal marcada',
        );
      }

      // CA-09.4: Clean up orphaned photos in Cloudinary
      const newPublicIds = new Set(dto.photos.map((p) => p.publicId));
      const orphanedPhotos = (pet.photos || []).filter(
        (oldPhoto) => oldPhoto.publicId && !newPublicIds.has(oldPhoto.publicId),
      );
      for (const orphan of orphanedPhotos) {
        try {
          await this.mediaService.deleteImage(orphan.publicId);
        } catch {
          // Non-blocking cleanup
        }
      }

      pet.photos = dto.photos.map((p, index) => {
        const photo = new PetPhoto();
        if (p.id) photo.id = p.id;
        photo.url = p.url;
        photo.publicId = p.publicId;
        photo.isPrimary = p.isPrimary;
        photo.order = p.order !== undefined ? p.order : index;
        return photo;
      });
    }

    if (dto.name !== undefined) pet.name = dto.name.trim();
    if (dto.species !== undefined) pet.species = dto.species;
    if (dto.breed !== undefined) pet.breed = dto.breed.trim();
    if (dto.gender !== undefined) pet.gender = dto.gender;

    if (dto.ageMonths !== undefined) {
      pet.ageMonths = dto.ageMonths;
      pet.ageCategory = dto.ageCategory || calculateAgeCategory(dto.ageMonths);
    } else if (dto.ageCategory !== undefined) {
      pet.ageCategory = dto.ageCategory;
    }

    if (dto.size !== undefined) pet.size = dto.size;
    if (dto.description !== undefined) pet.description = dto.description.trim();
    if (dto.status !== undefined) pet.status = dto.status;

    if (
      dto.characteristics !== undefined ||
      dto.colors !== undefined ||
      dto.furLength !== undefined ||
      dto.isSterilized !== undefined ||
      dto.isVaccinated !== undefined ||
      dto.vaccinesApplied !== undefined ||
      dto.healthStatus !== undefined ||
      dto.healthNotes !== undefined ||
      dto.energyLevel !== undefined ||
      dto.goodWithChildren !== undefined ||
      dto.goodWithDogs !== undefined ||
      dto.goodWithCats !== undefined ||
      dto.vocalizationLevel !== undefined ||
      dto.trainingLevel !== undefined ||
      dto.timeAloneToleranceHours !== undefined ||
      dto.shelterStayMonths !== undefined
    ) {
      const prevChars = pet.characteristics || {};
      const prevMed = prevChars.medical || {};
      const prevBeh = prevChars.behavioral || {};

      pet.characteristics = dto.characteristics || {
        ...prevChars,
        colors: dto.colors ?? prevChars.colors ?? [],
        medical: {
          ...prevMed,
          fur_length: dto.furLength ?? prevMed.fur_length ?? 'short',
          is_sterilized: dto.isSterilized ?? prevMed.is_sterilized ?? false,
          is_vaccinated: dto.isVaccinated ?? prevMed.is_vaccinated ?? false,
          vaccines_applied:
            dto.vaccinesApplied !== undefined
              ? (Array.isArray(dto.vaccinesApplied)
                  ? dto.vaccinesApplied.map((v: any) => String(v).trim()).filter(Boolean)
                  : typeof dto.vaccinesApplied === 'string'
                    ? dto.vaccinesApplied.split(',').map((v) => v.trim()).filter(Boolean)
                    : dto.vaccinesApplied)
              : (prevMed.vaccines_applied ?? null),
          health_status: dto.healthStatus ?? prevMed.health_status ?? 'healthy',
          health_notes:
            dto.healthNotes !== undefined
              ? dto.healthNotes?.trim() || null
              : (prevMed.health_notes ?? null),
        },
        behavioral: {
          ...prevBeh,
          energy_level: dto.energyLevel ?? prevBeh.energy_level ?? 3,
          vocalization_level:
            dto.vocalizationLevel ?? prevBeh.vocalization_level ?? 1,
          training_level: dto.trainingLevel ?? prevBeh.training_level ?? 'none',
          good_with_children:
            dto.goodWithChildren !== undefined
              ? dto.goodWithChildren
              : (prevBeh.good_with_children ?? null),
          good_with_dogs:
            dto.goodWithDogs !== undefined
              ? dto.goodWithDogs
              : (prevBeh.good_with_dogs ?? null),
          good_with_cats:
            dto.goodWithCats !== undefined
              ? dto.goodWithCats
              : (prevBeh.good_with_cats ?? null),
          time_alone_tolerance_hours:
            dto.timeAloneToleranceHours !== undefined
              ? dto.timeAloneToleranceHours
              : (prevBeh.time_alone_tolerance_hours ?? null),
          shelter_stay_months:
            dto.shelterStayMonths ?? prevBeh.shelter_stay_months ?? 0,
        },
      };
    }

    if (dto.visualEmbedding !== undefined) {
      pet.visualEmbedding = dto.visualEmbedding;
    }

    const savedPet = await this.petRepository.save(pet);

    this.eventEmitter.emit(
      'pet.updated',
      new PetUpdatedEvent(savedPet.id, savedPet.shelterId, savedPet.status),
    );

    return PetResponseDto.fromEntity(savedPet, pet.shelter?.shelterProfile);
  }
}
