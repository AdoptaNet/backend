import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
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
    description: 'Filtrar por aporte (all = todos, free = adopción gratuita, with_fee = con aporte)',
    enum: ['all', 'free', 'with_fee'],
  })
  @IsOptional()
  @IsEnum(['all', 'free', 'with_fee'])
  feeType?: 'all' | 'free' | 'with_fee';

  @ApiPropertyOptional({
    description: 'Filtrar si está esterilizado/a',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === '1') return true;
    if (value === 'false' || value === false || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  isSterilized?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre de la mascota',
    example: 'Firulais',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
