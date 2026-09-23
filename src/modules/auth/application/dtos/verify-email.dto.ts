import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'd9b7f58a3648e4d8e9d50b9b32c69572c8427f7173873499e4b3...',
    description: 'Token criptográfico de verificación recibido por correo electrónico',
  })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token de verificación es requerido' })
  token: string;
}
