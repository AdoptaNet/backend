import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { User } from '../../../users/domain/entities/user.entity';
import { GetFollowUpsUseCase } from '../../application/use-cases/get-follow-ups.use-case';
import { GetFollowUpDetailUseCase } from '../../application/use-cases/get-follow-up-detail.use-case';
import { SubmitMilestoneEvidenceUseCase } from '../../application/use-cases/submit-milestone-evidence.use-case';
import { ReviewMilestoneUseCase } from '../../application/use-cases/review-milestone.use-case';
import { RequestPetReturnUseCase } from '../../application/use-cases/request-pet-return.use-case';
import { SimulateMilestoneTimeUseCase } from '../../application/use-cases/simulate-milestone-time.use-case';
import { RunFollowUpCronUseCase } from '../../application/use-cases/run-follow-up-cron.use-case';
import { SubmitMilestoneDto } from '../../application/dtos/submit-milestone.dto';
import { ReviewMilestoneDto } from '../../application/dtos/review-milestone.dto';
import { RequestPetReturnDto } from '../../application/dtos/request-pet-return.dto';
import { SimulateMilestoneTimeDto } from '../../application/dtos/simulate-milestone-time.dto';

@ApiTags('FollowUps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follow-ups')
export class FollowUpsController {
  constructor(
    private readonly getFollowUpsUseCase: GetFollowUpsUseCase,
    private readonly getFollowUpDetailUseCase: GetFollowUpDetailUseCase,
    private readonly submitMilestoneEvidenceUseCase: SubmitMilestoneEvidenceUseCase,
    private readonly reviewMilestoneUseCase: ReviewMilestoneUseCase,
    private readonly requestPetReturnUseCase: RequestPetReturnUseCase,
    private readonly simulateMilestoneTimeUseCase: SimulateMilestoneTimeUseCase,
    private readonly runFollowUpCronUseCase: RunFollowUpCronUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar expedientes de seguimiento post-adopción del usuario',
  })
  @ApiResponse({ status: 200, description: 'Listado de expedientes' })
  async getFollowUps(@CurrentUser() user: User) {
    return await this.getFollowUpsUseCase.execute(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle completo de un expediente de seguimiento',
  })
  @ApiResponse({ status: 200, description: 'Detalle de seguimiento' })
  async getFollowUpDetail(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return await this.getFollowUpDetailUseCase.execute(id, user.id, user.role);
  }

  @Post(':id/milestones/:milestoneId/evidences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Subir evidencias y notas de adaptación para un hito (Adoptante)',
  })
  @ApiResponse({ status: 200, description: 'Evidencias registradas' })
  async submitMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: SubmitMilestoneDto,
    @CurrentUser() user: User,
  ) {
    return await this.submitMilestoneEvidenceUseCase.execute(
      id,
      milestoneId,
      dto,
      user.id,
    );
  }

  @Patch(':id/milestones/:milestoneId/review')
  @ApiOperation({
    summary: 'Revisar y dictaminar evidencias de un hito (Albergue o Admin)',
  })
  @ApiResponse({ status: 200, description: 'Hito dictaminado' })
  async reviewMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: ReviewMilestoneDto,
    @CurrentUser() user: User,
  ) {
    return await this.reviewMilestoneUseCase.execute(
      id,
      milestoneId,
      dto,
      user.id,
      user.role,
    );
  }

  @Post(':id/returns')
  @ApiOperation({
    summary: 'Iniciar solicitud formal de retorno de mascota (Adoptante)',
  })
  @ApiResponse({ status: 201, description: 'Retorno solicitado' })
  async requestReturn(
    @Param('id') id: string,
    @Body() dto: RequestPetReturnDto,
    @CurrentUser() user: User,
  ) {
    return await this.requestPetReturnUseCase.execute(id, dto, user.id);
  }

  @Post(':id/milestones/:milestoneId/simulate-time')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulación de fecha / Time-travel para pruebas (Modo Demo / Dev)',
  })
  @ApiResponse({ status: 200, description: 'Fecha desplazada y cron evaluado' })
  async simulateTime(
    @Param('id') _id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: SimulateMilestoneTimeDto,
  ) {
    return await this.simulateMilestoneTimeUseCase.execute(milestoneId, dto);
  }

  @Post('cron/trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disparar ejecución manual del cron job de seguimiento (Admin o Demo)',
  })
  @ApiResponse({ status: 200, description: 'Cron ejecutado' })
  async triggerCron() {
    return await this.runFollowUpCronUseCase.execute();
  }
}
