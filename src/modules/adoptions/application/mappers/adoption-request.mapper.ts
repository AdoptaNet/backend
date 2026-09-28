import { AdoptionRequest } from '../../domain/entities/adoption-request.entity';
import { AdoptionRequestResponseDto } from '../dtos/adoption-request-response.dto';

export class AdoptionRequestMapper {
  static toResponseDto(entity: AdoptionRequest): AdoptionRequestResponseDto {
    const primaryPhoto =
      entity.pet?.photos?.find((p) => p.isPrimary) ||
      entity.pet?.photos?.[0];

    return {
      id: entity.id,
      petId: entity.petId,
      adopterId: entity.adopterId,
      shelterId: entity.shelterId,
      status: entity.status,
      motivationLetter: entity.motivationLetter,
      responsibilityPledge: entity.responsibilityPledge,
      adopterSnapshot: entity.adopterSnapshot,
      rejectionReason: entity.rejectionReason,
      rejectionNotes: entity.rejectionNotes,
      approvedAt: entity.approvedAt,
      rejectedAt: entity.rejectedAt,
      cancelledAt: entity.cancelledAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      pet: entity.pet
        ? {
            id: entity.pet.id,
            name: entity.pet.name,
            species: entity.pet.species,
            breed: entity.pet.breed,
            gender: entity.pet.gender,
            ageCategory: entity.pet.ageCategory,
            status: entity.pet.status,
            primaryPhotoUrl: primaryPhoto?.url || null,
          }
        : undefined,
      adopter: entity.adopter
        ? {
            id: entity.adopter.id,
            fullName: entity.adopter.fullName,
            email: entity.adopter.email,
            avatarUrl: entity.adopter.avatarUrl,
            city: entity.adopter.adopterProfile?.department || null,
          }
        : undefined,
      shelter: entity.shelter
        ? {
            id: entity.shelter.id,
            fullName: entity.shelter.fullName,
            email: entity.shelter.email,
            avatarUrl: entity.shelter.avatarUrl,
            organizationName:
              entity.shelter.shelterProfile?.organizationName || null,
            city: entity.shelter.shelterProfile?.city || null,
          }
        : undefined,
    };
  }
}
