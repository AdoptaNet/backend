import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetResponseDto } from './pet-response.dto';

export class QueryPhotoTraitsDto {
  @ApiPropertyOptional({ example: 'dog' })
  species?: string | null;

  @ApiPropertyOptional({ example: 0.94 })
  speciesConfidence?: number;

  @ApiPropertyOptional({ example: 'short' })
  fur?: string | null;

  @ApiPropertyOptional({ example: 'medium' })
  size?: string | null;

  @ApiPropertyOptional({ example: ['marron', 'blanco'], type: [String] })
  colors?: string[];
}

export class SimilarPetResponseDto {
  @ApiProperty({ type: PetResponseDto })
  pet: PetResponseDto;

  @ApiProperty({ example: 0.924, description: 'Score de similitud coseno (entre 0.0 y 1.0)' })
  similarityScore: number;

  @ApiProperty({ example: 92, description: 'Porcentaje entero de similitud visual' })
  similarityPercentage: number;

  @ApiProperty({
    example: ['🎨 Color similar (Crema)', '✂️ Pelaje Corto', '👁️ Fisionomía facial muy parecida'],
    description: 'Motivos de similitud física generados por IA (XAI)',
    type: [String],
  })
  matchReasons: string[];

  @ApiPropertyOptional({ type: QueryPhotoTraitsDto, description: 'Rasgos detectados en la foto de búsqueda' })
  queryTraits?: QueryPhotoTraitsDto;
}
