import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { PlatformMailSettings, PlatformMailSettingsInput } from '../models/platform-mail.model';

/** Credenciales del servicio de mail (SMTP), una sola fila. Sólo superadmin. */
@Injectable({ providedIn: 'root' })
export class PlatformMailService {
  private readonly http = inject(HttpClient);

  private readonly settingsSignal = signal<PlatformMailSettings | null>(null);
  private readonly statusSignal = signal<LoadStatus>('idle');
  readonly settings = this.settingsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly saving = signal(false);

  ensureLoaded(): void {
    if (this.statusSignal() === 'idle' || this.statusSignal() === 'error') this.load();
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.statusSignal.set('loading');
    this.http.get<PlatformMailSettings>(apiUrl('/admin/platform/mail')).subscribe({
      next: (s) => {
        this.settingsSignal.set(s);
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  update(input: PlatformMailSettingsInput, onSuccess?: () => void): void {
    this.saving.set(true);
    this.http.put<PlatformMailSettings>(apiUrl('/admin/platform/mail'), input).subscribe({
      next: (s) => {
        this.settingsSignal.set(s);
        this.saving.set(false);
        onSuccess?.();
      },
      error: () => this.saving.set(false),
    });
  }
}
