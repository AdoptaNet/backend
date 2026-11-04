import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminMetricsResponseDto,
  AdoptionRequestMetrics,
  FollowUpSummaryMetrics,
  MlInteractionMetrics,
  MlResilienceMetrics,
  PetDistributionMetrics,
  ShelterSummaryMetrics,
} from '../dtos/admin-metrics-response.dto';

@Injectable()
export class GetAdminMetricsUseCase {
  private readonly logger = new Logger(GetAdminMetricsUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<AdminMetricsResponseDto> {
    const [
      petsMetrics,
      adoptionsMetrics,
      sheltersMetrics,
      followUpsMetrics,
      mlInteractions,
      mlResilience,
    ] = await Promise.all([
      this.getPetDistributionMetrics(),
      this.getAdoptionRequestMetrics(),
      this.getShelterSummaryMetrics(),
      this.getFollowUpSummaryMetrics(),
      this.getMlInteractionMetrics(),
      this.getMlResilienceMetrics(),
    ]);

    return {
      operational: {
        pets: petsMetrics,
        adoptions: adoptionsMetrics,
        followUps: followUpsMetrics,
        shelters: sheltersMetrics,
      },
      mlTelemetry: {
        interactions: mlInteractions,
        resilience: mlResilience,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async getPetDistributionMetrics(): Promise<PetDistributionMetrics> {
    try {
      const rows: { status: string; count: string }[] = await this.dataSource.query(`
        SELECT status, COUNT(*)::text as count
        FROM pets
        GROUP BY status
      `);

      let available = 0;
      let inProcess = 0;
      let adopted = 0;

      for (const row of rows) {
        const count = parseInt(row.count, 10) || 0;
        if (row.status === 'available') available = count;
        else if (row.status === 'in_process') inProcess = count;
        else if (row.status === 'adopted') adopted = count;
      }

      const total = available + inProcess + adopted;
      const adoptionRate = total > 0 ? Number(((adopted / total) * 100).toFixed(2)) : 0;

      return {
        total,
        available,
        inProcess,
        adopted,
        adoptionRate,
      };
    } catch (error) {
      this.logger.error(`Error querying pet distribution metrics: ${error.message}`);
      return { total: 0, available: 0, inProcess: 0, adopted: 0, adoptionRate: 0 };
    }
  }

  private async getAdoptionRequestMetrics(): Promise<AdoptionRequestMetrics> {
    try {
      const rows: { status: string; count: string }[] = await this.dataSource.query(`
        SELECT status, COUNT(*)::text as count
        FROM adoption_requests
        GROUP BY status
      `);

      let submitted = 0;
      let inReview = 0;
      let approved = 0;
      let rejected = 0;
      let cancelled = 0;

      for (const row of rows) {
        const count = parseInt(row.count, 10) || 0;
        if (row.status === 'submitted') submitted = count;
        else if (row.status === 'in_review') inReview = count;
        else if (row.status === 'approved') approved = count;
        else if (row.status === 'rejected') rejected = count;
        else if (row.status === 'cancelled') cancelled = count;
      }

      const total = submitted + inReview + approved + rejected + cancelled;
      const resolved = approved + rejected;
      const approvalRate = resolved > 0 ? Number(((approved / resolved) * 100).toFixed(2)) : 0;

      return {
        total,
        submitted,
        inReview,
        approved,
        rejected,
        cancelled,
        approvalRate,
      };
    } catch (error) {
      this.logger.error(`Error querying adoption requests metrics: ${error.message}`);
      return {
        total: 0,
        submitted: 0,
        inReview: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        approvalRate: 0,
      };
    }
  }

  private async getShelterSummaryMetrics(): Promise<ShelterSummaryMetrics> {
    try {
      const rows: { is_verified: boolean; count: string }[] = await this.dataSource.query(`
        SELECT is_verified, COUNT(*)::text as count
        FROM shelter_profiles
        GROUP BY is_verified
      `);

      let verified = 0;
      let unverified = 0;

      for (const row of rows) {
        const count = parseInt(row.count, 10) || 0;
        if (row.is_verified) verified = count;
        else unverified = count;
      }

      const total = verified + unverified;
      const verificationRate = total > 0 ? Number(((verified / total) * 100).toFixed(2)) : 0;

      return {
        total,
        verified,
        unverified,
        verificationRate,
      };
    } catch (error) {
      this.logger.error(`Error querying shelter summary metrics: ${error.message}`);
      return { total: 0, verified: 0, unverified: 0, verificationRate: 0 };
    }
  }

  private async getFollowUpSummaryMetrics(): Promise<FollowUpSummaryMetrics> {
    try {
      // Verificar si existe la tabla follow_up_records
      const tableCheck = await this.dataSource.query(`
        SELECT to_regclass('public.follow_up_records') as table_name
      `);

      if (!tableCheck[0]?.table_name) {
        return { active: 0, completed180d: 0, returnsCount: 0, returnRate: 0 };
      }

      const recordsRows: { status: string; count: string }[] = await this.dataSource.query(`
        SELECT status, COUNT(*)::text as count
        FROM follow_up_records
        GROUP BY status
      `);

      let active = 0;
      let completed180d = 0;
      let returnsCount = 0;

      for (const row of recordsRows) {
        const count = parseInt(row.count, 10) || 0;
        if (row.status === 'in_progress') active = count;
        else if (row.status === 'completed') completed180d = count;
        else if (row.status === 'returned') returnsCount = count;
      }

      const total = active + completed180d + returnsCount;
      const returnRate = total > 0 ? Number(((returnsCount / total) * 100).toFixed(2)) : 0;

      return {
        active,
        completed180d,
        returnsCount,
        returnRate,
      };
    } catch (error) {
      this.logger.warn(`Follow-up records not queried: ${error.message}`);
      return { active: 0, completed180d: 0, returnsCount: 0, returnRate: 0 };
    }
  }

  private async getMlInteractionMetrics(): Promise<MlInteractionMetrics> {
    try {
      const rows: { interaction_type: string; count: string }[] = await this.dataSource.query(`
        SELECT interaction_type, COUNT(*)::text as count
        FROM recommendation_interactions
        GROUP BY interaction_type
      `);

      let totalImpressions = 0;
      let totalClicks = 0;
      let totalApplies = 0;

      for (const row of rows) {
        const count = parseInt(row.count, 10) || 0;
        if (row.interaction_type === 'impression') totalImpressions = count;
        else if (row.interaction_type === 'click') totalClicks = count;
        else if (row.interaction_type === 'apply') totalApplies = count;
      }

      const ctr = totalImpressions > 0
        ? Number(((totalClicks / totalImpressions) * 100).toFixed(2))
        : 0;

      const conversionRate = totalImpressions > 0
        ? Number(((totalApplies / totalImpressions) * 100).toFixed(2))
        : 0;

      const clickToApplyRate = totalClicks > 0
        ? Number(((totalApplies / totalClicks) * 100).toFixed(2))
        : 0;

      return {
        totalImpressions,
        totalClicks,
        totalApplies,
        ctr,
        conversionRate,
        clickToApplyRate,
      };
    } catch (error) {
      this.logger.error(`Error querying ML interaction metrics: ${error.message}`);
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalApplies: 0,
        ctr: 0,
        conversionRate: 0,
        clickToApplyRate: 0,
      };
    }
  }

  private async getMlResilienceMetrics(): Promise<MlResilienceMetrics> {
    try {
      const rows: { is_fallback: boolean; count: string }[] = await this.dataSource.query(`
        SELECT is_fallback, COUNT(*)::text as count
        FROM recommendation_caches
        GROUP BY is_fallback
      `);

      let hybridCount = 0;
      let fallbackCount = 0;

      for (const row of rows) {
        const count = parseInt(row.count, 10) || 0;
        if (row.is_fallback) fallbackCount = count;
        else hybridCount = count;
      }

      const totalCached = hybridCount + fallbackCount;
      const hybridRatio = totalCached > 0
        ? Number(((hybridCount / totalCached) * 100).toFixed(2))
        : 0;
      const fallbackRatio = totalCached > 0
        ? Number(((fallbackCount / totalCached) * 100).toFixed(2))
        : 0;

      return {
        totalCached,
        hybridCount,
        fallbackCount,
        hybridRatio,
        fallbackRatio,
      };
    } catch (error) {
      this.logger.error(`Error querying ML resilience metrics: ${error.message}`);
      return {
        totalCached: 0,
        hybridCount: 0,
        fallbackCount: 0,
        hybridRatio: 0,
        fallbackRatio: 0,
      };
    }
  }
}
