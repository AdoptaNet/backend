import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PetAgeCategory } from '../../domain/value-objects/pet-age-category.enum';
import { PetFurLength } from '../../domain/value-objects/pet-fur-length.enum';
import { PetGender } from '../../domain/value-objects/pet-gender.enum';
import { PetHealthStatus } from '../../domain/value-objects/pet-health-status.enum';
import { PetSize } from '../../domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { PetTrainingLevel } from '../../domain/value-objects/pet-training-level.enum';
import { PetPhotoItemDto } from './pet-photo-item.dto';

export class CreatePetDto {
  @ApiProperty({
    description: 'Nombre de la mascota',
    example: 'Firulais',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Especie de la mascota',
    enum: PetSpecies,
    example: PetSpecies.DOG,
  })
  @IsEnum(PetSpecies)
  species: PetSpecies;

  @ApiPropertyOptional({
    description: 'Raza de la mascota',
    example: 'Mestizo',
    default: 'Mestizo',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  breed?: string;

  @ApiProperty({
    description: 'Sexo o género de la mascota',
    enum: PetGender,
    example: PetGender.MALE,
  })
  @IsEnum(PetGender)
  gender: PetGender;

  @ApiProperty({
    description: 'Edad en meses',
    example: 24,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageMonths: number;

  @ApiPropertyOptional({
    description:
      'Categoría de edad. Si no se especifica, se calculará automáticamente según ageMonths.',
    enum: PetAgeCategory,
    example: PetAgeCategory.YOUNG,
  })
  @IsOptional()
  @IsEnum(PetAgeCategory)
  ageCategory?: PetAgeCategory;

  @ApiProperty({
    description: 'Tamaño de la mascota',
    enum: PetSize,
    example: PetSize.MEDIUM,
  })
  @IsEnum(PetSize)
  size: PetSize;

  @ApiPropertyOptional({
    description: 'Longitud del pelaje',
    enum: PetFurLength,
    example: PetFurLength.SHORT,
    default: PetFurLength.SHORT,
  })
  @IsOptional()
  @IsEnum(PetFurLength)
  furLength?: PetFurLength;

  @ApiPropertyOptional({
    description: 'Indica si está esterilizado/a',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSterilized?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si cuenta con vacunas al día',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVaccinated?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de salud general',
    enum: PetHealthStatus,
    example: PetHealthStatus.HEALTHY,
    default: PetHealthStatus.HEALTHY,
  })
  @IsOptional()
  @IsEnum(PetHealthStatus)
  healthStatus?: PetHealthStatus;

  @ApiPropertyOptional({
    description: 'Notas médicas o detalles de salud',
    example: 'Tiene tratamiento para alergia cutánea estacional.',
  })
  @IsOptional()
  @IsString()
  healthNotes?: string | null;

  @ApiProperty({
    description: 'Nivel de energía (1 = muy tranquilo a 5 = hiperactivo)',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  energyLevel: number;

  @ApiPropertyOptional({
    description:
      'Tolerancia o convivencia con niños (null si no se ha evaluado)',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  goodWithChildren?: boolean | null;

  @ApiPropertyOptional({
    description:
      'Tolerancia o convivencia con otros perros (null si no se ha evaluado)',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  goodWithDogs?: boolean | null;

  @ApiPropertyOptional({
    description:
      'Tolerancia o convivencia con gatos (null si no se ha evaluado)',
    example: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  goodWithCats?: boolean | null;

  @ApiProperty({
    description: 'Nivel de vocalización / ladridos / maullidos (1 a 5)',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vocalizationLevel: number;

  @ApiPropertyOptional({
    description: 'Nivel de adiestramiento o entrenamiento',
    enum: PetTrainingLevel,
    example: PetTrainingLevel.BASIC,
    default: PetTrainingLevel.NONE,
  })
  @IsOptional()
  @IsEnum(PetTrainingLevel)
  trainingLevel?: PetTrainingLevel;

  @ApiPropertyOptional({
    description:
      'Horas máximas de soledad toleradas (null si no se ha evaluado)',
    example: 6,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  timeAloneToleranceHours?: number | null;

  @ApiPropertyOptional({
    description: 'Meses de permanencia en el albergue',
    example: 3,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  shelterStayMonths?: number;

  @ApiProperty({
    description:
      'Descripción detallada y biografía de la mascota (usada para recomendaciones NLP)',
    example:
      'Firulais es un perrito muy cariñoso, juguetón y leal. Le encanta pasear por las mañanas y descansar cerca de las personas.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la publicación',
    enum: PetStatus,
    example: PetStatus.AVAILABLE,
    default: PetStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(PetStatus)
  status?: PetStatus;

  @ApiProperty({
    description:
      'Lista de fotos subidas previamente (mínimo 3, máximo 6, exactamente una principal)',
    type: [PetPhotoItemDto],
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => PetPhotoItemDto)
  photos: PetPhotoItemDto[];
}
