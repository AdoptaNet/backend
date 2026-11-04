import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({
    summary: 'Health check público del servicio (Liveness / Readiness Probe)',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio en línea y respondiendo adecuadamente',
    schema: {
      example: {
        status: 'healthy',
        service: 'adoptanet-api',
        timestamp: '2026-11-04T12:00:00.000Z',
        uptime: 123.45,
      },
    },
  })
  getHealth() {
    return {
      status: 'healthy',
      service: 'adoptanet-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Endpoint raíz de bienvenida e información de AdoptaNet API' })
  getRoot() {
    return {
      service: 'AdoptaNet API',
      status: 'healthy',
      docs: '/api/docs',
    };
  }
}
