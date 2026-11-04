import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { GetAdminMetricsUseCase } from './get-admin-metrics.use-case';

describe('GetAdminMetricsUseCase', () => {
  let useCase: GetAdminMetricsUseCase;
  let dataSourceMock: jest.Mocked<Partial<DataSource>>;

  beforeEach(async () => {
    dataSourceMock = {
      query: jest.fn().mockImplementation((query: string) => {
        if (query.includes('FROM pets')) {
          return Promise.resolve([
            { status: 'available', count: '10' },
            { status: 'in_process', count: '3' },
            { status: 'adopted', count: '7' },
          ]);
        }
        if (query.includes('FROM adoption_requests')) {
          return Promise.resolve([
            { status: 'submitted', count: '4' },
            { status: 'in_review', count: '2' },
            { status: 'approved', count: '5' },
            { status: 'rejected', count: '1' },
            { status: 'cancelled', count: '0' },
          ]);
        }
        if (query.includes('FROM shelter_profiles')) {
          return Promise.resolve([
            { is_verified: true, count: '6' },
            { is_verified: false, count: '2' },
          ]);
        }
        if (query.includes("to_regclass('public.follow_up_records')")) {
          return Promise.resolve([{ table_name: 'public.follow_up_records' }]);
        }
        if (query.includes('FROM follow_up_records')) {
          return Promise.resolve([
            { status: 'in_progress', count: '4' },
            { status: 'completed', count: '2' },
            { status: 'returned', count: '1' },
          ]);
        }
        if (query.includes('FROM recommendation_interactions')) {
          return Promise.resolve([
            { interaction_type: 'impression', count: '100' },
            { interaction_type: 'click', count: '25' },
            { interaction_type: 'apply', count: '5' },
          ]);
        }
        if (query.includes('FROM recommendation_caches')) {
          return Promise.resolve([
            { is_fallback: false, count: '80' },
            { is_fallback: true, count: '20' },
          ]);
        }
        return Promise.resolve([]);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdminMetricsUseCase,
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    useCase = module.get<GetAdminMetricsUseCase>(GetAdminMetricsUseCase);
  });

  it('should return operational metrics and ML telemetry correctly calculated', async () => {
    const result = await useCase.execute();

    // Pets
    expect(result.operational.pets.total).toBe(20);
    expect(result.operational.pets.available).toBe(10);
    expect(result.operational.pets.inProcess).toBe(3);
    expect(result.operational.pets.adopted).toBe(7);
    expect(result.operational.pets.adoptionRate).toBe(35); // 7/20 * 100

    // Adoptions
    expect(result.operational.adoptions.total).toBe(12);
    expect(result.operational.adoptions.approved).toBe(5);
    expect(result.operational.adoptions.rejected).toBe(1);
    expect(result.operational.adoptions.approvalRate).toBe(83.33); // 5 / (5 + 1) * 100

    // Shelters
    expect(result.operational.shelters.total).toBe(8);
    expect(result.operational.shelters.verified).toBe(6);
    expect(result.operational.shelters.unverified).toBe(2);
    expect(result.operational.shelters.verificationRate).toBe(75);

    // Follow-ups
    expect(result.operational.followUps.active).toBe(4);
    expect(result.operational.followUps.completed180d).toBe(2);
    expect(result.operational.followUps.returnsCount).toBe(1);
    expect(result.operational.followUps.returnRate).toBe(14.29); // 1 / 7 * 100

    // ML Telemetry
    expect(result.mlTelemetry.interactions.totalImpressions).toBe(100);
    expect(result.mlTelemetry.interactions.totalClicks).toBe(25);
    expect(result.mlTelemetry.interactions.totalApplies).toBe(5);
    expect(result.mlTelemetry.interactions.ctr).toBe(25); // 25 / 100 * 100
    expect(result.mlTelemetry.interactions.conversionRate).toBe(5); // 5 / 100 * 100
    expect(result.mlTelemetry.interactions.clickToApplyRate).toBe(20); // 5 / 25 * 100

    // ML Resilience
    expect(result.mlTelemetry.resilience.totalCached).toBe(100);
    expect(result.mlTelemetry.resilience.hybridCount).toBe(80);
    expect(result.mlTelemetry.resilience.fallbackCount).toBe(20);
    expect(result.mlTelemetry.resilience.hybridRatio).toBe(80);
    expect(result.mlTelemetry.resilience.fallbackRatio).toBe(20);

    expect(result.timestamp).toBeDefined();
  });
});
