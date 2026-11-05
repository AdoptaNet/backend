import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewMilestoneDto {
  @ApiProperty({
    example: 'approved',
    enum: ['approved', 'action_required'],
    description: 'Decisión del albergue sobre las evidencias presentadas',
  })
  @IsIn(['approved', 'action_required'])
  @IsNotEmpty()
  decision: 'approved' | 'action_required';

  @ApiPropertyOptional({
    example: 'Fotos claras y carnet con vacuna séxtuple al día. ¡Excelente trabajo!',
    description: 'Comentarios u observaciones de retroalimentación para el adoptante',
  })
  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
