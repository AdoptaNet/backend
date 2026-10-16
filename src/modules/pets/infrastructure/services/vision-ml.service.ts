import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AttributeSuggestion {
  value: string | string[];
  label: string | string[];
}

export interface AttributeOption {
  value: string;
  label: string;
  probability: number;
}

export interface SingleAttributeResult {
  value: string | null;
  label: string | null;
  confidence: number;
  autocompleted: boolean;
  suggestion: AttributeSuggestion;
  options: AttributeOption[];
}

export interface MultipleAttributeResult {
  value: string[] | null;
  label: string[] | null;
  confidence: number;
  autocompleted: boolean;
  suggestion: AttributeSuggestion;
  options: AttributeOption[];
}

export interface VisionPredictionDto {
  attributes: {
    species: SingleAttributeResult;
    fur: SingleAttributeResult;
    size: SingleAttributeResult;
    colors: MultipleAttributeResult;
  };
  autocompleted_fields: string[];
  review_fields: string[];
  manual_fields: string[];
  embedding?: {
    vector: number[];
    dimension: number;
  };
  inference_time_ms: number;
}

export interface EmbeddingQueryDto {
  valid: boolean;
  message?: string;
  detected_species?: string;
  species_confidence?: number;
  vector?: number[];
  dimension: number;
  inference_time_ms: number;
}

@Injectable()
export class VisionMlService {
  private readonly logger = new Logger(VisionMlService.name);
  private readonly mlServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000';
  }

  /**
   * Envía 1 a 6 fotos al microservicio para inferir atributos físicos
   * (especie, pelaje, tamaño, colores) y obtener el embedding visual promedio.
   */
  async analyzePhotos(
    files: Express.Multer.File[],
  ): Promise<VisionPredictionDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Se requiere al menos una imagen para analizar.');
    }

    const form = new FormData();
    for (const file of files.slice(0, 6)) {
      const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || 'image/jpeg' });
      form.append('files', blob, file.originalname || 'photo.jpg');
    }

    try {
      const res = await fetch(`${this.mlServiceUrl}/v1/vision/autocomplete`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.error(`Error de inferencia en ML Service: ${res.status} - ${errorText}`);
        throw new BadRequestException(
          `Error en el servicio de visión artificial: ${errorText || res.statusText}`,
        );
      }

      return (await res.json()) as VisionPredictionDto;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Fallo de conexión con ML Service (${this.mlServiceUrl}): ${error.message}`);
      throw new ServiceUnavailableException(
        'El microservicio de visión artificial (ML) no está disponible en este momento.',
      );
    }
  }

  /**
   * Envía 1 foto de búsqueda para validar que sea perro/gato y extraer
   * su embedding visual de 384 dimensiones para búsqueda vectorial.
   */
  async extractSearchEmbedding(
    file: Express.Multer.File,
  ): Promise<EmbeddingQueryDto> {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen para buscar mascotas similares.');
    }

    const form = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || 'image/jpeg' });
    form.append('file', blob, file.originalname || 'search.jpg');

    try {
      const res = await fetch(`${this.mlServiceUrl}/v1/vision/embedding`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.error(`Error extrayendo embedding en ML Service: ${res.status} - ${errorText}`);
        throw new BadRequestException(
          `Error al procesar la imagen de búsqueda: ${errorText || res.statusText}`,
        );
      }

      const data = (await res.json()) as EmbeddingQueryDto;
      if (!data.valid || !data.vector) {
        throw new BadRequestException(
          data.message || 'La imagen subida no parece ser un perro o un gato reconocible.',
        );
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Fallo de conexión con ML Service (${this.mlServiceUrl}): ${error.message}`);
      throw new ServiceUnavailableException(
        'El microservicio de visión artificial (ML) no está disponible en este momento.',
      );
    }
  }
}
