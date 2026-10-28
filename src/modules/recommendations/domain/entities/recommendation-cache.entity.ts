import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../../users/domain/entities/user.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';

export interface ReasonBadge {
  category?: string;
  badge: string;
  importance?: number;
}

@Entity({ name: 'recommendation_caches' })
@Unique('uq_recommendation_adopter_pet', ['adopterId', 'petId'])
@Index('idx_rec_caches_adopter_score', ['adopterId', 'score'])
@Index('idx_rec_caches_pet', ['petId'])
export class RecommendationCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'adopter_id' })
  adopterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adopter_id' })
  adopter: User;

  @Column({ type: 'uuid', name: 'pet_id' })
  petId: string;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  score: number;

  @Column({ type: 'jsonb', name: 'reason_badges', default: () => "'[]'" })
  reasonBadges: ReasonBadge[];

  @Column({ type: 'boolean', name: 'is_fallback', default: false })
  isFallback: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'generated_at' })
  generatedAt: Date;
}
