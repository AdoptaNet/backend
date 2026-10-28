import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RecommendedItemFromMl {
  posicion: number;
  pet_id: string;
  mascota: string;
  score: number;
  p_interes: number;
  compatibilidad: number;
  motivos: string[];
  alertas: string[];
}

export interface MlDossierResponse {
  pet_id: string;
  mascota: string;
  verdict: string;
  compatibility: number;
  interest_probability: number;
  positive_factors: string[];
  alerts: string[];
  negative_factors: string[];
  violated_rules: string[];
}

export interface MlMatchResponse {
  modelo: { nombre: string; version: string };
  adoptante: string | null;
  recomendaciones: RecommendedItemFromMl[];
  n_viables: number;
  tiempo_ms: number;
  advertencia?: string | null;
}

@Injectable()
export class RecommendationMlClient {
  private readonly logger = new Logger(RecommendationMlClient.name);
  private readonly mlServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000';
  }

  async computeMatch(
    adopter: Record<string, any>,
    pets: Record<string, any>[],
    k: number = 20,
    excludePetIds?: string[],
  ): Promise<MlMatchResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout (US-15)

    try {
      const response = await fetch(`${this.mlServiceUrl}/v1/recommendations/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adopter,
          pets,
          k,
          exclude_pet_ids: excludePetIds,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error HTTP ${response.status} desde microservicio ML: ${errorText}`,
        );
      }

      return (await response.json()) as MlMatchResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  async computeDossier(
    adopter: Record<string, any>,
    petId: string,
    petData?: Record<string, any>,
  ): Promise<MlDossierResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${this.mlServiceUrl}/v1/recommendations/dossier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adopter,
          pet_id: petId,
          pet_data: petData,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error HTTP ${response.status} desde microservicio ML (dossier): ${errorText}`,
        );
      }

      return (await response.json()) as MlDossierResponse;
    } finally {
      clearTimeout(timeout);
    }
  }
}
