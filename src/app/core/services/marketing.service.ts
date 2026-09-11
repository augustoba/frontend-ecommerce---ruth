import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { CollectionStore, LoadStatus } from '../state/collection-store';
import {
  MarketingConfig,
  MarketingSend,
  PreviewResult,
  RunResult,
} from '../models/marketing.model';

const DEFAULTS: MarketingConfig = {
  enabled: false,
  discountPercent: 10,
  inactivityDays: 45,
  spendThreshold: 200000,
  dailyEmailCap: 250,
  couponValidityDays: 30,
  cooldownDays: 30,
  emailSubject: null,
  emailBody: null,
  emailImageUrl: null,
};

/**
 * Campañas automáticas de cupón por email: config (una sola fila, igual que
 * `SettingsService`) + historial de envíos (paginado, igual que `CouponService`).
 */
@Injectable({ providedIn: 'root' })
export class MarketingService {
  private readonly http = inject(HttpClient);

  // --- config (singleton) ---
  private readonly configSignal = signal<MarketingConfig>(DEFAULTS);
  private readonly configStatusSignal = signal<LoadStatus>('idle');
  readonly config = this.configSignal.asReadonly();
  readonly configStatus = this.configStatusSignal.asReadonly();
  readonly savingConfig = signal(false);

  ensureConfigLoaded(): void {
    if (this.configStatusSignal() === 'idle' || this.configStatusSignal() === 'error') {
      this.loadConfig();
    }
  }

  private loadConfig(): void {
    this.configStatusSignal.set('loading');
    this.http.get<MarketingConfig>(apiUrl('/admin/marketing/config')).subscribe({
      next: (c) => {
        this.configSignal.set(c);
        this.configStatusSignal.set('loaded');
      },
      error: () => this.configStatusSignal.set('error'),
    });
  }

  updateConfig(input: MarketingConfig, onSuccess?: () => void): void {
    this.savingConfig.set(true);
    this.http.put<MarketingConfig>(apiUrl('/admin/marketing/config'), input).subscribe({
      next: (c) => {
        this.configSignal.set(c);
        this.savingConfig.set(false);
        onSuccess?.();
      },
      error: () => this.savingConfig.set(false),
    });
  }

  // --- historial de envíos (paginado) ---
  private readonly historyStore = new CollectionStore<MarketingSend>(
    this.http,
    '/admin/marketing/history',
    (raw) => raw as MarketingSend[],
    20
  );

  readonly history = this.historyStore.items;
  readonly historyStatus = this.historyStore.status;
  readonly page = this.historyStore.page;
  readonly totalPages = this.historyStore.totalPages;
  readonly totalElements = this.historyStore.totalElements;
  readonly reloadHistory = this.historyStore.reload;

  ensureHistoryLoaded(): void {
    this.historyStore.ensureLoaded();
  }

  loadHistoryPage(n: number): void {
    this.historyStore.loadPage(n);
  }

  setHistoryFilters(f: { reason?: string; status?: string; from?: string; to?: string }): void {
    this.historyStore.setQuery({
      reason: f.reason || undefined,
      status: f.status || undefined,
      from: f.from || undefined,
      to: f.to || undefined,
    });
  }

  // --- vista previa / envío manual ---
  preview() {
    return this.http.get<PreviewResult>(apiUrl('/admin/marketing/preview'));
  }

  runNow() {
    return this.http.post<RunResult>(apiUrl('/admin/marketing/run-now'), {});
  }
}
