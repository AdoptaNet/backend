import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de refresco' })
  @IsString()
  @IsNotEmpty({ message: 'El refreshToken es requerido' })
  refreshToken: string;
}
