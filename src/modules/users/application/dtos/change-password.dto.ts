import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'MiPasswordActual123!',
    description:
      'Contraseña actual del usuario (requerida para cuentas con contraseña previa; opcional para cuentas Google)',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({
    example: 'MiNuevaPassword456',
    description: 'Nueva contraseña (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
