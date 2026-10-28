import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PetsModule } from '../pets/pets.module';
import { Pet } from '../pets/domain/entities/pet.entity';
import { RecommendationCache } from './domain/entities/recommendation-cache.entity';
import { RecommendationInteraction } from './domain/entities/recommendation-interaction.entity';
import { RECOMMENDATION_CACHE_REPOSITORY } from './domain/repositories/recommendation-cache.repository.interface';
import { RECOMMENDATION_INTERACTION_REPOSITORY } from './domain/repositories/recommendation-interaction.repository.interface';
import { RecommendationCacheTypeOrmRepository } from './infrastructure/persistence/recommendation-cache.typeorm-repository';
import { RecommendationInteractionTypeOrmRepository } from './infrastructure/persistence/recommendation-interaction.typeorm-repository';
import { RecommendationMlClient } from './infrastructure/services/recommendation-ml.client';
import { GetPersonalizedRecommendationsUseCase } from './application/use-cases/get-personalized-recommendations.use-case';
import { RecordRecommendationInteractionUseCase } from './application/use-cases/record-recommendation-interaction.use-case';
import { RecommendationEventsListener } from './infrastructure/listeners/recommendation-events.listener';
import { RecommendationsController } from './presentation/controllers/recommendations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationCache,
      RecommendationInteraction,
    ]),
    ConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PetsModule),
  ],
  controllers: [RecommendationsController],
  providers: [
    {
      provide: RECOMMENDATION_CACHE_REPOSITORY,
      useClass: RecommendationCacheTypeOrmRepository,
    },
    {
      provide: RECOMMENDATION_INTERACTION_REPOSITORY,
      useClass: RecommendationInteractionTypeOrmRepository,
    },
    RecommendationMlClient,
    GetPersonalizedRecommendationsUseCase,
    RecordRecommendationInteractionUseCase,
    RecommendationEventsListener,
  ],
  exports: [
    GetPersonalizedRecommendationsUseCase,
    RECOMMENDATION_CACHE_REPOSITORY,
    RecommendationMlClient,
  ],
})
export class RecommendationsModule {}
