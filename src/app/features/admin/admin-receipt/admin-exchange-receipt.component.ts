import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ExchangeService } from '../../../core/services/exchange.service';
import { Exchange } from '../../../core/models/exchange.model';
import { PAYMENT_LABELS } from '../../../core/models/order.model';

/** Recibo imprimible de un cambio de prenda. */
@Component({
  selector: 'app-admin-exchange-receipt',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-exchange-receipt.component.html',
  styleUrl: './admin-receipt.component.css',
})
export class AdminExchangeReceiptComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly exchangeService = inject(ExchangeService);
  private readonly route = inject(ActivatedRoute);

  readonly logoSrc = this.settingsService.logoSrc;
  readonly storeName = () => this.settingsService.settings().storeName;
  readonly storeAddress = () => this.settingsService.settings().storeAddress;
  readonly paymentLabels = PAYMENT_LABELS;

  readonly exchange = signal<Exchange | null>(null);
  readonly notFound = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.exchangeService.fetchOne(id).subscribe({
      next: (e) => this.exchange.set(e),
      error: () => this.notFound.set(true),
    });
  }

  returned(e: Exchange) {
    return e.lines.filter((l) => l.kind === 'DEVUELTA');
  }
  taken(e: Exchange) {
    return e.lines.filter((l) => l.kind === 'LLEVADA');
  }

  print(): void {
    window.print();
  }
}
