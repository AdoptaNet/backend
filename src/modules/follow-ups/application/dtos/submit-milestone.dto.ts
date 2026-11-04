import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class EvidenceItemDto {
  @ApiProperty({
    example: 'pet_photo',
    description: 'Tipo de evidencia (pet_photo, vaccination_card, home_environment)',
  })
  @IsString()
  @IsNotEmpty()
  evidenceType: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/pet.jpg',
    description: 'URL pública de la imagen de evidencia',
  })
  @IsUrl()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiPropertyOptional({
    example: 'Firulais jugando en el patio después de su vacuna',
  })
  @IsString()
  @IsOptional()
  caption?: string;
}

export class SubmitMilestoneDto {
  @ApiProperty({
    example: 'Firulais se ha adaptado estupendamente. Ya responde a su nombre y come su comida con normalidad.',
    description: 'Notas del adoptante sobre el comportamiento y bienestar',
  })
  @IsString()
  @IsNotEmpty()
  adaptationNotes: string;

  @ApiPropertyOptional({
    example: 'healthy',
    description: 'Estado de salud reportado (healthy, minor_issue, treatment)',
  })
  @IsString()
  @IsOptional()
  healthStatusReported?: string;

  @ApiProperty({
    type: [EvidenceItemDto],
    description: 'Lista de evidencias fotográficas o documentales',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidences: EvidenceItemDto[];
}
