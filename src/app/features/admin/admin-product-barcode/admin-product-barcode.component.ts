import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import JsBarcode from 'jsbarcode';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { AdminLabelSheetComponent, LabelSize } from '../admin-label-sheet/admin-label-sheet.component';

/** Apaisadas: un código de barras es más ancho que alto. */
const SIZES: LabelSize[] = [
  { id: 'chica', name: 'Chica', w: 50, h: 25, cols: 3, rows: 10, pad: 2, imgH: 11, logo: 4, font: 2.4, nameLines: 1 },
  { id: 'mediana', name: 'Mediana', w: 62, h: 32, cols: 3, rows: 8, pad: 2, imgH: 15, logo: 5, font: 2.8, nameLines: 1 },
  { id: 'grande', name: 'Grande', w: 90, h: 45, cols: 2, rows: 5, pad: 2, imgH: 22, logo: 8, font: 3.6, nameLines: 1 },
];

/**
 * Plancha de etiquetas con el código de barras de un producto — no es un EAN
 * real (no hay autoridad emisora), es el código interno generable desde el
 * form de producto o desde acá mismo (`ProductService.generateBarcode`).
 * Comparte el armado de la hoja con `admin-product-qr` (que sigue siendo la
 * opción de siempre, no se reemplaza — un producto puede tener QR, código de
 * barras, o ambos).
 */
@Component({
  selector: 'app-admin-product-barcode',
  imports: [RouterLink, AdminLabelSheetComponent],
  templateUrl: './admin-product-barcode.component.html',
})
export class AdminProductBarcodeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly auth = inject(AuthService);

  readonly product = signal((this.route.snapshot.data['product'] as Product | null) ?? null);
  readonly barcodeDataUrl = computed(() => renderBarcode(this.product()?.barcode));
  readonly sizes = SIZES;

  /** Generar el código toca el producto: hace falta el permiso de editar. */
  readonly canGenerate = () => this.auth.has('PRODUCTS_MANAGE');
  readonly generating = signal(false);

  /** La prenda no tiene código: se genera uno interno y la plancha aparece sola. */
  generate(): void {
    const id = this.product()?.id;
    if (!id || this.generating()) return;
    this.generating.set(true);
    this.productService.generateBarcode(id, (p) => {
      this.generating.set(false);
      this.product.set(p);
    });
  }
}

function renderBarcode(code: string | null | undefined): string | null {
  if (!code) return null;
  const canvas = document.createElement('canvas');
  try {
    // width 3: barras más gruesas en la imagen, para que al achicarla a la etiqueta sigan nítidas.
    JsBarcode(canvas, code, { format: 'CODE128', width: 3, height: 90, fontSize: 28, displayValue: true, margin: 12 });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}
