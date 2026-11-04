import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CheckSystemHealthUseCase } from './check-system-health.use-case';

describe('CheckSystemHealthUseCase', () => {
  let useCase: CheckSystemHealthUseCase;
  let dataSourceMock: jest.Mocked<Partial<DataSource>>;
  let configServiceMock: jest.Mocked<Partial<ConfigService>>;

  beforeEach(async () => {
    dataSourceMock = {
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    configServiceMock = {
      get: jest.fn().mockReturnValue('http://localhost:8000'),
    };

    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'healthy',
        vision_model: { name: 'DINOv2', version: '1.0' },
        recommendation_model: { name: 'Hybrid', version: '1.0', catalog_size: 100 },
      }),
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckSystemHealthUseCase,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    useCase = module.get<CheckSystemHealthUseCase>(CheckSystemHealthUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return healthy status when all services respond properly', async () => {
    const result = await useCase.execute();

    expect(result.status).toBe('healthy');
    expect(result.services.database.status).toBe('healthy');
    expect(result.services.realtime.status).toBe('healthy');
    expect(result.services.mlService.status).toBe('healthy');
    expect(result.services.mlService.metadata?.catalogSize).toBe(100);
  });

  it('should return degraded status if ML service is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

    const result = await useCase.execute();

    expect(result.status).toBe('degraded');
    expect(result.services.database.status).toBe('healthy');
    expect(result.services.mlService.status).toBe('down');
  });

  it('should return down status if database is down', async () => {
    dataSourceMock.query = jest.fn().mockRejectedValue(new Error('DB Connection error'));

    const result = await useCase.execute();

    expect(result.status).toBe('down');
    expect(result.services.database.status).toBe('down');
  });
});
