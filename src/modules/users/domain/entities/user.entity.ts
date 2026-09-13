import { Column, Entity } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { UserRole } from '../value-objects/user-role.enum';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADOPTER })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;
}
