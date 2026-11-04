import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewMilestoneDto {
  @ApiPropertyOptional({
    example: 'approved',
    enum: ['approved', 'action_required', 'rejected'],
    description: 'Decisión del albergue sobre las evidencias presentadas',
  })
  @IsIn(['approved', 'action_required', 'rejected'])
  @IsOptional()
  decision?: 'approved' | 'action_required' | 'rejected';

  @ApiPropertyOptional({
    example: 'approved',
    enum: ['approved', 'action_required', 'rejected', 'completed'],
    description: 'Estado alternativo de decisión para compatibilidad',
  })
  @IsIn(['approved', 'action_required', 'rejected', 'completed'])
  @IsOptional()
  status?: 'approved' | 'action_required' | 'rejected' | 'completed';

  @ApiPropertyOptional({
    example: 'Fotos claras y carnet con vacuna séxtuple al día. ¡Excelente trabajo!',
    description: 'Comentarios u observaciones de retroalimentación para el adoptante',
  })
  @IsString()
  @IsOptional()
  reviewNotes?: string;

  @ApiPropertyOptional({
    example: 'Fotos claras y carnet con vacuna séxtuple al día. ¡Excelente trabajo!',
    description: 'Comentarios u observaciones de retroalimentación para el adoptante (alias)',
  })
  @IsString()
  @IsOptional()
  shelterFeedback?: string;
}
