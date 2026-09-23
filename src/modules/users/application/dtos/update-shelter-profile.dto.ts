import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';

const emptyToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const emptyOrNaNToNull = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export class UpdateShelterProfileDto {
  @ApiPropertyOptional({ example: 'Albergue Patitas Felices' })
  @Transform(emptyToNull)
  @IsString()
  @IsOptional()
  organizationName?: string | null;

  @ApiPropertyOptional({ example: 'Av. Las Palmeras 123' })
  @Transform(emptyToNull)
  @IsString()
  @IsOptional()
  address?: string | null;

  @ApiPropertyOptional({ example: 'Miraflores' })
  @Transform(emptyToNull)
  @IsString()
  @IsOptional()
  city?: string | null;

  @ApiPropertyOptional({ example: 'Lima' })
  @Transform(emptyToNull)
  @IsString()
  @IsOptional()
  department?: string | null;

  @ApiPropertyOptional({ example: '+51999888777' })
  @Transform(emptyToNull)
  @IsString()
  @IsOptional()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ example: 'contacto@patitasfelices.pe' })
  @Transform(emptyToNull)
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsEmail({}, { message: 'El correo de contacto no es válido' })
  @IsOptional()
  contactEmail?: string | null;

  @ApiPropertyOptional({
    example:
      'Albergue sin fines de lucro dedicado al rescate de perritos callejeros',
  })
  @Transform(emptyToNull)
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: 30 })
  @Transform(emptyOrNaNToNull)
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsInt()
  @Min(0)
  @IsOptional()
  rescueCapacity?: number | null;

  @ApiPropertyOptional({
    example: 'https://facebook.com/patitasfelices',
  })
  @Transform(emptyToNull)
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsUrl({}, { message: 'La URL de Facebook no es válida' })
  @IsOptional()
  facebookUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://instagram.com/patitasfelices',
  })
  @Transform(emptyToNull)
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsUrl({}, { message: 'La URL de Instagram no es válida' })
  @IsOptional()
  instagramUrl?: string | null;

  @ApiPropertyOptional({ example: -12.046374 })
  @Transform(emptyOrNaNToNull)
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsNumber()
  @IsOptional()
  latitude?: number | null;

  @ApiPropertyOptional({ example: -77.042793 })
  @Transform(emptyOrNaNToNull)
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsNumber()
  @IsOptional()
  longitude?: number | null;
}
