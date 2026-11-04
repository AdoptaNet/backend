export interface PetDistributionMetrics {
  total: number;
  available: number;
  inProcess: number;
  adopted: number;
  adoptionRate: number; // Porcentaje de adoptadas respecto al total
}

export interface AdoptionRequestMetrics {
  total: number;
  submitted: number;
  inReview: number;
  approved: number;
  rejected: number;
  cancelled: number;
  approvalRate: number; // Porcentaje aprobadas respecto al total resuelto (aprobadas + rechazadas)
}

export interface FollowUpSummaryMetrics {
  active: number;
  completed180d: number;
  returnsCount: number;
  returnRate: number; // Porcentaje de retornos respecto a completadas/activas
}

export interface ShelterSummaryMetrics {
  total: number;
  verified: number;
  unverified: number;
  verificationRate: number;
}

export interface MlInteractionMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalApplies: number;
  ctr: number; // Click-Through Rate: (clicks / impressions) * 100
  conversionRate: number; // Conversion Rate: (applies / impressions) * 100
  clickToApplyRate: number; // (applies / clicks) * 100
}

export interface MlResilienceMetrics {
  totalCached: number;
  hybridCount: number;
  fallbackCount: number;
  hybridRatio: number; // Porcentaje de recomendaciones ML híbridas
  fallbackRatio: number; // Porcentaje de fallback heurístico
}

export interface AdminMetricsResponseDto {
  operational: {
    pets: PetDistributionMetrics;
    adoptions: AdoptionRequestMetrics;
    followUps: FollowUpSummaryMetrics;
    shelters: ShelterSummaryMetrics;
  };
  mlTelemetry: {
    interactions: MlInteractionMetrics;
    resilience: MlResilienceMetrics;
  };
  timestamp: string;
}
