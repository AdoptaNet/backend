import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationInteraction } from '../../domain/entities/recommendation-interaction.entity';
import {
  IRecommendationInteractionRepository,
  RecordInteractionParams,
} from '../../domain/repositories/recommendation-interaction.repository.interface';

@Injectable()
export class RecommendationInteractionTypeOrmRepository
  implements IRecommendationInteractionRepository
{
  constructor(
    @InjectRepository(RecommendationInteraction)
    private readonly repo: Repository<RecommendationInteraction>,
  ) {}

  async record(
    params: RecordInteractionParams,
  ): Promise<RecommendationInteraction> {
    const entity = this.repo.create(params);
    return this.repo.save(entity);
  }
}
