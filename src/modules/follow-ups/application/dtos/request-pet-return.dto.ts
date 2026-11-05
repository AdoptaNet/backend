import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { PetReturnReason } from '../../domain/value-objects/pet-return-reason.enum';

export class RequestPetReturnDto {
  @ApiProperty({
    example: PetReturnReason.SEVERE_ALLERGY,
    enum: PetReturnReason,
    description: 'Causa tipificada de fuerza mayor para solicitar el retorno',
  })
  @IsEnum(PetReturnReason)
  @IsNotEmpty()
  reason: PetReturnReason;

  @ApiProperty({
    example: 'Diagnóstico médico de alergia severa asmatiforme en menor de edad que imposibilita la convivencia.',
    description: 'Explicación circunstanciada de los hechos',
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiProperty({
    example: '987654321',
    description: 'Teléfono de contacto de emergencia para coordinar con el albergue',
  })
  @IsString()
  @IsNotEmpty()
  emergencyContactPhone: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/certificado-alergia.pdf',
    description: 'Enlace a certificado médico u orden de desalojo inmobiliario probatoria',
  })
  @IsUrl()
  @IsOptional()
  supportingDocumentUrl?: string;
}
