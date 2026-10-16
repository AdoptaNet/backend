import { BadRequestException } from '@nestjs/common';
import { VisionMlService } from '../../infrastructure/services/vision-ml.service';
import { AnalyzePetPhotosUseCase } from './analyze-pet-photos.use-case';

describe('AnalyzePetPhotosUseCase', () => {
  let useCase: AnalyzePetPhotosUseCase;
  let visionMlService: jest.Mocked<VisionMlService>;

  beforeEach(() => {
    visionMlService = {
      analyzePhotos: jest.fn(),
      extractSearchEmbedding: jest.fn(),
    } as unknown as jest.Mocked<VisionMlService>;

    useCase = new AnalyzePetPhotosUseCase(visionMlService);
  });

  it('should throw BadRequestException if files array is empty', async () => {
    await expect(useCase.execute([])).rejects.toThrow(BadRequestException);
  });

  it('should call visionMlService and map attributes correctly', async () => {
    const mockFiles = [
      { buffer: Buffer.from('photo1'), originalname: '1.jpg', mimetype: 'image/jpeg' },
    ] as Express.Multer.File[];

    visionMlService.analyzePhotos.mockResolvedValue({
      attributes: {
        species: {
          value: 'dog',
          label: 'Perro',
          confidence: 0.99,
          autocompleted: true,
          suggestion: { value: 'dog', label: 'Perro' },
          options: [{ value: 'dog', label: 'Perro', probability: 0.99 }],
        },
        fur: {
          value: 'short',
          label: 'Corto',
          confidence: 0.85,
          autocompleted: true,
          suggestion: { value: 'short', label: 'Corto' },
          options: [{ value: 'short', label: 'Corto', probability: 0.85 }],
        },
        size: {
          value: 'medium',
          label: 'Mediano',
          confidence: 0.78,
          autocompleted: true,
          suggestion: { value: 'medium', label: 'Mediano' },
          options: [{ value: 'medium', label: 'Mediano', probability: 0.78 }],
        },
        colors: {
          value: ['crema', 'marron'],
          label: ['Dorado / crema', 'Marrón'],
          confidence: 0.88,
          autocompleted: true,
          suggestion: { value: ['crema', 'marron'], label: ['Dorado / crema', 'Marrón'] },
          options: [
            { value: 'crema', label: 'Dorado / crema', probability: 0.91 },
            { value: 'marron', label: 'Marrón', probability: 0.88 },
          ],
        },
      },
      autocompleted_fields: ['species', 'fur', 'size', 'colors'],
      review_fields: [],
      manual_fields: ['name', 'age'],
      embedding: {
        vector: new Array(384).fill(0.05),
        dimension: 384,
      },
      inference_time_ms: 85.4,
    });

    const result = await useCase.execute(mockFiles);

    expect(visionMlService.analyzePhotos).toHaveBeenCalledWith(mockFiles);
    expect(result.species.value).toBe('dog');
    expect(result.colors.value).toEqual(['crema', 'marron']);
    expect(result.embedding).toHaveLength(384);
    expect(result.inferenceTimeMs).toBe(85.4);
  });
});
