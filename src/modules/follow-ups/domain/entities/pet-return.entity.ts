import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FollowUpRecord } from './follow-up-record.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { PetReturnReason } from '../value-objects/pet-return-reason.enum';
import { PetReturnStatus } from '../value-objects/pet-return-status.enum';

@Entity('pet_returns')
export class PetReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'follow_up_record_id' })
  followUpRecordId: string;

  @ManyToOne(() => FollowUpRecord, (r) => r.returns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'follow_up_record_id' })
  followUpRecord: FollowUpRecord;

  @Column({ type: 'uuid', name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ type: 'uuid', name: 'adopter_id' })
  adopterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adopter_id' })
  adopter: User;

  @Column({ type: 'uuid', name: 'shelter_id' })
  shelterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shelter_id' })
  shelter: User;

  @Column({
    type: 'enum',
    enum: PetReturnReason,
  })
  reason: PetReturnReason;

  @Column({ type: 'text' })
  explanation: string;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
    name: 'supporting_document_url',
  })
  supportingDocumentUrl: string | null;

  @Column({
    type: 'enum',
    enum: PetReturnStatus,
    default: PetReturnStatus.REQUESTED,
  })
  status: PetReturnStatus;

  @Column({ type: 'timestamp', name: 'requested_at' })
  requestedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'coordination_notes' })
  coordinationNotes: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_return_date' })
  scheduledReturnDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true, name: 'shelter_observations' })
  shelterObservations: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
