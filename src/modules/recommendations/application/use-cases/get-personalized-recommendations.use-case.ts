import { Inject, Injectable, Logger } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { Pet } from '../../../pets/domain/entities/pet.entity';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { PetResponseDto } from '../../../pets/application/dtos/pet-response.dto';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RECOMMENDATION_CACHE_REPOSITORY } from '../../domain/repositories/recommendation-cache.repository.interface';
import type { IRecommendationCacheRepository } from '../../domain/repositories/recommendation-cache.repository.interface';
import { RecommendationCache } from '../../domain/entities/recommendation-cache.entity';
import { QueryRecommendationsDto } from '../dtos/query-recommendations.dto';
import {
  PersonalizedRecommendationsResponseDto,
  RecommendedPetResponseDto,
} from '../dtos/recommendation-response.dto';
import { RecommendationDataMapper } from '../mappers/recommendation-data.mapper';
import { RecommendationMlClient } from '../../infrastructure/services/recommendation-ml.client';

@Injectable()
export class GetPersonalizedRecommendationsUseCase {
  private readonly logger = new Logger(GetPersonalizedRecommendationsUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(RECOMMENDATION_CACHE_REPOSITORY)
    private readonly cacheRepository: IRecommendationCacheRepository,
    private readonly petRepository: PetRepository,
    private readonly mlClient: RecommendationMlClient,
  ) {}

  async execute(
    user: User,
    query: QueryRecommendationsDto,
  ): Promise<PersonalizedRecommendationsResponseDto> {
    const startTime = Date.now();

    // 1. Obtener perfil completo del adoptante
    const userWithProfile = await this.userRepository.findByIdWithProfile(user.id);
    const adopterProfile = userWithProfile?.adopterProfile;

    if (!adopterProfile || !adopterProfile.isSurveyCompleted) {
      return {
        isSurveyCompleted: false,
        recommendations: [],
        executionTimeMs: Date.now() - startTime,
      };
    }

    // 2. Verificar existencia de caché vigente (US-15 Escenario 1)
    let cached = await this.cacheRepository.findByAdopterId(user.id);

    // 3. Si no existe caché o está vacía, orquestar inferencia en ML Service (US-14 Escenario 1)
    if (!cached || cached.length === 0) {
      cached = await this.computeAndCacheRecommendations(user.id, adopterProfile);
    }

    // 4. Filtrado secundario dinámico (US-14 Escenario 3: Especie, Tamaño, Disponibilidad)
    let filtered = cached.filter((c) => {
      if (!c.pet) return false;
      // Solo mascotas en estado available o in_process
      if (
        c.pet.status !== PetStatus.AVAILABLE &&
        c.pet.status !== PetStatus.IN_PROCESS
      ) {
        return false;
      }
      if (query.species && c.pet.species !== query.species) {
        return false;
      }
      if (query.size && c.pet.size !== query.size) {
        return false;
      }
      return true;
    });

    // Limitar al límite solicitado
    const limit = query.limit || 10;
    filtered = filtered.slice(0, limit);

    // Mapear a DTO de respuesta
    const recommendations: RecommendedPetResponseDto[] = filtered.map(
      (item, index) => ({
        position: index + 1,
        score: Number(item.score),
        reasonBadges: item.reasonBadges || [],
        isFallback: Boolean(item.isFallback),
        pet: PetResponseDto.fromEntity(item.pet),
      }),
    );

    return {
      isSurveyCompleted: true,
      recommendations,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async computeAndCacheRecommendations(
    userId: string,
    adopterProfile: any,
  ): Promise<RecommendationCache[]> {
    // Extraer mascotas disponibles
    const availablePets = await this.petRepository.findAvailableForRecommendations();

    if (availablePets.length === 0) {
      return [];
    }

    const modelAdopter = RecommendationDataMapper.toModelAdopter(adopterProfile);
    const modelPets = availablePets.map((p) => RecommendationDataMapper.toModelPet(p));

    const cachesToSave: RecommendationCache[] = [];

    try {
      this.logger.log(
        `Invocando microservicio ML para recomendaciones de adoptante ${userId} (${availablePets.length} mascotas en catálogo)`,
      );
      const mlResponse = await this.mlClient.computeMatch(
        modelAdopter,
        modelPets,
        Math.min(availablePets.length, 50),
      );

      for (const item of mlResponse.recomendaciones) {
        const matchingPet = availablePets.find((p) => p.id === item.pet_id);
        if (!matchingPet) continue;

        const cacheItem = new RecommendationCache();
        cacheItem.adopterId = userId;
        cacheItem.petId = item.pet_id;
        cacheItem.score = item.score;
        cacheItem.reasonBadges = (item.motivos || []).map((m) => ({
          badge: m,
        }));
        cacheItem.isFallback = false;
        cacheItem.pet = matchingPet;
        cachesToSave.push(cacheItem);
      }
    } catch (err: any) {
      // US-15 Escenario 3: Activación automática de degradación elegante (Fallback Heurístico)
      this.logger.warn(
        `Fallo o timeout en ML Service. Activando fallback heurístico para adoptante ${userId}: ${err.message}`,
      );

      const prefSpecies =
        adopterProfile.preferredSpecies === 'dogs'
          ? 'dog'
          : adopterProfile.preferredSpecies === 'cats'
            ? 'cat'
            : null;

      // Ordenar heurísticamente: misma especie -> mayor coincidencia
      const sorted = [...availablePets].sort((a, b) => {
        let scoreA = 0.5;
        let scoreB = 0.5;
        if (prefSpecies && a.species === prefSpecies) scoreA += 0.3;
        if (prefSpecies && b.species === prefSpecies) scoreB += 0.3;
        return scoreB - scoreA;
      });

      for (const [index, pet] of sorted.slice(0, 30).entries()) {
        const cacheItem = new RecommendationCache();
        cacheItem.adopterId = userId;
        cacheItem.petId = pet.id;
        cacheItem.score = Number((0.99 - index * 0.02).toFixed(4));
        cacheItem.reasonBadges = [
          { badge: 'Compatible según preferencias de hogar' },
          { badge: 'Mascota lista para adopción' },
        ];
        cacheItem.isFallback = true;
        cacheItem.pet = pet;
        cachesToSave.push(cacheItem);
      }
    }

    if (cachesToSave.length > 0) {
      // Eliminar registros previos si hubiera
      await this.cacheRepository.deleteByAdopterId(userId);
      await this.cacheRepository.saveMany(cachesToSave);
    }

    return cachesToSave;
  }
}
