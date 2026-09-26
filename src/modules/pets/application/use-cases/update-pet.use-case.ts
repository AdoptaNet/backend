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
    if (dto.furLength !== undefined) pet.furLength = dto.furLength;
    if (dto.isSterilized !== undefined) pet.isSterilized = dto.isSterilized;
    if (dto.isVaccinated !== undefined) pet.isVaccinated = dto.isVaccinated;
    if (dto.healthStatus !== undefined) pet.healthStatus = dto.healthStatus;
    if (dto.healthNotes !== undefined) {
      pet.healthNotes = dto.healthNotes?.trim() || null;
    }
    if (dto.energyLevel !== undefined) pet.energyLevel = dto.energyLevel;
    if (dto.goodWithChildren !== undefined) {
      pet.goodWithChildren = dto.goodWithChildren;
    }
    if (dto.goodWithDogs !== undefined) pet.goodWithDogs = dto.goodWithDogs;
    if (dto.goodWithCats !== undefined) pet.goodWithCats = dto.goodWithCats;
    if (dto.vocalizationLevel !== undefined) {
      pet.vocalizationLevel = dto.vocalizationLevel;
    }
    if (dto.trainingLevel !== undefined) {
      pet.trainingLevel = dto.trainingLevel;
    }
    if (dto.timeAloneToleranceHours !== undefined) {
      pet.timeAloneToleranceHours = dto.timeAloneToleranceHours;
    }
    if (dto.shelterStayMonths !== undefined) {
      pet.shelterStayMonths = dto.shelterStayMonths;
    }
    if (dto.description !== undefined) pet.description = dto.description.trim();
    if (dto.status !== undefined) pet.status = dto.status;

    const savedPet = await this.petRepository.save(pet);

    this.eventEmitter.emit(
      'pet.updated',
      new PetUpdatedEvent(savedPet.id, savedPet.shelterId, savedPet.status),
    );

    return PetResponseDto.fromEntity(savedPet, pet.shelter?.shelterProfile);
  }
}
