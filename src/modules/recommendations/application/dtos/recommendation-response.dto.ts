import { ApiProperty } from '@nestjs/swagger';
import { PetResponseDto } from '../../../pets/application/dtos/pet-response.dto';
import { ReasonBadge } from '../../domain/entities/recommendation-cache.entity';

export class RecommendedPetResponseDto {
  @ApiProperty({ description: 'Posición ordinal en el ranking (1-based)', example: 1 })
  position: number;

  @ApiProperty({
    description: 'Puntaje de afinidad continuo calculado por el modelo (reservado para ordenamiento)',
    example: 1.0865,
  })
  score: number;

  @ApiProperty({
    description: 'Etiquetas explicativas XAI derivadas del modelo (sin porcentajes opacos)',
    example: [
      { category: 'housing', badge: 'Ideal para departamento' },
      { category: 'routine', badge: 'Tolera tus horas a solas' },
    ],
  })
  reasonBadges: ReasonBadge[];

  @ApiProperty({
    description: 'Indica si la recomendación provino del fallback heurístico en contingencia',
    example: false,
  })
  isFallback: boolean;

  @ApiProperty({
    description: 'Entidad completa de la mascota para renderizado directo en tarjeta',
    type: PetResponseDto,
  })
  pet: PetResponseDto;
}

export class PersonalizedRecommendationsResponseDto {
  @ApiProperty({
    description: 'Indica si el adoptante tiene su cuestionario de compatibilidad completo',
    example: true,
  })
  isSurveyCompleted: boolean;

  @ApiProperty({
    description: 'Lista ordenada de mascotas recomendadas según compatibilidad y bienestar animal',
    type: [RecommendedPetResponseDto],
  })
  recommendations: RecommendedPetResponseDto[];

  @ApiProperty({
    description: 'Tiempo de respuesta o cálculo de recomendaciones en milisegundos',
    example: 24.5,
  })
  executionTimeMs: number;
}
