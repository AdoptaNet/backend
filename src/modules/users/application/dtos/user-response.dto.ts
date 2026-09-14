import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { AdopterProfileResponseDto } from './adopter-profile-response.dto';
import { ShelterProfileResponseDto } from './shelter-profile-response.dto';

export class UserResponseDto {
  @ApiProperty({ description: 'Internal user ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'Full name of the user', nullable: true })
  fullName: string | null;

  @ApiProperty({ description: 'Avatar URL', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  role: UserRole;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({
    type: () => AdopterProfileResponseDto,
    nullable: true,
    required: false,
    description: 'Perfil de adoptante si existe',
  })
  adopterProfile?: AdopterProfileResponseDto | null;

  @ApiProperty({
    type: () => ShelterProfileResponseDto,
    nullable: true,
    required: false,
    description: 'Perfil de albergue si existe',
  })
  shelterProfile?: ShelterProfileResponseDto | null;
}
