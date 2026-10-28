import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryMessagesDto {
  @ApiPropertyOptional({
    description: 'Cantidad máxima de mensajes a retornar',
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Filtrar mensajes creados antes de esta fecha ISO',
  })
  @IsOptional()
  @IsDateString()
  before?: string;
}
