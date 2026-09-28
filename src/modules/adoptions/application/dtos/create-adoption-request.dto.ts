import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateAdoptionRequestDto {
  @ApiProperty({
    description: 'Identificador único de la mascota a la que se postula',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID de la mascota debe ser un UUID v4 válido.' })
  @IsNotEmpty({ message: 'El ID de la mascota es requerido.' })
  petId: string;

  @ApiProperty({
    description:
      'Carta de motivación explicando por qué desea adoptar y su preparación (mínimo 30 caracteres)',
    example:
      'Cuento con espacio adecuado en casa, tiempo para paseos diarios y mucho amor para brindarle a este perrito.',
    minLength: 30,
  })
  @IsString({ message: 'La carta de motivación debe ser un texto.' })
  @MinLength(30, {
    message: 'La carta de motivación debe tener al menos 30 caracteres.',
  })
  motivationLetter: string;

  @ApiProperty({
    description:
      'Declaración jurada de tenencia responsable aceptada por el adoptante',
    example: true,
  })
  @IsBoolean({ message: 'La declaración jurada debe ser un valor booleano.' })
  responsibilityPledge: boolean;
}
