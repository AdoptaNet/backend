import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CoordinatePetReturnDto {
  @ApiProperty({
    example: '2026-11-15T15:00:00.000Z',
    description: 'Fecha y hora coordinada para la entrega física del animal',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledReturnDate: string;

  @ApiPropertyOptional({
    example: 'Acercarse al local de Surco con jaula de transporte y cartilla original.',
    description: 'Indicaciones logísticas para el adoptante',
  })
  @IsString()
  @IsOptional()
  coordinationNotes?: string;
}
