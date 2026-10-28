import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { RecommendationInteractionType } from '../../domain/value-objects/recommendation-interaction-type.enum';

export class RecordInteractionDto {
  @ApiProperty({
    description: 'Identificador único de la mascota recomendada',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  petId: string;

  @ApiProperty({
    description: 'Tipo de interacción efectuada en la sección Para Ti',
    enum: RecommendationInteractionType,
    example: RecommendationInteractionType.IMPRESSION,
  })
  @IsEnum(RecommendationInteractionType)
  interactionType: RecommendationInteractionType;

  @ApiProperty({
    description: 'Posición ordinal en el ranking cuando ocurrió la interacción',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  position: number;
}
