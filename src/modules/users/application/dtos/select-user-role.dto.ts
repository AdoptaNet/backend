import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../domain/value-objects/user-role.enum';

export class SelectUserRoleDto {
  @ApiProperty({
    description: 'Rol elegido para el usuario',
    enum: [UserRole.ADOPTER, UserRole.SHELTER],
    example: UserRole.SHELTER,
  })
  @IsIn([UserRole.ADOPTER, UserRole.SHELTER], {
    message: 'El rol seleccionado debe ser "adopter" o "shelter"',
  })
  @IsNotEmpty()
  role: UserRole.ADOPTER | UserRole.SHELTER;
}
