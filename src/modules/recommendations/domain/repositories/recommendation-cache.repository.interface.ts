import { RecommendationCache } from '../entities/recommendation-cache.entity';

export interface IRecommendationCacheRepository {
  findByAdopterId(adopterId: string): Promise<RecommendationCache[]>;
  saveMany(caches: RecommendationCache[]): Promise<void>;
  deleteByAdopterId(adopterId: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export const RECOMMENDATION_CACHE_REPOSITORY = 'IRecommendationCacheRepository';
