export type MarketingReason = 'INACTIVE' | 'VIP';
export type MarketingSendStatus = 'SENT' | 'FAILED';

/** Config de las campañas automáticas de cupón por email (una sola fila, como SiteSettings). */
export interface MarketingConfig {
  enabled: boolean;
  discountPercent: number;
  inactivityDays: number;
  spendThreshold: number;
  dailyEmailCap: number;
  couponValidityDays: number;
  cooldownDays: number;
}

export interface CandidatePreview {
  email: string;
  reason: MarketingReason;
  lifetimeSpend: number;
  lastOrderAt: string | null;
}

export interface PreviewResult {
  totalQualifying: number;
  alreadySentToday: number;
  remainingCapToday: number;
  excludedByCooldown: number;
  willBeEmailedToday: number;
  sample: CandidatePreview[];
}

export interface RunResult {
  attempted: number;
  sent: number;
  failed: number;
  skippedCap: number;
}

export interface MarketingSend {
  id: string;
  email: string;
  reason: MarketingReason;
  couponCode?: string | null;
  sentAt: string;
  status: MarketingSendStatus;
  errorMessage?: string | null;
}
