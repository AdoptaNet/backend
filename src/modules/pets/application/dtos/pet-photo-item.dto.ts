import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PetPhotoItemDto {
  @ApiPropertyOptional({
    description: 'ID de la fotografía (si ya existe en base de datos)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'URL de la fotografía alojada en Cloudinary',
    example:
      'https://res.cloudinary.com/dadx6zirr/image/upload/v1234567890/firu-api/pets/pet1.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Public ID de la imagen en Cloudinary',
    example: 'firu-api/pets/pet1',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({
    description: 'Indica si es la foto principal de portada',
    example: true,
  })
  @IsBoolean()
  isPrimary: boolean;

  @ApiPropertyOptional({
    description: 'Orden de visualización en la galería',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
