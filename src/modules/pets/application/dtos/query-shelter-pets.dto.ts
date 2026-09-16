import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';

export class QueryShelterPetsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de la mascota',
    enum: PetStatus,
  })
  @IsOptional()
  @IsEnum(PetStatus)
  status?: PetStatus;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto en el nombre de la mascota',
    example: 'Firu',
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
