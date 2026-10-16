import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShelterProfile } from '../../../users/domain/entities/shelter-profile.entity';
import { PetPhoto } from '../../domain/entities/pet-photo.entity';
import { Pet } from '../../domain/entities/pet.entity';
import { PetAgeCategory } from '../../domain/value-objects/pet-age-category.enum';
import { PetFurLength } from '../../domain/value-objects/pet-fur-length.enum';
import { PetGender } from '../../domain/value-objects/pet-gender.enum';
import { PetHealthStatus } from '../../domain/value-objects/pet-health-status.enum';
import { PetSize } from '../../domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { PetTrainingLevel } from '../../domain/value-objects/pet-training-level.enum';

export class PetPhotoResponseDto {
  @ApiProperty({ example: 'b6f63456-1111-4a97-aee3-8f5b34fac9a9' })
  id: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dadx6zirr/image/upload/v1234567890/firu-api/pets/pet1.jpg',
  })
  url: string;

  @ApiProperty({ example: 'firu-api/pets/pet1' })
  publicId: string;

  @ApiProperty({ example: true })
  isPrimary: boolean;

  @ApiProperty({ example: 0 })
  order: number;

  static fromEntity(photo: PetPhoto): PetPhotoResponseDto {
    const dto = new PetPhotoResponseDto();
    dto.id = photo.id;
    dto.url = photo.url;
    dto.publicId = photo.publicId;
    dto.isPrimary = photo.isPrimary;
    dto.order = photo.order;
    return dto;
  }
}

export class PetShelterResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiPropertyOptional({ example: 'Albergue Patitas Seguras' })
  organizationName: string | null;

  @ApiPropertyOptional({ example: 'Lima' })
  city: string | null;

  @ApiPropertyOptional({ example: 'Lima' })
  department: string | null;

  @ApiPropertyOptional({ example: 'contacto@patitas.org' })
  contactEmail: string | null;

  @ApiPropertyOptional({ example: '+51987654321' })
  phoneNumber: string | null;

  @ApiPropertyOptional({ example: true })
  isVerified?: boolean;
}

export class PetResponseDto {
  @ApiProperty({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  shelterId: string;

  @ApiProperty({ example: 'Firulais' })
  name: string;

  @ApiProperty({ enum: PetSpecies, example: PetSpecies.DOG })
  species: PetSpecies;

  @ApiProperty({ example: 'Mestizo' })
  breed: string;

  @ApiProperty({ enum: PetGender, example: PetGender.MALE })
  gender: PetGender;

  @ApiProperty({ example: 24 })
  ageMonths: number;

  @ApiProperty({ enum: PetAgeCategory, example: PetAgeCategory.YOUNG })
  ageCategory: PetAgeCategory;

  @ApiProperty({ enum: PetSize, example: PetSize.MEDIUM })
  size: PetSize;

  @ApiProperty({ enum: PetFurLength, example: PetFurLength.SHORT })
  furLength: PetFurLength;

  @ApiProperty({ example: true })
  isSterilized: boolean;

  @ApiProperty({ example: true })
  isVaccinated: boolean;

  @ApiProperty({ enum: PetHealthStatus, example: PetHealthStatus.HEALTHY })
  healthStatus: PetHealthStatus;

  @ApiPropertyOptional({
    example: 'Tratamiento cutáneo controlado',
    nullable: true,
  })
  healthNotes: string | null;

  @ApiProperty({ example: 3 })
  energyLevel: number;

  @ApiPropertyOptional({ example: true, nullable: true })
  goodWithChildren: boolean | null;

  @ApiPropertyOptional({ example: true, nullable: true })
  goodWithDogs: boolean | null;

  @ApiPropertyOptional({ example: false, nullable: true })
  goodWithCats: boolean | null;

  @ApiProperty({ example: 2 })
  vocalizationLevel: number;

  @ApiProperty({ enum: PetTrainingLevel, example: PetTrainingLevel.BASIC })
  trainingLevel: PetTrainingLevel;

  @ApiPropertyOptional({ example: 6, nullable: true })
  timeAloneToleranceHours: number | null;

  @ApiProperty({ example: 3 })
  shelterStayMonths: number;

  @ApiProperty({ example: 'Un perrito muy alegre y sociable.' })
  description: string;

  @ApiProperty({ enum: PetStatus, example: PetStatus.AVAILABLE })
  status: PetStatus;

  @ApiProperty({ type: [PetPhotoResponseDto] })
  photos: PetPhotoResponseDto[];

  @ApiPropertyOptional({ type: PetShelterResponseDto })
  shelter?: PetShelterResponseDto;

  @ApiPropertyOptional({
    example: ['negro', 'blanco'],
    type: [String],
    description: 'Colores identificados de la mascota',
  })
  colors?: string[];

  @ApiPropertyOptional({
    description: 'Documento JSONB con características médicas y conductuales',
  })
  characteristics?: Record<string, any>;

  @ApiProperty({ example: '2026-09-16T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-09-16T10:00:00.000Z' })
  updatedAt: Date;

  static fromEntity(
    pet: Pet,
    shelterProfile?: ShelterProfile | null,
  ): PetResponseDto {
    const dto = new PetResponseDto();
    dto.id = pet.id;
    dto.shelterId = pet.shelterId;
    dto.name = pet.name;
    dto.species = pet.species;
    dto.breed = pet.breed;
    dto.gender = pet.gender;
    dto.ageMonths = pet.ageMonths;
    dto.ageCategory = pet.ageCategory;
    const chars = pet.characteristics || {};
    const medical = chars.medical || {};
    const behavioral = chars.behavioral || {};

    dto.furLength = medical.fur_length ?? PetFurLength.SHORT;
    dto.isSterilized = medical.is_sterilized ?? false;
    dto.isVaccinated = medical.is_vaccinated ?? false;
    dto.healthStatus = medical.health_status ?? PetHealthStatus.HEALTHY;
    dto.healthNotes = medical.health_notes ?? null;
    dto.energyLevel = behavioral.energy_level ?? 3;
    dto.goodWithChildren = behavioral.good_with_children ?? null;
    dto.goodWithDogs = behavioral.good_with_dogs ?? null;
    dto.goodWithCats = behavioral.good_with_cats ?? null;
    dto.vocalizationLevel = behavioral.vocalization_level ?? 1;
    dto.trainingLevel = behavioral.training_level ?? PetTrainingLevel.NONE;
    dto.timeAloneToleranceHours = behavioral.time_alone_tolerance_hours ?? null;
    dto.shelterStayMonths = behavioral.shelter_stay_months ?? 0;
    dto.description = pet.description;
    dto.status = pet.status;

    dto.photos = pet.photos
      ? pet.photos
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((p) => PetPhotoResponseDto.fromEntity(p))
      : [];

    const profile = shelterProfile ?? pet.shelter?.shelterProfile;
    if (profile) {
      dto.shelter = {
        id: pet.shelterId,
        organizationName: profile.organizationName,
        city: profile.city,
        department: profile.department,
        contactEmail: profile.contactEmail || pet.shelter?.email || null,
        phoneNumber: profile.phoneNumber,
        isVerified: profile.isVerified ?? false,
      };
    }

    dto.characteristics = pet.characteristics ?? {};
    dto.colors = Array.isArray(pet.characteristics?.colors)
      ? pet.characteristics.colors
      : [];

    dto.createdAt = pet.createdAt;
    dto.updatedAt = pet.updatedAt;

    return dto;
  }
}
