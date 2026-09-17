import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../config/site-config';

export interface StockAlertSettings {
  lowStockAlertEnabled: boolean;
  lowStockAlertEmail: string | null;
}

/** Alerta de stock bajo por mail (ítem 10) — `/api/admin/settings/stock-alerts`. */
@Injectable({ providedIn: 'root' })
export class StockAlertSettingsService {
  private readonly http = inject(HttpClient);

  private readonly dataSignal = signal<StockAlertSettings | null>(null);
  readonly data = this.dataSignal.asReadonly();
  readonly saving = signal(false);

  load(): void {
    this.http.get<StockAlertSettings>(apiUrl('/admin/settings/stock-alerts')).subscribe({
      next: (s) => this.dataSignal.set(s),
      error: () => {},
    });
  }

  save(input: StockAlertSettings, onSuccess?: () => void): void {
    this.saving.set(true);
    this.http.put<StockAlertSettings>(apiUrl('/admin/settings/stock-alerts'), input).subscribe({
      next: (s) => {
        this.dataSignal.set(s);
        this.saving.set(false);
        onSuccess?.();
      },
      error: () => this.saving.set(false),
    });
  }
}
