import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { GetAdminMetricsUseCase } from '../../application/use-cases/get-admin-metrics.use-case';
import { CheckSystemHealthUseCase } from '../../application/use-cases/check-system-health.use-case';
import { GetAdminSheltersUseCase } from '../../application/use-cases/get-admin-shelters.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';

describe('AdminController', () => {
  let controller: AdminController;
  let getAdminMetricsUseCaseMock: jest.Mocked<Partial<GetAdminMetricsUseCase>>;
  let checkSystemHealthUseCaseMock: jest.Mocked<Partial<CheckSystemHealthUseCase>>;
  let getAdminSheltersUseCaseMock: jest.Mocked<Partial<GetAdminSheltersUseCase>>;

  beforeEach(async () => {
    getAdminMetricsUseCaseMock = {
      execute: jest.fn().mockResolvedValue({
        operational: {
          pets: { total: 10, available: 5, inProcess: 2, adopted: 3, adoptionRate: 30 },
          adoptions: { total: 5, submitted: 1, inReview: 1, approved: 2, rejected: 1, cancelled: 0, approvalRate: 66.67 },
          followUps: { active: 2, completed180d: 1, returnsCount: 0, returnRate: 0 },
          shelters: { total: 4, verified: 3, unverified: 1, verificationRate: 75 },
        },
        mlTelemetry: {
          interactions: { totalImpressions: 50, totalClicks: 10, totalApplies: 2, ctr: 20, conversionRate: 4, clickToApplyRate: 20 },
          resilience: { totalCached: 40, hybridCount: 35, fallbackCount: 5, hybridRatio: 87.5, fallbackRatio: 12.5 },
        },
        timestamp: '2026-11-04T12:00:00.000Z',
      }),
    };

    checkSystemHealthUseCaseMock = {
      execute: jest.fn().mockResolvedValue({
        status: 'healthy',
        services: {
          database: { status: 'healthy', latencyMs: 5 },
          realtime: { status: 'healthy', latencyMs: 1 },
          mlService: { status: 'healthy', latencyMs: 15 },
        },
        timestamp: '2026-11-04T12:00:00.000Z',
      }),
    };

    getAdminSheltersUseCaseMock = {
      execute: jest.fn().mockResolvedValue({
        shelters: [],
        total: 0,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: GetAdminMetricsUseCase, useValue: getAdminMetricsUseCaseMock },
        { provide: CheckSystemHealthUseCase, useValue: checkSystemHealthUseCaseMock },
        { provide: GetAdminSheltersUseCase, useValue: getAdminSheltersUseCaseMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should call GetAdminMetricsUseCase when getMetrics is requested', async () => {
    const result = await controller.getMetrics();
    expect(getAdminMetricsUseCaseMock.execute).toHaveBeenCalled();
    expect(result.operational.pets.total).toBe(10);
  });

  it('should call CheckSystemHealthUseCase when getHealth is requested', async () => {
    const result = await controller.getHealth();
    expect(checkSystemHealthUseCaseMock.execute).toHaveBeenCalled();
    expect(result.status).toBe('healthy');
  });

  it('should call GetAdminSheltersUseCase when getShelters is requested', async () => {
    await controller.getShelters('true');
    expect(getAdminSheltersUseCaseMock.execute).toHaveBeenCalledWith(true);
  });
});
