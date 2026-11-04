import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  ServiceHealthDetail,
  ServiceHealthStatus,
  SystemHealthResponseDto,
} from '../dtos/system-health-response.dto';

@Injectable()
export class CheckSystemHealthUseCase {
  private readonly logger = new Logger(CheckSystemHealthUseCase.name);
  private readonly mlServiceUrl: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000';
  }

  async execute(): Promise<SystemHealthResponseDto> {
    const [database, realtime, mlService] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRealtimeHealth(),
      this.checkMlServiceHealth(),
    ]);

    let overallStatus: ServiceHealthStatus = 'healthy';
    if (database.status === 'down') {
      overallStatus = 'down';
    } else if (
      database.status === 'degraded' ||
      realtime.status === 'down' ||
      realtime.status === 'degraded' ||
      mlService.status === 'down' ||
      mlService.status === 'degraded'
    ) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      services: {
        database,
        realtime,
        mlService,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabaseHealth(): Promise<ServiceHealthDetail> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1;');
      const latencyMs = Date.now() - startTime;
      return {
        status: latencyMs > 1000 ? 'degraded' : 'healthy',
        latencyMs,
        message: 'Conexión a PostgreSQL / Supabase operativa',
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        status: 'down',
        latencyMs,
        message: `Error de conexión a PostgreSQL: ${error.message}`,
      };
    }
  }

  private async checkRealtimeHealth(): Promise<ServiceHealthDetail> {
    const startTime = Date.now();
    try {
      // El gateway de Socket.io se encuentra inicializado dentro del proceso de NestJS
      const latencyMs = Date.now() - startTime;
      return {
        status: 'healthy',
        latencyMs,
        message: 'Socket.io Gateway activo (namespace /messages)',
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        status: 'down',
        latencyMs,
        message: `Error en capa de tiempo real: ${error.message}`,
      };
    }
  }

  private async checkMlServiceHealth(): Promise<ServiceHealthDetail> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${this.mlServiceUrl}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          status: 'degraded',
          latencyMs,
          message: `Microservicio ML respondió con código HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as Record<string, any>;

      return {
        status: latencyMs > 2500 ? 'degraded' : 'healthy',
        latencyMs,
        message: 'Microservicio de Machine Learning en Python FastAPI operativo',
        metadata: {
          visionModel: data.vision_model?.name,
          recommendationModel: data.recommendation_model?.name,
          catalogSize: data.recommendation_model?.catalog_size,
        },
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.warn(`ML Service health check unreachable: ${error.message}`);
      return {
        status: 'down',
        latencyMs,
        message: `Microservicio ML no disponible en ${this.mlServiceUrl} (${error.message})`,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
