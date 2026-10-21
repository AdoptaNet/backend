import { BadRequestException, Injectable } from '@nestjs/common';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetResponseDto } from '../dtos/pet-response.dto';
import { SimilarPetResponseDto } from '../dtos/similar-pet-response.dto';
import { VisionMlService } from '../../infrastructure/services/vision-ml.service';

export interface SearchSimilarOptions {
  limit?: number;
  species?: PetSpecies;
  threshold?: number;
}

@Injectable()
export class SearchSimilarPetsUseCase {
  constructor(
    private readonly petRepository: PetRepository,
    private readonly visionMlService: VisionMlService,
  ) {}

  async execute(
    file: Express.Multer.File,
    options?: SearchSimilarOptions,
  ): Promise<SimilarPetResponseDto[]> {
    if (!file) {
      throw new BadRequestException('Debes proporcionar una foto para buscar mascotas similares.');
    }

    // 1. Extraer embedding y atributos de la foto de búsqueda
    let embeddingVector: number[] | null = null;
    let detectedSpecies: string | null = null;
    let detectedSpeciesConfidence = 0;
    let detectedFur: string | null = null;
    let detectedSize: string | null = null;
    let detectedColors: string[] = [];

    try {
      const analysis = await this.visionMlService.analyzePhotos([file]);
      if (analysis?.embedding?.vector && analysis.embedding.vector.length === 384) {
        embeddingVector = analysis.embedding.vector;
        detectedSpecies = analysis.attributes?.species?.value ?? null;
        detectedSpeciesConfidence = analysis.attributes?.species?.confidence ?? 0;
        detectedFur = analysis.attributes?.fur?.value ?? null;
        detectedSize = analysis.attributes?.size?.value ?? null;
        detectedColors = Array.isArray(analysis.attributes?.colors?.value)
          ? analysis.attributes.colors.value
          : [];
      }
    } catch {
      // Fallback a extractSearchEmbedding si analyzePhotos no está disponible o falla
    }

    if (!embeddingVector) {
      const embeddingData = await this.visionMlService.extractSearchEmbedding(file);
      if (!embeddingData.vector || embeddingData.vector.length !== 384) {
        throw new BadRequestException('No se pudo generar un embedding válido para la imagen proporcionada.');
      }
      embeddingVector = embeddingData.vector;
      detectedSpecies = embeddingData.detected_species ?? null;
      detectedSpeciesConfidence = embeddingData.species_confidence ?? 0;
    }

    // 2. Determinar filtro de especie (si no fue forzado, se usa la detectada con alta confianza si existe)
    let speciesFilter = options?.species;
    const detectedLower = detectedSpecies?.toLowerCase();
    if (!speciesFilter && detectedLower && detectedSpeciesConfidence >= 0.75) {
      if (detectedLower === 'dog' || detectedLower === 'perro') {
        speciesFilter = PetSpecies.DOG;
      } else if (detectedLower === 'cat' || detectedLower === 'gato') {
        speciesFilter = PetSpecies.CAT;
      }
    }

    // 3. Consultar mascotas similares en PostgreSQL con pgvector
    const results = await this.petRepository.findSimilarByVector(
      embeddingVector,
      {
        limit: options?.limit || 12,
        species: speciesFilter,
        threshold: options?.threshold || 0.25,
      },
    );

    // 4. Mapear a DTOs de respuesta y generar matchReasons (XAI)
    return results.map((r) => {
      const dto = new SimilarPetResponseDto();
      dto.pet = PetResponseDto.fromEntity(r.pet);
      dto.similarityScore = r.similarity;
      dto.similarityPercentage = Math.round(r.similarity * 100);
      dto.matchReasons = this.generateMatchReasons(
        dto.pet,
        r.similarity,
        detectedSpecies,
        detectedFur,
        detectedSize,
        detectedColors,
      );
      return dto;
    });
  }

  /**
   * Genera chips explicativos de por qué la mascota coincide con la foto (XAI).
   */
  private generateMatchReasons(
    pet: PetResponseDto,
    similarity: number,
    detectedSpecies: string | null,
    detectedFur: string | null,
    detectedSize: string | null,
    detectedColors: string[],
  ): string[] {
    const reasons: string[] = [];

    // 1. Color coincidente
    const colorLabelMap: Record<string, string> = {
      negro: 'Negro',
      marron: 'Marrón',
      crema: 'Dorado / crema',
      gris: 'Gris',
      blanco: 'Blanco',
    };

    if (detectedColors && detectedColors.length > 0 && pet.colors && pet.colors.length > 0) {
      const petColorsLower = pet.colors.map((c) => c.toLowerCase().trim());
      for (const queryColor of detectedColors) {
        const queryColorLower = queryColor.toLowerCase().trim();
        if (petColorsLower.includes(queryColorLower)) {
          const label = colorLabelMap[queryColorLower] || queryColor;
          reasons.push(`🎨 Color similar (${label})`);
          break;
        }
      }
    }

    // 2. Pelaje similar
    if (detectedFur && pet.furLength) {
      const furNormalized = detectedFur.toLowerCase();
      const petFurNormalized = pet.furLength.toLowerCase();
      if (
        (furNormalized.includes('corto') && petFurNormalized.includes('short')) ||
        (furNormalized.includes('largo') && petFurNormalized.includes('long'))
      ) {
        const label = petFurNormalized.includes('short') ? 'Corto' : 'Medio / largo';
        reasons.push(`✂️ Pelaje ${label}`);
      }
    }

    // 3. Tamaño similar
    if (detectedSize && pet.size) {
      const sizeNormalized = detectedSize.toLowerCase();
      const petSizeNormalized = pet.size.toLowerCase();
      if (
        (sizeNormalized.includes('pequeno') && petSizeNormalized.includes('small')) ||
        (sizeNormalized.includes('mediano') && petSizeNormalized.includes('medium')) ||
        (sizeNormalized.includes('grande') && petSizeNormalized.includes('large'))
      ) {
        const label =
          petSizeNormalized === 'small'
            ? 'Pequeño'
            : petSizeNormalized === 'medium'
            ? 'Mediano'
            : 'Grande';
        reasons.push(`📏 Tamaño afín (${label})`);
      }
    }

    // 4. Fisionomía o rasgos faciales según similitud vectorial
    if (similarity >= 0.85) {
      reasons.push('👁️ Fisionomía facial muy parecida');
    } else if (similarity >= 0.70) {
      reasons.push('🐾 Rasgos físicos afines');
    }

    // 5. Misma especie (si tenemos espacio en chips)
    if (reasons.length < 3 && detectedSpecies && pet.species) {
      const isDog =
        detectedSpecies.toLowerCase().includes('dog') ||
        detectedSpecies.toLowerCase().includes('perro');
      const isCat =
        detectedSpecies.toLowerCase().includes('cat') ||
        detectedSpecies.toLowerCase().includes('gato');
      if (isDog && pet.species.toLowerCase() === 'dog') {
        reasons.push('🐶 Misma especie (Perro)');
      } else if (isCat && pet.species.toLowerCase() === 'cat') {
        reasons.push('🐱 Misma especie (Gato)');
      }
    }

    // Fallback asegurado para que siempre haya al menos un motivo explicativo
    if (reasons.length === 0) {
      reasons.push(
        similarity >= 0.8 ? '👁️ Fisionomía facial muy parecida' : '🐾 Rasgos físicos afines',
      );
    }

    return reasons.slice(0, 3);
  }
}
