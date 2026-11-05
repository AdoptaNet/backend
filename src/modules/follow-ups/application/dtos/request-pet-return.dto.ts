import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { PetReturnReason } from '../../domain/value-objects/pet-return-reason.enum';

export const ALLOWED_PET_RETURN_REASONS = [
  'severe_allergy',
  'behavioral_issue',
  'behavioral_challenges',
  'landlord_issue',
  'housing_restriction',
  'unforeseen_emergency',
  'financial_hardship',
  'personal_emergency',
  'other',
];

export class RequestPetReturnDto {
  @ApiProperty({
    example: PetReturnReason.SEVERE_ALLERGY,
    enum: ALLOWED_PET_RETURN_REASONS,
    description: 'Causa tipificada de fuerza mayor para solicitar el retorno',
  })
  @IsIn(ALLOWED_PET_RETURN_REASONS)
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: 'Diagnóstico médico de alergia severa asmatiforme en menor de edad que imposibilita la convivencia.',
    description: 'Explicación circunstanciada de los hechos',
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiPropertyOptional({
    example: '+51 987654321',
    description: 'Teléfono de contacto de emergencia para coordinar con el albergue',
  })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/certificado-alergia.pdf',
    description: 'Enlace a certificado médico u orden de desalojo inmobiliario probatoria',
  })
  @IsUrl()
  @IsOptional()
  supportingDocumentUrl?: string;
}
