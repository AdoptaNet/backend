import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Contenido del mensaje de texto (máximo 1000 caracteres)',
    example: 'Hola, me gustaría coordinar una videollamada para la entrevista.',
  })
  @ValidateIf((o) => !o.attachmentUrl || o.content !== undefined)
  @IsString({ message: 'El contenido del mensaje debe ser una cadena de texto válida.' })
  @MaxLength(1000, {
    message: 'El mensaje no puede exceder los 1000 caracteres.',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'URL de fotografía o evidencia adjunta alojada en Cloudinary',
    example: 'https://res.cloudinary.com/firu/image/upload/v1/patio.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del adjunto debe ser una URL válida.' })
  @MaxLength(500, {
    message: 'La URL del adjunto no puede superar los 500 caracteres.',
  })
  attachmentUrl?: string;

  @ApiPropertyOptional({
    description: 'Tipo MIME del adjunto (ej. image/jpeg, image/png, image/webp)',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  attachmentType?: string;
}
