import { BadRequestException } from '@nestjs/common';
import { Pet } from '../../domain/entities/pet.entity';
import { PetRepository } from '../../domain/repositories/pet.repository';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';
import { PetStatus } from '../../domain/value-objects/pet-status.enum';
import { VisionMlService } from '../../infrastructure/services/vision-ml.service';
import { SearchSimilarPetsUseCase } from './search-similar-pets.use-case';

describe('SearchSimilarPetsUseCase', () => {
  let useCase: SearchSimilarPetsUseCase;
  let petRepository: jest.Mocked<PetRepository>;
  let visionMlService: jest.Mocked<VisionMlService>;

  beforeEach(() => {
    petRepository = {
      findSimilarByVector: jest.fn(),
    } as unknown as jest.Mocked<PetRepository>;

    visionMlService = {
      analyzePhotos: jest.fn(),
      extractSearchEmbedding: jest.fn(),
    } as unknown as jest.Mocked<VisionMlService>;

    useCase = new SearchSimilarPetsUseCase(petRepository, visionMlService);
  });

  it('should throw BadRequestException if file is missing', async () => {
    await expect(useCase.execute(null as any)).rejects.toThrow(BadRequestException);
  });

  it('should extract embedding and return similar pets with scores', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockVector = new Array(384).fill(0.01);

    visionMlService.extractSearchEmbedding.mockResolvedValue({
      valid: true,
      detected_species: 'dog',
      species_confidence: 0.95,
      vector: mockVector,
      dimension: 384,
      inference_time_ms: 45.0,
    });

    const mockPet = {
      id: 'pet-1',
      name: 'Max',
      species: PetSpecies.DOG,
      status: PetStatus.AVAILABLE,
      photos: [],
      characteristics: {},
    } as unknown as Pet;

    petRepository.findSimilarByVector.mockResolvedValue([
      { pet: mockPet, similarity: 0.895 },
    ]);

    const results = await useCase.execute(mockFile, { limit: 5 });

    expect(visionMlService.extractSearchEmbedding).toHaveBeenCalledWith(mockFile);
    expect(petRepository.findSimilarByVector).toHaveBeenCalledWith(mockVector, {
      limit: 5,
      species: PetSpecies.DOG,
      threshold: 0.25,
    });

    expect(results).toHaveLength(1);
    expect(results[0].pet.name).toBe('Max');
    expect(results[0].similarityScore).toBe(0.895);
    expect(results[0].similarityPercentage).toBe(90);
    expect(results[0].matchReasons).toBeDefined();
    expect(results[0].matchReasons.length).toBeGreaterThan(0);
  });

  it('should generate XAI matchReasons matching color, fur and size when analyzePhotos provides attributes', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockVector = new Array(384).fill(0.02);

    visionMlService.analyzePhotos.mockResolvedValue({
      attributes: {
        species: { value: 'dog', label: 'Perro', confidence: 0.95 } as any,
        fur: { value: 'corto', label: 'Corto', confidence: 0.90 } as any,
        size: { value: 'mediano', label: 'Mediano', confidence: 0.85 } as any,
        colors: { value: ['blanco', 'marron'], label: ['Blanco', 'Marrón'], confidence: 0.88 } as any,
      },
      embedding: { vector: mockVector, dimension: 384 },
      autocompleted_fields: ['species', 'fur', 'colors'],
      review_fields: [],
      manual_fields: [],
      inference_time_ms: 38.0,
    });

    const mockPet = {
      id: 'pet-2',
      name: 'Luna',
      species: PetSpecies.DOG,
      status: PetStatus.AVAILABLE,
      photos: [],
      characteristics: {
        colors: ['blanco'],
        medical: { fur_length: 'short' },
      },
      size: 'medium',
    } as unknown as Pet;

    petRepository.findSimilarByVector.mockResolvedValue([
      { pet: mockPet, similarity: 0.91 },
    ]);

    const results = await useCase.execute(mockFile, { limit: 4 });

    expect(results).toHaveLength(1);
    expect(results[0].similarityPercentage).toBe(91);
    expect(results[0].matchReasons).toContain('🎨 Color similar (Blanco)');
    expect(results[0].matchReasons).toContain('✂️ Pelaje Corto');
    expect(results[0].matchReasons).toContain('📏 Tamaño afín (Mediano)');
  });
});
