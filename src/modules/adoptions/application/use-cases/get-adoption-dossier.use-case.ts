import { Injectable, Logger } from '@nestjs/common';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import {
  AdoptionRequestNotFoundException,
  IncompleteAdopterSurveyException,
  UnauthorizedShelterActionForbiddenException,
} from '../../domain/exceptions/adoption.exceptions';
import { PetNotFoundException } from '../../../pets/domain/exceptions/pet-not-found.exception';
import { RecommendationMlClient } from '../../../recommendations/infrastructure/services/recommendation-ml.client';
import { RecommendationDataMapper } from '../../../recommendations/application/mappers/recommendation-data.mapper';
import { AdoptionDossierResponseDto } from '../dtos/adoption-dossier-response.dto';

@Injectable()
export class GetAdoptionDossierUseCase {
  private readonly logger = new Logger(GetAdoptionDossierUseCase.name);

  constructor(
    private readonly adoptionRepo: AdoptionRequestRepository,
    private readonly mlClient: RecommendationMlClient,
  ) {}

  async execute(
    adoptionId: string,
    shelterUserId: string,
  ): Promise<AdoptionDossierResponseDto> {
    const adoption = await this.adoptionRepo.findById(adoptionId);
    if (!adoption) {
      throw new AdoptionRequestNotFoundException(adoptionId);
    }

    if (adoption.shelterId !== shelterUserId) {
      throw new UnauthorizedShelterActionForbiddenException();
    }

    const pet = adoption.pet;
    if (!pet) {
      throw new PetNotFoundException(adoption.petId);
    }

    // Asegurar relación de albergue en pet para el cálculo de compatibilidad geográfica
    if (!pet.shelter && adoption.shelter) {
      pet.shelter = adoption.shelter;
    }

    // Extraer datos del adoptante desde el perfil o desde el snapshot
    const adopterProfile = adoption.adopter?.adopterProfile;
    let adopterData: Record<string, any>;

    if (adopterProfile) {
      adopterData = RecommendationDataMapper.toModelAdopter(adopterProfile);
    } else if (adoption.adopterSnapshot) {
      adopterData = RecommendationDataMapper.toModelAdopterFromSnapshot(
        adoption.adopterSnapshot,
      );
    } else {
      throw new IncompleteAdopterSurveyException();
    }

    // Mapear datos de la mascota
    const petData = RecommendationDataMapper.toModelPet(pet);

    try {
      const mlResponse = await this.mlClient.computeDossier(
        adopterData,
        pet.id,
        petData,
      );

      const positiveFactors =
        mlResponse.positive_factors || (mlResponse as any).a_favor || [];
      const alerts = mlResponse.alerts || (mlResponse as any).alertas || [];
      const negativeFactors =
        mlResponse.negative_factors || (mlResponse as any).en_contra || [];
      const violatedRules =
        mlResponse.violated_rules || (mlResponse as any).reglas_violadas || [];
      const verdict = (
        mlResponse.verdict ||
        (mlResponse as any).veredicto ||
        'APTO PARA ENTREVISTA'
      )
        .split('—')[0]
        .trim();
      const compatibility =
        mlResponse.compatibility ?? (mlResponse as any).compatibilidad ?? 0.5;
      const interestProbability =
        mlResponse.interest_probability ?? (mlResponse as any).p_interes ?? 0.5;

      return {
        petId: mlResponse.pet_id,
        petName: pet.name || mlResponse.mascota,
        verdict,
        compatibility,
        interestProbability,
        positiveFactors,
        alerts,
        negativeFactors,
        violatedRules,
      };
    } catch (error: any) {
      this.logger.error(
        `Fallo al obtener dossier desde ML para la postulación ${adoptionId}: ${error.message}`,
      );
      // Fallback seguro en caso de contingencia con el microservicio ML
      return {
        petId: pet.id,
        petName: pet.name,
        verdict: 'REVISAR CON CUIDADO',
        compatibility: 0.5,
        interestProbability: 0.5,
        positiveFactors: ['Cuestionario de postulación completado por el postulante'],
        alerts: [
          'Microservicio de IA no disponible temporalmente para el cálculo detallado de variables',
        ],
        negativeFactors: [],
        violatedRules: [],
      };
    }
  }
}
