import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class VerifyShelterDto {
  @ApiProperty({
    description: 'Estado de verificación oficial del albergue',
    example: true,
  })
  @IsBoolean({ message: 'isVerified debe ser un valor booleano' })
  @IsNotEmpty({ message: 'isVerified es requerido' })
  isVerified: boolean;
}
