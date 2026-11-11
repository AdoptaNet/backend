import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { CheckSystemHealthUseCase } from '../../application/use-cases/check-system-health.use-case';
import { GetAdminMetricsUseCase } from '../../application/use-cases/get-admin-metrics.use-case';
import { GetAdminSheltersUseCase } from '../../application/use-cases/get-admin-shelters.use-case';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly getAdminMetricsUseCase: GetAdminMetricsUseCase,
    private readonly checkSystemHealthUseCase: CheckSystemHealthUseCase,
    private readonly getAdminSheltersUseCase: GetAdminSheltersUseCase,
  ) {}

  @Get('metrics')
  @ApiOperation({
    summary: 'Obtener métricas consolidadas de adopciones y telemetría de Machine Learning',
    description:
      'Retorna KPIs operacionales del catálogo de mascotas, efectividad del proceso de postulación, estadísticas de albergues y telemetría analítica (CTR, conversión, resiliencia ML vs fallback). Exclusivo para administradores.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Métricas consolidadas obtenidas exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado: se requiere rol de administrador',
  })
  async getMetrics() {
    return this.getAdminMetricsUseCase.execute();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Monitor de disponibilidad y salud de infraestructura (Health Checks)',
    description:
      'Ejecuta sondas automáticas a PostgreSQL/Supabase, capa en tiempo real (Socket.io) y microservicio ML en Python FastAPI con cálculo de latencia. Exclusivo para administradores.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de salud de servicios obtenido exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado: se requiere rol de administrador',
  })
  async getHealth() {
    return this.checkSystemHealthUseCase.execute();
  }

  @Get('shelters')
  @ApiOperation({
    summary: 'Listado administrativo de albergues para fiscalización y verificación',
    description:
      'Retorna todos los albergues registrados con su estado de acreditación y conteo de mascotas activas.',
  })
  @ApiQuery({
    name: 'verified',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado de verificación (true / false)',
  })
  @ApiQuery({
    name: 'pending',
    required: false,
    type: Boolean,
    description: 'Filtrar por solicitudes de verificación pendientes (true / false)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de albergues obtenido exitosamente',
  })
  async getShelters(
    @Query('verified') verified?: string,
    @Query('pending') pending?: string,
  ) {
    let isVerified: boolean | undefined = undefined;
    if (verified === 'true') isVerified = true;
    else if (verified === 'false') isVerified = false;

    let verificationRequested: boolean | undefined = undefined;
    if (pending === 'true') verificationRequested = true;
    else if (pending === 'false') verificationRequested = false;

    if (verificationRequested !== undefined) {
      return this.getAdminSheltersUseCase.execute(
        isVerified,
        verificationRequested,
      );
    }

    return this.getAdminSheltersUseCase.execute(isVerified);
  }
}
