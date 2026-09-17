import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { Order, PAYMENT_LABELS } from '../../../core/models/order.model';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/**
 * Recibo imprimible de un pedido (sirve para ventas online y del local). El
 * botón "Imprimir" abre el diálogo del navegador; el CSS de `@media print`
 * deja sólo el recibo.
 */
@Component({
  selector: 'app-admin-receipt',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, CldImagePipe],
  templateUrl: './admin-receipt.component.html',
  styleUrl: './admin-receipt.component.css',
})
export class AdminReceiptComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);

  readonly order = (this.route.snapshot.data['order'] as Order | null) ?? null;
  readonly logoSrc = this.settingsService.logoSrc;
  readonly storeName = () => this.settingsService.settings().storeName;
  readonly storeAddress = () => this.settingsService.settings().storeAddress;
  readonly paymentLabels = PAYMENT_LABELS;

  lineTotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }

  /** "20250916" (tal cual lo manda ARCA) → "16/09/2025". */
  formatCaeDate(yyyymmdd: string | null | undefined): string {
    if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd ?? '';
    return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`;
  }

  print(): void {
    window.print();
  }
}
