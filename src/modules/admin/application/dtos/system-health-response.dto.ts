export type ServiceHealthStatus = 'healthy' | 'degraded' | 'down';

export interface ServiceHealthDetail {
  status: ServiceHealthStatus;
  latencyMs: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealthResponseDto {
  status: ServiceHealthStatus;
  services: {
    database: ServiceHealthDetail;
    realtime: ServiceHealthDetail;
    mlService: ServiceHealthDetail;
  };
  timestamp: string;
}
