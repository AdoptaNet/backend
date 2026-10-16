import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { CreateAdoptionRequestDto } from '../../application/dtos/create-adoption-request.dto';
import { ReviewAdoptionRequestDto } from '../../application/dtos/review-adoption-request.dto';
import { QueryAdoptionRequestsDto } from '../../application/dtos/query-adoption-requests.dto';
import {
  AdoptionRequestResponseDto,
  PaginatedAdoptionRequestsResponseDto,
} from '../../application/dtos/adoption-request-response.dto';
import { SubmitAdoptionRequestUseCase } from '../../application/use-cases/submit-adoption-request.use-case';
import { GetMyAdoptionsUseCase } from '../../application/use-cases/get-my-adoptions.use-case';
import { CancelAdoptionRequestUseCase } from '../../application/use-cases/cancel-adoption-request.use-case';
import { GetShelterAdoptionsUseCase } from '../../application/use-cases/get-shelter-adoptions.use-case';
import { GetAdoptionByIdUseCase } from '../../application/use-cases/get-adoption-by-id.use-case';
import { ReviewAdoptionRequestUseCase } from '../../application/use-cases/review-adoption-request.use-case';

@ApiTags('adoptions')
@Controller('adoptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdoptionsController {
  constructor(
    private readonly submitAdoptionUseCase: SubmitAdoptionRequestUseCase,
    private readonly getMyAdoptionsUseCase: GetMyAdoptionsUseCase,
    private readonly cancelAdoptionUseCase: CancelAdoptionRequestUseCase,
    private readonly getShelterAdoptionsUseCase: GetShelterAdoptionsUseCase,
    private readonly getAdoptionByIdUseCase: GetAdoptionByIdUseCase,
    private readonly reviewAdoptionUseCase: ReviewAdoptionRequestUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADOPTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar una postulación formal de adopción (US-15 Escenario 1 y 2)',
    description:
      'Registra la postulación con snapshot inmutable de compatibilidad, valida el límite de 3 solicitudes concurrentes y que la mascota esté disponible.',
  })
  @ApiResponse({
    status: 201,
    type: AdoptionRequestResponseDto,
    description: 'Postulación enviada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Cuestionario de compatibilidad no completado o datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description:
      'Límite de 3 solicitudes concurrentes alcanzado o postulación duplicada para la misma mascota',
  })
  async submitAdoption(
    @CurrentUser() user: User,
    @Body() dto: CreateAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    return this.submitAdoptionUseCase.execute(user.id, dto);
  }

  @Get('my-requests')
  @Roles(UserRole.ADOPTER)
  @ApiOperation({
    summary:
      'Listar las postulaciones de adopción del adoptante autenticado (US-15 Escenario 3)',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedAdoptionRequestsResponseDto,
    description: 'Lista paginada de postulaciones del adoptante',
  })
  async getMyRequests(
    @CurrentUser() user: User,
    @Query() query: QueryAdoptionRequestsDto,
  ): Promise<PaginatedAdoptionRequestsResponseDto> {
    return this.getMyAdoptionsUseCase.execute(user.id, query);
  }

  @Get('shelter')
  @Roles(UserRole.SHELTER)
  @ApiOperation({
    summary:
      'Listar las solicitudes de adopción recibidas por el albergue (US-16 Escenario 1)',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedAdoptionRequestsResponseDto,
    description: 'Bandeja de solicitudes de adopción del albergue',
  })
  async getShelterRequests(
    @CurrentUser() user: User,
    @Query() query: QueryAdoptionRequestsDto,
  ): Promise<PaginatedAdoptionRequestsResponseDto> {
    return this.getShelterAdoptionsUseCase.execute(user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Consultar expediente completo de una solicitud de adopción con snapshot inmutable',
  })
  @ApiResponse({
    status: 200,
    type: AdoptionRequestResponseDto,
    description: 'Expediente de postulación de adopción',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado para ver este expediente' })
  async getById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdoptionRequestResponseDto> {
    return this.getAdoptionByIdUseCase.execute(id, user.id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADOPTER)
  @ApiOperation({
    summary:
      'Cancelar o desistir voluntariamente de una postulación en curso (US-15 Escenario 4)',
  })
  @ApiResponse({
    status: 200,
    type: AdoptionRequestResponseDto,
    description: 'Postulación cancelada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar una postulación aprobada o rechazada',
  })
  async cancel(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdoptionRequestResponseDto> {
    return this.cancelAdoptionUseCase.execute(id, user.id);
  }

  @Patch(':id/review')
  @Roles(UserRole.SHELTER)
  @ApiOperation({
    summary:
      'Dictaminar o resolver una postulación de adopción (Aprobar, Rechazar, Poner en Revisión) (US-16 Escenario 2 y 3)',
  })
  @ApiResponse({
    status: 200,
    type: AdoptionRequestResponseDto,
    description: 'Dictamen registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o solicitud ya finalizada',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para dictaminar solicitudes de esta mascota',
  })
  async review(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    return this.reviewAdoptionUseCase.execute(id, user.id, dto);
  }
}
