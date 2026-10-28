import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PetSpecies } from '../../../pets/domain/value-objects/pet-species.enum';
import { PetSize } from '../../../pets/domain/value-objects/pet-size.enum';

export class QueryRecommendationsDto {
  @ApiPropertyOptional({
    description: 'Filtrar recomendaciones por especie de mascota',
    enum: PetSpecies,
  })
  @IsOptional()
  @IsEnum(PetSpecies)
  species?: PetSpecies;

  @ApiPropertyOptional({
    description: 'Filtrar recomendaciones por tamaño de mascota',
    enum: PetSize,
  })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de recomendaciones a retornar',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
