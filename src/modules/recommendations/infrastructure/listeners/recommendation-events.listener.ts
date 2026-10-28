import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RECOMMENDATION_CACHE_REPOSITORY } from '../../domain/repositories/recommendation-cache.repository.interface';
import type { IRecommendationCacheRepository } from '../../domain/repositories/recommendation-cache.repository.interface';
import { AdopterProfileUpdatedEvent } from '../../../users/domain/events/adopter-profile-updated.event';
import { AdopterSurveyCompletedEvent } from '../../../users/domain/events/adopter-survey-completed.event';

@Injectable()
export class RecommendationEventsListener {
  private readonly logger = new Logger(RecommendationEventsListener.name);

  constructor(
    @Inject(RECOMMENDATION_CACHE_REPOSITORY)
    private readonly cacheRepository: IRecommendationCacheRepository,
  ) {}

  @OnEvent('adopter.profile_updated', { async: true })
  async handleAdopterProfileUpdated(event: AdopterProfileUpdatedEvent): Promise<void> {
    this.logger.log(`Purgando caché de recomendaciones para adoptante ${event.userId} (perfil actualizado)`);
    await this.cacheRepository.deleteByAdopterId(event.userId);
  }

  @OnEvent('adopter.survey_completed', { async: true })
  async handleAdopterSurveyCompleted(event: AdopterSurveyCompletedEvent): Promise<void> {
    this.logger.log(`Purgando caché de recomendaciones para adoptante ${event.userId} (encuesta completada)`);
    await this.cacheRepository.deleteByAdopterId(event.userId);
  }

  @OnEvent('pet.created', { async: true })
  async handlePetCreated(): Promise<void> {
    this.logger.log('Nueva mascota registrada en catálogo. Purgando caché global de recomendaciones.');
    await this.cacheRepository.deleteAll();
  }

  @OnEvent('adoption.status_changed', { async: true })
  async handleAdoptionStatusChanged(): Promise<void> {
    this.logger.log('Cambio de estado en adopción. Purgando caché global de recomendaciones.');
    await this.cacheRepository.deleteAll();
  }
}
