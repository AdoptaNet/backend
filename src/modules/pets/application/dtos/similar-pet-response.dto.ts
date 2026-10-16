import { ApiProperty } from '@nestjs/swagger';
import { PetResponseDto } from './pet-response.dto';

export class SimilarPetResponseDto {
  @ApiProperty({ type: PetResponseDto })
  pet: PetResponseDto;

  @ApiProperty({ example: 0.924, description: 'Score de similitud coseno (entre 0.0 y 1.0)' })
  similarityScore: number;

  @ApiProperty({ example: 92, description: 'Porcentaje entero de similitud visual' })
  similarityPercentage: number;
}
