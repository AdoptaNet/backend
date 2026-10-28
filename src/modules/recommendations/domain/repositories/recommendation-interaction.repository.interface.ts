import { RecommendationInteraction } from '../entities/recommendation-interaction.entity';
import { RecommendationInteractionType } from '../value-objects/recommendation-interaction-type.enum';

export interface RecordInteractionParams {
  adopterId: string;
  petId: string;
  interactionType: RecommendationInteractionType;
  position: number;
}

export interface IRecommendationInteractionRepository {
  record(params: RecordInteractionParams): Promise<RecommendationInteraction>;
}

export const RECOMMENDATION_INTERACTION_REPOSITORY = 'IRecommendationInteractionRepository';
