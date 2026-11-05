import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdoptionRequest } from '../../../adoptions/domain/entities/adoption-request.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { FollowUpMilestone } from './follow-up-milestone.entity';
import { PetReturn } from './pet-return.entity';
import { FollowUpProcessStatus } from '../value-objects/follow-up-process-status.enum';

@Entity('follow_up_records')
export class FollowUpRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'adoption_id', unique: true })
  adoptionId: string;

  @OneToOne(() => AdoptionRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adoption_id' })
  adoption: AdoptionRequest;

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
    enum: FollowUpProcessStatus,
    default: FollowUpProcessStatus.IN_PROGRESS,
  })
  status: FollowUpProcessStatus;

  @Column({ type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completion_date' })
  completionDate: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
    name: 'certificate_code',
  })
  certificateCode: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => FollowUpMilestone, (m) => m.record, { cascade: true })
  milestones: FollowUpMilestone[];

  @OneToMany(() => PetReturn, (r) => r.followUpRecord)
  returns: PetReturn[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
