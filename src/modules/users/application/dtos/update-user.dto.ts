import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    description: 'URL del avatar o foto de perfil',
    required: false,
  })
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  @IsOptional()
  avatarUrl?: string;
}
