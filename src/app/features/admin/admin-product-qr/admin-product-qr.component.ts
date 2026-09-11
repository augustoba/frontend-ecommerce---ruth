import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { Product } from '../../../core/models/product.model';

/**
 * Etiqueta imprimible con el QR de un producto (para pegar en el estante).
 * El QR codifica la URL pública del producto; al escanearlo desde el POS se
 * agrega directo a la venta. Mismo patrón de impresión que `admin-receipt`.
 */
@Component({
  selector: 'app-admin-product-qr',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './admin-product-qr.component.html',
  styleUrl: './admin-product-qr.component.css',
})
export class AdminProductQrComponent {
  private readonly route = inject(ActivatedRoute);

  readonly product = (this.route.snapshot.data['product'] as Product | null) ?? null;
  readonly qrDataUrl = signal<string | null>(null);

  constructor() {
    if (this.product) {
      const url = `${window.location.origin}/producto/${this.product.id}`;
      QRCode.toDataURL(url, { width: 320, margin: 1 }).then((dataUrl) => this.qrDataUrl.set(dataUrl));
    }
  }

  print(): void {
    window.print();
  }
}
