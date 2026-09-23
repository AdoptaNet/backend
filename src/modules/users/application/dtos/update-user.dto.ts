import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
