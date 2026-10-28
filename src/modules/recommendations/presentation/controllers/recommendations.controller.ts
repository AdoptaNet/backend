import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { User } from '../../../users/domain/entities/user.entity';
import { QueryRecommendationsDto } from '../../application/dtos/query-recommendations.dto';
import { PersonalizedRecommendationsResponseDto } from '../../application/dtos/recommendation-response.dto';
import { RecordInteractionDto } from '../../application/dtos/record-interaction.dto';
import { GetPersonalizedRecommendationsUseCase } from '../../application/use-cases/get-personalized-recommendations.use-case';
import { RecordRecommendationInteractionUseCase } from '../../application/use-cases/record-recommendation-interaction.use-case';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(
    private readonly getRecommendationsUseCase: GetPersonalizedRecommendationsUseCase,
    private readonly recordInteractionUseCase: RecordRecommendationInteractionUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Obtener catálogo personalizado "Para Ti" con explicabilidad XAI y filtrado secundario',
    description:
      'Retorna recomendaciones ordenadas por compatibilidad y bienestar animal desde la caché de alto rendimiento en PostgreSQL. Si no existe o fue invalidada, orquesta la inferencia con el modelo híbrido en FastAPI.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PersonalizedRecommendationsResponseDto,
    description: 'Recomendaciones personalizadas obtenidas exitosamente',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async getRecommendations(
    @CurrentUser() user: User,
    @Query() query: QueryRecommendationsDto,
  ): Promise<PersonalizedRecommendationsResponseDto> {
    return this.getRecommendationsUseCase.execute(user, query);
  }

  @Post('interactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Registrar telemetría de interacción con una recomendación (impresión, clic o postulación)',
    description:
      'Permite auditar el comportamiento empírico del motor de Machine Learning y calcular métricas de evaluación científica (CTR, Precision@K y tasa de postulación).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Interacción registrada exitosamente',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async recordInteraction(
    @CurrentUser() user: User,
    @Body() dto: RecordInteractionDto,
  ): Promise<{ success: boolean }> {
    return this.recordInteractionUseCase.execute(user, dto);
  }
}
