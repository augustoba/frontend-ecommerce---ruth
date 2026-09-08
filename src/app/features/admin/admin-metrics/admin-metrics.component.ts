import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MetricsService } from '../../../core/services/metrics.service';
import { ParamService } from '../../../core/services/param.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { monthLabel } from '../../../core/models/metrics.model';

type Preset = 'mes' | 'trimestre' | 'anio-actual' | 'anio' | 'custom';

/** YYYY-MM-DD de una fecha (hora local). */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-admin-metrics',
  imports: [FormsModule, CurrencyPipe, SkeletonComponent],
  templateUrl: './admin-metrics.component.html',
})
export class AdminMetricsComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly paramService = inject(ParamService);

  readonly status = this.metricsService.status;
  readonly metrics = this.metricsService.metrics;
  readonly monthLabel = monthLabel;

  /** Grupos de parametría para el selector del desglose. */
  readonly groups = this.paramService.groups;

  readonly preset = signal<Preset>('trimestre');
  readonly from = signal<string>('');
  readonly to = signal<string>('');
  readonly groupBy = signal<string>('grp-tipo');

  /** Escala de las barras de "ventas por mes". */
  readonly maxMonthRevenue = computed(() =>
    Math.max(1, ...(this.metrics()?.byMonth ?? []).map((m) => m.revenue))
  );
  readonly maxGroupUnits = computed(() =>
    Math.max(1, ...(this.metrics()?.byGroup.rows ?? []).map((r) => r.units))
  );

  readonly isEmpty = computed(() => this.status() === 'loaded' && (this.metrics()?.totals.units ?? 0) === 0);

  constructor() {
    this.paramService.ensureLoaded();
    this.applyPreset('trimestre', false);
    // primera carga
    this.load();

    // si el grupo elegido dejó de existir (poco probable), volver al default
    effect(() => {
      const gs = this.groups();
      if (gs.length && !gs.some((g) => g.id === this.groupBy())) {
        this.groupBy.set(gs[0].id);
      }
    });
  }

  applyPreset(p: Preset, reload = true): void {
    this.preset.set(p);
    const today = new Date();
    if (p === 'mes') {
      this.from.set(iso(new Date(today.getFullYear(), today.getMonth(), 1)));
      this.to.set(iso(today));
    } else if (p === 'trimestre') {
      this.from.set(iso(new Date(today.getFullYear(), today.getMonth() - 2, 1)));
      this.to.set(iso(today));
    } else if (p === 'anio-actual') {
      this.from.set(iso(new Date(today.getFullYear(), 0, 1)));
      this.to.set(iso(today));
    } else if (p === 'anio') {
      this.from.set(iso(new Date(today.getFullYear(), today.getMonth() - 11, 1)));
      this.to.set(iso(today));
    }
    if (reload) this.load();
  }

  onDateChange(): void {
    this.preset.set('custom');
  }

  onGroupChange(id: string): void {
    this.groupBy.set(id);
    this.load();
  }

  load(): void {
    const from = this.from();
    const to = this.to();
    if (!from || !to || from > to) return;
    this.metricsService.load({ from, to, groupBy: this.groupBy() });
  }

  reload(): void {
    this.metricsService.reload();
  }
}
