import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class UpdateShelterProfileDto {
  @ApiProperty({ example: 'Albergue Patitas Felices', required: false })
  @IsString()
  @IsOptional()
  organizationName?: string;

  @ApiProperty({ example: 'Av. Las Palmeras 123', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Miraflores', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Lima', required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ example: '+51999888777', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'contacto@patitasfelices.pe', required: false })
  @IsEmail({}, { message: 'El correo de contacto no es válido' })
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    example:
      'Albergue sin fines de lucro dedicado al rescate de perritos callejeros',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 30, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  rescueCapacity?: number;

  @ApiProperty({
    example: 'https://facebook.com/patitasfelices',
    required: false,
  })
  @IsUrl({}, { message: 'La URL de Facebook no es válida' })
  @IsOptional()
  facebookUrl?: string;

  @ApiProperty({
    example: 'https://instagram.com/patitasfelices',
    required: false,
  })
  @IsUrl({}, { message: 'La URL de Instagram no es válida' })
  @IsOptional()
  instagramUrl?: string;

  @ApiProperty({ example: -12.046374, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -77.042793, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
