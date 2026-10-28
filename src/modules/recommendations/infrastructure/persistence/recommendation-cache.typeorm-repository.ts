import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationCache } from '../../domain/entities/recommendation-cache.entity';
import { IRecommendationCacheRepository } from '../../domain/repositories/recommendation-cache.repository.interface';

@Injectable()
export class RecommendationCacheTypeOrmRepository
  implements IRecommendationCacheRepository
{
  constructor(
    @InjectRepository(RecommendationCache)
    private readonly repo: Repository<RecommendationCache>,
  ) {}

  async findByAdopterId(adopterId: string): Promise<RecommendationCache[]> {
    return this.repo.find({
      where: { adopterId },
      order: { score: 'DESC' },
      relations: {
        pet: {
          photos: true,
          shelter: {
            shelterProfile: true,
          },
        },
      },
    });
  }

  async saveMany(caches: RecommendationCache[]): Promise<void> {
    if (caches.length === 0) return;
    await this.repo.save(caches);
  }

  async deleteByAdopterId(adopterId: string): Promise<void> {
    await this.repo.delete({ adopterId });
  }

  async deleteAll(): Promise<void> {
    await this.repo.clear();
  }
}
