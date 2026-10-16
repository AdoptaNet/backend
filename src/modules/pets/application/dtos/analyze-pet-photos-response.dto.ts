import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttributeOptionDto {
  @ApiProperty({ example: 'dog' })
  value: string;

  @ApiProperty({ example: 'Perro' })
  label: string;

  @ApiProperty({ example: 0.985 })
  probability: number;
}

export class SingleAttributePredictionDto {
  @ApiPropertyOptional({ example: 'dog', nullable: true })
  value: string | null;

  @ApiPropertyOptional({ example: 'Perro', nullable: true })
  label: string | null;

  @ApiProperty({ example: 0.985 })
  confidence: number;

  @ApiProperty({ example: true })
  autocompleted: boolean;

  @ApiProperty({ type: [AttributeOptionDto] })
  options: AttributeOptionDto[];
}

export class MultipleAttributePredictionDto {
  @ApiPropertyOptional({ example: ['negro', 'blanco'], nullable: true, type: [String] })
  value: string[] | null;

  @ApiPropertyOptional({ example: ['Negro', 'Blanco'], nullable: true, type: [String] })
  label: string[] | null;

  @ApiProperty({ example: 0.892 })
  confidence: number;

  @ApiProperty({ example: true })
  autocompleted: boolean;

  @ApiProperty({ type: [AttributeOptionDto] })
  options: AttributeOptionDto[];
}

export class AnalyzePetPhotosResponseDto {
  @ApiProperty({ type: SingleAttributePredictionDto })
  species: SingleAttributePredictionDto;

  @ApiProperty({ type: SingleAttributePredictionDto })
  fur: SingleAttributePredictionDto;

  @ApiProperty({ type: SingleAttributePredictionDto })
  size: SingleAttributePredictionDto;

  @ApiProperty({ type: MultipleAttributePredictionDto })
  colors: MultipleAttributePredictionDto;

  @ApiProperty({ example: ['species', 'fur', 'colors'], type: [String] })
  autocompletedFields: string[];

  @ApiProperty({ example: ['size'], type: [String] })
  reviewFields: string[];

  @ApiPropertyOptional({
    description: 'Vector visual normalizado de 384 dimensiones generado por DINOv2',
    type: [Number],
  })
  embedding?: number[];

  @ApiProperty({ example: 142.5, description: 'Tiempo de inferencia del modelo en ms' })
  inferenceTimeMs: number;
}
