import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'MiPasswordActual123!',
    description: 'Contraseña actual del usuario',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @ApiProperty({
    example: 'MiNuevaPassword456!',
    description: 'Nueva contraseña (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
