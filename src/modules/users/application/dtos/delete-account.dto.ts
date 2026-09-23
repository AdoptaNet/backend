import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    example: 'MiPassword123!',
    description:
      'Contraseña actual del usuario para confirmar la baja definitiva (requerida para cuentas con contraseña)',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 'ELIMINAR',
    description:
      'Palabra clave de confirmación ("ELIMINAR") para cuentas registradas con Google',
    required: false,
  })
  @IsString()
  @IsOptional()
  confirmation?: string;
}
