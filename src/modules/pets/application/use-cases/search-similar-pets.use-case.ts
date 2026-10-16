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

    // 1. Extraer embedding de 384 dimensiones del modelo DINOv2
    const embeddingData = await this.visionMlService.extractSearchEmbedding(file);

    if (!embeddingData.vector || embeddingData.vector.length !== 384) {
      throw new BadRequestException('No se pudo generar un embedding válido para la imagen proporcionada.');
    }

    // 2. Determinar filtro de especie (si no fue forzado, se usa la detectada con alta confianza si existe)
    let speciesFilter = options?.species;
    if (!speciesFilter && embeddingData.detected_species && (embeddingData.species_confidence || 0) >= 0.75) {
      speciesFilter =
        embeddingData.detected_species === 'dog' ? PetSpecies.DOG : PetSpecies.CAT;
    }

    // 3. Consultar mascotas similares en PostgreSQL con pgvector
    const results = await this.petRepository.findSimilarByVector(
      embeddingData.vector,
      {
        limit: options?.limit || 12,
        species: speciesFilter,
        threshold: options?.threshold || 0.25,
      },
    );

    // 4. Mapear a DTOs de respuesta
    return results.map((r) => {
      const dto = new SimilarPetResponseDto();
      dto.pet = PetResponseDto.fromEntity(r.pet);
      dto.similarityScore = r.similarity;
      dto.similarityPercentage = Math.round(r.similarity * 100);
      return dto;
    });
  }
}
