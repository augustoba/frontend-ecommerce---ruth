import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketingService } from '../../../core/services/marketing.service';
import { ExportService } from '../../../core/services/export.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { MarketingConfig, MarketingReason, MarketingSendStatus, PreviewResult } from '../../../core/models/marketing.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * Panel de campañas automáticas de cupón por email: configuración (segmentos,
 * % de descuento, tope diario), vista previa de hoy, envío manual e historial.
 */
@Component({
  selector: 'app-admin-campaigns',
  imports: [CurrencyPipe, DatePipe, FormsModule, SkeletonComponent, PaginationComponent],
  templateUrl: './admin-campaigns.component.html',
})
export class AdminCampaignsComponent {
  private readonly marketingService = inject(MarketingService);
  private readonly exporter = inject(ExportService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  // --- config ---
  readonly configStatus = this.marketingService.configStatus;
  readonly savingConfig = this.marketingService.savingConfig;
  readonly draft = signal<MarketingConfig>({ ...this.marketingService.config() });
  private touched = false;

  readonly dirty = computed(
    () => JSON.stringify(this.draft()) !== JSON.stringify(this.marketingService.config())
  );

  constructor() {
    this.marketingService.ensureConfigLoaded();
    this.marketingService.ensureHistoryLoaded();
    effect(() => {
      const c = this.marketingService.config();
      if (!this.touched) this.draft.set({ ...c });
    });
  }

  patch<K extends keyof MarketingConfig>(key: K, value: MarketingConfig[K]): void {
    this.touched = true;
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  saveConfig(): void {
    if (this.savingConfig()) return;
    this.marketingService.updateConfig(this.draft(), () => {
      this.touched = false;
      this.toast.success('Configuración guardada.');
    });
  }

  // --- vista previa de hoy ---
  readonly previewing = signal(false);
  readonly previewResult = signal<PreviewResult | null>(null);

  runPreview(): void {
    if (this.previewing()) return;
    this.previewing.set(true);
    this.marketingService.preview().subscribe({
      next: (r) => {
        this.previewing.set(false);
        this.previewResult.set(r);
      },
      error: () => {
        this.previewing.set(false);
        this.toast.error('No se pudo calcular la vista previa.');
      },
    });
  }

  // --- envío manual ---
  readonly sending = signal(false);

  async sendNow(): Promise<void> {
    if (this.sending()) return;
    const ok = await this.confirm.confirm({
      title: 'Mandar campaña ahora',
      message: 'Esto manda mails de verdad a los clientes que califiquen hoy (respetando el tope diario). ¿Confirmás?',
      confirmLabel: 'Mandar',
    });
    if (!ok) return;
    this.sending.set(true);
    this.marketingService.runNow().subscribe({
      next: (r) => {
        this.sending.set(false);
        this.toast.success(`Enviados: ${r.sent}. Fallidos: ${r.failed}. Sin cupo: ${r.skippedCap}.`);
        this.previewResult.set(null);
        this.marketingService.reloadHistory();
      },
      error: () => {
        this.sending.set(false);
        this.toast.error('No se pudo ejecutar el envío.');
      },
    });
  }

  // --- historial ---
  readonly history = this.marketingService.history;
  readonly historyStatus = this.marketingService.historyStatus;
  readonly page = this.marketingService.page;
  readonly totalPages = this.marketingService.totalPages;
  readonly totalElements = this.marketingService.totalElements;
  readonly reloadHistory = () => this.marketingService.reloadHistory();
  readonly goToPage = (n: number) => this.marketingService.loadHistoryPage(n);

  readonly reasonFilter = signal<MarketingReason | ''>('');
  readonly statusFilter = signal<MarketingSendStatus | ''>('');
  readonly from = signal('');
  readonly to = signal('');

  readonly hasFilters = computed(
    () => !!this.reasonFilter() || !!this.statusFilter() || !!this.from() || !!this.to()
  );

  applyFilters(): void {
    this.marketingService.setHistoryFilters({
      reason: this.reasonFilter(),
      status: this.statusFilter(),
      from: this.from(),
      to: this.to(),
    });
  }

  clearFilters(): void {
    this.reasonFilter.set('');
    this.statusFilter.set('');
    this.from.set('');
    this.to.set('');
    this.applyFilters();
  }

  exportCsv(): void {
    this.exporter.download('/admin/export/marketing.csv', 'marketing.csv');
  }
}
