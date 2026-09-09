import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExchangeService } from '../../../core/services/exchange.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-admin-exchanges',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-exchanges.component.html',
})
export class AdminExchangesComponent {
  private readonly svc = inject(ExchangeService);
  private readonly exporter = inject(ExportService);

  exportCsv(): void {
    this.exporter.download('/admin/export/exchanges.csv', 'cambios.csv');
  }

  readonly exchanges = this.svc.exchanges;
  readonly loading = this.svc.loading;
  readonly error = this.svc.error;
  readonly reload = () => this.svc.load();

  constructor() {
    this.svc.load();
  }
}
