import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    enum: [UserRole.ADOPTER, UserRole.SHELTER],
    example: UserRole.ADOPTER,
    description: 'Rol del usuario (adopter o shelter)',
    required: false,
    default: UserRole.ADOPTER,
  })
  @IsIn([UserRole.ADOPTER, UserRole.SHELTER], {
    message: 'El rol debe ser "adopter" o "shelter"',
  })
  @IsOptional()
  role?: UserRole;
}
