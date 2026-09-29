import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AuditableEntity } from '../../../../shared/domain/entities/auditable.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { AdoptionStatus } from '../value-objects/adoption-status.enum';
import { AdoptionRejectionReason } from '../value-objects/adoption-rejection-reason.enum';
import type { AdopterSnapshot } from '../value-objects/adopter-snapshot.interface';

@Entity()
export class AdoptionRequest extends AuditableEntity {
  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ type: 'uuid', name: 'pet_id' })
  petId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adopter_id' })
  adopter: User;

  @Column({ type: 'uuid', name: 'adopter_id' })
  adopterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shelter_id' })
  shelter: User;

  @Column({ type: 'uuid', name: 'shelter_id' })
  shelterId: string;

  @Column({
    type: 'enum',
    enum: AdoptionStatus,
    enumName: 'adoption_status_enum',
    default: AdoptionStatus.PENDING,
  })
  status: AdoptionStatus;

  @Column({ type: 'text', name: 'motivation_letter' })
  motivationLetter: string;

  @Column({ type: 'boolean', name: 'responsibility_pledge', default: true })
  responsibilityPledge: boolean;

  @Column({ type: 'jsonb', name: 'adopter_snapshot' })
  adopterSnapshot: AdopterSnapshot;

  @Column({
    type: 'enum',
    enum: AdoptionRejectionReason,
    enumName: 'adoption_rejection_reason_enum',
    nullable: true,
    name: 'rejection_reason',
  })
  rejectionReason: AdoptionRejectionReason | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_notes' })
  rejectionNotes: string | null;

  @Column({ type: 'text', nullable: true, name: 'review_notes' })
  reviewNotes: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'rejected_at' })
  rejectedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date | null;
}
