import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdoptionStatus } from '../../domain/value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../../domain/value-objects/adoption-rejection-reason.enum';

export class ReviewAdoptionRequestDto {
  @ApiProperty({
    description: 'Nuevo dictamen o estado de la solicitud',
    enum: [
      AdoptionStatus.UNDER_REVIEW,
      AdoptionStatus.APPROVED,
      AdoptionStatus.REJECTED,
    ],
    example: AdoptionStatus.APPROVED,
  })
  @IsEnum(
    [
      AdoptionStatus.UNDER_REVIEW,
      AdoptionStatus.APPROVED,
      AdoptionStatus.REJECTED,
    ],
    {
      message:
        'El estado de revisión debe ser: under_review, approved o rejected.',
    },
  )
  @IsNotEmpty({ message: 'El estado de revisión es requerido.' })
  status: AdoptionStatus;

  @ApiPropertyOptional({
    description:
      'Motivo formal de rechazo tipificado del catálogo (obligatorio si status es rejected)',
    enum: AdoptionRejectionReason,
    example: AdoptionRejectionReason.INCOMPATIBLE_HOUSING,
  })
  @IsOptional()
  @IsEnum(AdoptionRejectionReason, {
    message: 'El motivo de rechazo debe pertenecer al catálogo oficial.',
  })
  rejectionReason?: AdoptionRejectionReason;

  @ApiPropertyOptional({
    description:
      'Notas o comentarios constructivos adicionales para el adoptante',
    example:
      'Agradecemos tu interés, pero la mascota requiere jardín amplio según recomendación veterinaria.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas de rechazo deben ser texto.' })
  rejectionNotes?: string;
}
