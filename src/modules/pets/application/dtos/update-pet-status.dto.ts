import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';

export class UpdatePetStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la mascota',
    enum: PetStatus,
    example: PetStatus.ADOPTED,
  })
  @IsEnum(PetStatus)
  @IsNotEmpty()
  status: PetStatus;
}
