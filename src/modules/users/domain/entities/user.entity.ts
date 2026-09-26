import { Column, Entity, OneToOne } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { UserRole } from '../value-objects/user-role.enum';
import { AdopterProfile } from './adopter-profile.entity';
import { ShelterProfile } from './shelter-profile.entity';

@Entity()
export class User extends AuditableEntity {
  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarKey: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADOPTER })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  roleSelected: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => AdopterProfile, (profile) => profile.user)
  adopterProfile?: AdopterProfile | null;

  @OneToOne(() => ShelterProfile, (profile) => profile.user)
  shelterProfile?: ShelterProfile | null;
}
