import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'Usuario registrado exitosamente. Por favor verifica tu correo para activar tu cuenta.',
    description: 'Mensaje descriptivo del resultado del registro',
  })
  message: string;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico registrado al cual se envió el enlace de confirmación',
  })
  email: string;

  @ApiProperty({
    example: 'adopter',
    description: 'Rol seleccionado para la cuenta',
  })
  role: string;
}
