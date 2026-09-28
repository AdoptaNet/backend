import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';

export class QueryAdoptionRequestsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de la solicitud',
    enum: AdoptionStatus,
  })
  @IsOptional()
  @IsEnum(AdoptionStatus)
  status?: AdoptionStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de mascota (exclusivo para albergues)',
  })
  @IsOptional()
  @IsUUID('4')
  petId?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    default: 10,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
