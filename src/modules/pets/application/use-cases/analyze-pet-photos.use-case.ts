import { BadRequestException, Injectable } from '@nestjs/common';
import { VisionMlService } from '../../infrastructure/services/vision-ml.service';
import { AnalyzePetPhotosResponseDto } from '../dtos/analyze-pet-photos-response.dto';

@Injectable()
export class AnalyzePetPhotosUseCase {
  constructor(private readonly visionMlService: VisionMlService) {}

  async execute(
    files: Express.Multer.File[],
  ): Promise<AnalyzePetPhotosResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes proporcionar al menos una foto para analizar.');
    }

    const prediction = await this.visionMlService.analyzePhotos(files);

    const mapSpeciesValue = (val: string | null | undefined): string | null => {
      if (!val) return null;
      const lower = val.toLowerCase();
      if (lower === 'perro' || lower === 'dog') return 'dog';
      if (lower === 'gato' || lower === 'cat') return 'cat';
      return val;
    };

    const mapFurValue = (val: string | null | undefined): string | null => {
      if (!val) return null;
      const lower = val.toLowerCase();
      if (lower === 'corto' || lower === 'short') return 'short';
      if (lower === 'largo' || lower === 'long') return 'long';
      return val;
    };

    const mapSizeValue = (val: string | null | undefined): string | null => {
      if (!val) return null;
      const lower = val.toLowerCase();
      if (lower === 'pequeno' || lower === 'pequeño' || lower === 'small') return 'small';
      if (lower === 'mediano' || lower === 'medium') return 'medium';
      if (lower === 'grande' || lower === 'large') return 'large';
      return val;
    };

    const dto = new AnalyzePetPhotosResponseDto();
    dto.species = {
      value: mapSpeciesValue(prediction.attributes.species.value),
      label: prediction.attributes.species.label,
      confidence: prediction.attributes.species.confidence,
      autocompleted: prediction.attributes.species.autocompleted,
      options: prediction.attributes.species.options.map((opt) => ({
        ...opt,
        value: mapSpeciesValue(opt.value) || opt.value,
      })),
    };

    dto.fur = {
      value: mapFurValue(prediction.attributes.fur.value),
      label: prediction.attributes.fur.label,
      confidence: prediction.attributes.fur.confidence,
      autocompleted: prediction.attributes.fur.autocompleted,
      options: prediction.attributes.fur.options.map((opt) => ({
        ...opt,
        value: mapFurValue(opt.value) || opt.value,
      })),
    };

    dto.size = {
      value: mapSizeValue(prediction.attributes.size.value),
      label: prediction.attributes.size.label,
      confidence: prediction.attributes.size.confidence,
      autocompleted: prediction.attributes.size.autocompleted,
      options: prediction.attributes.size.options.map((opt) => ({
        ...opt,
        value: mapSizeValue(opt.value) || opt.value,
      })),
    };

    dto.colors = {
      value: prediction.attributes.colors.value,
      label: prediction.attributes.colors.label,
      confidence: prediction.attributes.colors.confidence,
      autocompleted: prediction.attributes.colors.autocompleted,
      options: prediction.attributes.colors.options,
    };

    dto.autocompletedFields = prediction.autocompleted_fields;
    dto.reviewFields = prediction.review_fields;
    dto.embedding = prediction.embedding?.vector;
    dto.inferenceTimeMs = prediction.inference_time_ms;

    return dto;
  }
}
