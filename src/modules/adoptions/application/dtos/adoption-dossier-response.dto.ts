import { ApiProperty } from '@nestjs/swagger';

export class AdoptionDossierResponseDto {
  @ApiProperty({ description: 'ID de la mascota evaluada' })
  petId: string;

  @ApiProperty({ description: 'Nombre o identificador de la mascota' })
  petName: string;

  @ApiProperty({
    description: 'Veredicto del modelo de IA',
    example: 'APTO PARA ENTREVISTA',
  })
  verdict: string;

  @ApiProperty({
    description: 'Compatibilidad pura (sin sesgos) entre 0 y 1',
    example: 0.82,
  })
  compatibility: number;

  @ApiProperty({
    description: 'Probabilidad estimada de interés del adoptante',
    example: 0.75,
  })
  interestProbability: number;

  @ApiProperty({
    description: 'Puntos y características a favor de la adopción',
    type: [String],
  })
  positiveFactors: string[];

  @ApiProperty({
    description: 'Puntos de atención para profundizar en la entrevista',
    type: [String],
  })
  alerts: string[];

  @ApiProperty({
    description: 'Factores en contra identificados',
    type: [String],
  })
  negativeFactors: string[];

  @ApiProperty({
    description: 'Reglas de bienestar animal incumplidas',
    type: [String],
  })
  violatedRules: string[];
}
