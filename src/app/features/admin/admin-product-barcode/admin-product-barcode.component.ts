import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import JsBarcode from 'jsbarcode';
import { Product } from '../../../core/models/product.model';

/**
 * Etiqueta imprimible con el código de barras de un producto (ítem 11) — no
 * es un EAN real (no hay autoridad emisora), es el código interno generable
 * desde el form de producto (`ProductService.generateBarcode`). Mismo patrón
 * de impresión que `admin-product-qr`.
 */
@Component({
  selector: 'app-admin-product-barcode',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './admin-product-barcode.component.html',
  styleUrl: './admin-product-barcode.component.css',
})
export class AdminProductBarcodeComponent {
  private readonly route = inject(ActivatedRoute);

  readonly product = (this.route.snapshot.data['product'] as Product | null) ?? null;
  readonly barcodeDataUrl = signal<string | null>(null);

  constructor() {
    const code = this.product?.barcode;
    if (code) {
      const canvas = document.createElement('canvas');
      try {
        JsBarcode(canvas, code, { format: 'CODE128', width: 2, height: 70, displayValue: true, margin: 8 });
        this.barcodeDataUrl.set(canvas.toDataURL('image/png'));
      } catch {
        this.barcodeDataUrl.set(null);
      }
    }
  }

  print(): void {
    window.print();
  }
}
