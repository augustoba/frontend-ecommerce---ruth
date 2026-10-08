import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { Product } from '../../../core/models/product.model';
import { AdminLabelSheetComponent, LabelSize } from '../admin-label-sheet/admin-label-sheet.component';

const SIZES: LabelSize[] = [
  { id: 'chica', name: 'Chica', w: 35, h: 44, cols: 5, rows: 6, pad: 3, imgW: 22, imgH: 22, logo: 6, font: 2.4, nameLines: 2 },
  { id: 'mediana', name: 'Mediana', w: 50, h: 65, cols: 3, rows: 4, pad: 3, imgW: 35, imgH: 35, logo: 11, font: 3.2, nameLines: 2 },
  { id: 'grande', name: 'Grande', w: 70, h: 90, cols: 2, rows: 3, pad: 3, imgW: 54, imgH: 54, logo: 15, font: 4.4, nameLines: 2 },
];

/**
 * Plancha de etiquetas con el QR de un producto (para pegar en el estante o
 * colgar de la prenda). El QR codifica la URL pública del producto; al
 * escanearlo desde el POS se agrega directo a la venta. El armado de la hoja
 * (tamaño, cantidad, logo) es de `AdminLabelSheetComponent`.
 */
@Component({
  selector: 'app-admin-product-qr',
  imports: [RouterLink, AdminLabelSheetComponent],
  templateUrl: './admin-product-qr.component.html',
})
export class AdminProductQrComponent {
  private readonly route = inject(ActivatedRoute);

  readonly product = (this.route.snapshot.data['product'] as Product | null) ?? null;
  readonly qrDataUrl = signal<string | null>(null);
  readonly sizes = SIZES;

  constructor() {
    if (this.product) {
      const url = `${window.location.origin}/producto/${this.product.id}`;
      // 600 px: la misma imagen sirve para la etiqueta grande sin verse pixelada al imprimir.
      QRCode.toDataURL(url, { width: 600, margin: 1 }).then((dataUrl) => this.qrDataUrl.set(dataUrl));
    }
  }
}
