import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompletePetReturnDto {
  @ApiProperty({
    example: 'accept',
    enum: ['accept', 'reject'],
    description: 'Resolución final del retorno tras recepción o verificación física',
  })
  @IsIn(['accept', 'reject'])
  @IsNotEmpty()
  decision: 'accept' | 'reject';

  @ApiPropertyOptional({
    example: 'Mascota recibida en buen estado físico. Pasa a evaluación veterinaria de rutina.',
    description: 'Observaciones finales del albergue',
  })
  @IsString()
  @IsOptional()
  shelterObservations?: string;
}
