import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FollowUpRecord } from './follow-up-record.entity';
import { FollowUpEvidence } from './follow-up-evidence.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { MilestoneType } from '../value-objects/milestone-type.enum';
import { MilestoneStatus } from '../value-objects/milestone-status.enum';

@Entity('follow_up_milestones')
export class FollowUpMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'record_id' })
  recordId: string;

  @ManyToOne(() => FollowUpRecord, (r) => r.milestones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'record_id' })
  record: FollowUpRecord;

  @Column({
    type: 'enum',
    enum: MilestoneType,
    name: 'milestone_type',
  })
  milestoneType: MilestoneType;

  @Column({ type: 'int', name: 'days_target' })
  daysTarget: number;

  @Column({ type: 'timestamp', name: 'due_date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING,
  })
  status: MilestoneStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'reminder_sent_at' })
  reminderSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'overdue_notified_at' })
  overdueNotifiedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'submitted_at' })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'reviewer_id' })
  reviewerId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: User | null;

  @Column({ type: 'text', nullable: true, name: 'review_notes' })
  reviewNotes: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'health_status_reported',
  })
  healthStatusReported: string | null;

  @Column({ type: 'text', nullable: true, name: 'adaptation_notes' })
  adaptationNotes: string | null;

  @OneToMany(() => FollowUpEvidence, (e) => e.milestone, { cascade: true })
  evidences: FollowUpEvidence[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
