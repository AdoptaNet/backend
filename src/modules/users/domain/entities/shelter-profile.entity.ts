import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { User } from './user.entity';

@Entity()
export class ShelterProfile extends AuditableEntity {
  @OneToOne(() => User, (user) => user.shelterProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  organizationName: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true })
  rescueCapacity: number | null;

  @Column({ type: 'varchar', nullable: true })
  facebookUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  instagramUrl: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  longitude: number | null;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;
}
