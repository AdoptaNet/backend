import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FollowUpMilestone } from './follow-up-milestone.entity';

@Entity('follow_up_evidences')
export class FollowUpEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'milestone_id' })
  milestoneId: string;

  @ManyToOne(() => FollowUpMilestone, (m) => m.evidences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'milestone_id' })
  milestone: FollowUpMilestone;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'evidence_type',
    default: 'pet_photo',
  })
  evidenceType: string;

  @Column({ type: 'varchar', length: 1000, name: 'media_url' })
  mediaUrl: string;

  @Column({ type: 'text', nullable: true })
  caption: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
