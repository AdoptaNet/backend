import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domain/value-objects/user-role.enum';

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
}
