import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../users/application/dtos/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Datos del usuario autenticado',
  })
  user: UserResponseDto;

  @ApiProperty({ description: 'JWT Access Token de corta duración' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token de larga duración' })
  refreshToken: string;

  @ApiProperty({
    description: 'Indica si el usuario fue registrado en este flujo de autenticación',
    required: false,
  })
  isNewUser?: boolean;
}
