import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { RecordInteractionDto } from '../dtos/record-interaction.dto';
import { RECOMMENDATION_INTERACTION_REPOSITORY } from '../../domain/repositories/recommendation-interaction.repository.interface';
import type { IRecommendationInteractionRepository } from '../../domain/repositories/recommendation-interaction.repository.interface';

@Injectable()
export class RecordRecommendationInteractionUseCase {
  constructor(
    @Inject(RECOMMENDATION_INTERACTION_REPOSITORY)
    private readonly interactionRepository: IRecommendationInteractionRepository,
  ) {}

  async execute(user: User, dto: RecordInteractionDto): Promise<{ success: boolean }> {
    await this.interactionRepository.record({
      adopterId: user.id,
      petId: dto.petId,
      interactionType: dto.interactionType,
      position: dto.position,
    });

    return { success: true };
  }
}
