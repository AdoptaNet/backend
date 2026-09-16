import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PetAgeCategory } from '../../domain/value-objects/pet-age-category.enum';
import { PetGender } from '../../domain/value-objects/pet-gender.enum';
import { PetSize } from '../../domain/value-objects/pet-size.enum';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';

export class QueryPublicPetsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por especie',
    enum: PetSpecies,
  })
  @IsOptional()
  @IsEnum(PetSpecies)
  species?: PetSpecies;

  @ApiPropertyOptional({
    description: 'Filtrar por tamaño',
    enum: PetSize,
  })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({
    description: 'Filtrar por rango de edad',
    enum: PetAgeCategory,
  })
  @IsOptional()
  @IsEnum(PetAgeCategory)
  ageCategory?: PetAgeCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por sexo / género',
    enum: PetGender,
  })
  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad del albergue',
    example: 'Lima',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por departamento del albergue',
    example: 'Lima',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
