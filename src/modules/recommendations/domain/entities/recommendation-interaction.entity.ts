import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/domain/entities/user.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { RecommendationInteractionType } from '../value-objects/recommendation-interaction-type.enum';

@Entity({ name: 'recommendation_interactions' })
@Index('idx_rec_interactions_adopter', ['adopterId'])
@Index('idx_rec_interactions_pet', ['petId'])
@Index('idx_rec_interactions_type', ['interactionType'])
@Index('idx_rec_interactions_created_at', ['createdAt'])
export class RecommendationInteraction {
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

  @Column({
    type: 'enum',
    enum: RecommendationInteractionType,
    name: 'interaction_type',
  })
  interactionType: RecommendationInteractionType;

  @Column({ type: 'int' })
  position: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
