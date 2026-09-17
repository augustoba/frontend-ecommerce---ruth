import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../../../core/services/balance.service';
import { MonthBalance } from '../../../core/models/balance.model';
import { monthShort } from '../../../core/models/metrics.model';
import { downloadCsv } from '../../../core/utils/csv';

function firstOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-admin-balance',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './admin-balance.component.html',
})
export class AdminBalanceComponent {
  private readonly balanceService = inject(BalanceService);

  readonly period = this.balanceService.period;
  readonly loading = this.balanceService.loading;
  readonly monthShort = monthShort;

  readonly from = signal(firstOfMonth());
  readonly to = signal(today());

  readonly currentYear = new Date().getFullYear();
  readonly thisYearSeries = signal<MonthBalance[]>([]);
  readonly lastYearSeries = signal<MonthBalance[]>([]);
  readonly comparisonLoading = signal(false);

  readonly maxAbsNetResult = computed(() => {
    const all = [...this.thisYearSeries(), ...this.lastYearSeries()];
    return Math.max(1, ...all.map((m) => Math.abs(m.netResult)));
  });

  constructor() {
    this.reloadPeriod();
    this.reloadComparison();
  }

  reloadPeriod(): void {
    this.balanceService.loadPeriod(this.from(), this.to());
  }

  reloadComparison(): void {
    this.comparisonLoading.set(true);
    this.balanceService.loadComparison(this.currentYear).subscribe({
      next: (list) => {
        this.thisYearSeries.set(list);
        this.comparisonLoading.set(false);
      },
      error: () => this.comparisonLoading.set(false),
    });
    this.balanceService.loadComparison(this.currentYear - 1).subscribe({
      next: (list) => this.lastYearSeries.set(list),
      error: () => {},
    });
  }

  barHeight(value: number): number {
    return (Math.abs(value) / this.maxAbsNetResult()) * 100;
  }

  exportCsv(): void {
    const p = this.period();
    if (!p) return;
    const rows: unknown[][] = [
      ['Balance', `${p.from} a ${p.to}`],
      [],
      ['Ventas', 'Costo', 'Ganancia bruta', 'Gastos', 'Resultado neto'],
      [p.revenue, p.cost, p.grossProfit, p.expenses, p.netResult],
      [],
      ['Mes', 'Ventas', 'Costo', 'Gastos', 'Resultado neto'],
    ];
    for (const m of this.thisYearSeries()) rows.push([m.month, m.revenue, m.cost, m.expenses, m.netResult]);
    downloadCsv(`balance-${p.from}_a_${p.to}.csv`, rows);
  }
}
