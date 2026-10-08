import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/**
 * Tamaño de una etiqueta, en milímetros. `cols` × `rows` es lo que entra en una
 * hoja A4 con 10 mm de margen y `LABEL_GAP_MM` entre etiquetas (área útil 190 × 277).
 */
export interface LabelSize {
  id: string;
  name: string;
  w: number;
  h: number;
  cols: number;
  rows: number;
  /** Relleno interno de la etiqueta. */
  pad: number;
  /** Alto de la imagen (QR o código de barras); el ancho es `imgW` o, si falta, el que dé la proporción. */
  imgH: number;
  imgW?: number;
  /** Alto del logo y cuerpo del nombre. */
  logo: number;
  font: number;
  /** Renglones máximos del nombre antes de cortarlo. */
  nameLines: number;
}

export const LABEL_GAP_MM = 2;

const MAX_LABELS = 300;

/**
 * Plancha imprimible de etiquetas de un producto: logo del negocio, una imagen
 * (QR o código de barras) y el nombre. Se elige el tamaño y la cantidad y se
 * arma sola sobre hojas A4, lista para imprimir y recortar por la línea
 * punteada. La etiqueta no lleva precio: cambia seguido y obligaría a
 * reimprimir. La usan `admin-product-qr` y `admin-product-barcode`.
 */
@Component({
  selector: 'app-admin-label-sheet',
  imports: [FormsModule, RouterLink, CldImagePipe],
  templateUrl: './admin-label-sheet.component.html',
  styleUrl: './admin-label-sheet.component.css',
})
export class AdminLabelSheetComponent {
  private readonly settingsService = inject(SettingsService);

  /** Nombre del producto, tal cual va impreso. */
  readonly name = input.required<string>();
  /** Imagen de la etiqueta (data URL). null = todavía generándose. */
  readonly imageSrc = input.required<string | null>();
  readonly imageAlt = input('');
  readonly sizes = input.required<LabelSize[]>();
  /** Tamaño con el que arranca (id); si falta, el primero. */
  readonly initialSizeId = input<string>();

  readonly gap = LABEL_GAP_MM;
  readonly logoSrc = this.settingsService.logoSrc;

  private readonly sizeId = signal<string | null>(null);
  readonly size = computed(() => {
    const all = this.sizes();
    const wanted = this.sizeId() ?? this.initialSizeId();
    return all.find((s) => s.id === wanted) ?? all[0];
  });

  /** null = "una hoja llena" del tamaño elegido. */
  private readonly customQuantity = signal<number | null>(null);
  readonly perSheet = computed(() => this.size().cols * this.size().rows);
  readonly quantity = computed(() => this.customQuantity() ?? this.perSheet());
  readonly showLogo = signal(true);

  readonly sheets = computed(() => Math.ceil(this.quantity() / this.perSheet()));
  readonly labels = computed(() => Array.from({ length: this.quantity() }, (_, i) => i));
  readonly columns = computed(() => `repeat(${this.size().cols}, ${this.size().w}mm)`);

  constructor() {
    this.settingsService.ensureLoaded();
    // Si la cantidad escrita coincide con la hoja llena, vuelve a seguir al tamaño.
    effect(() => {
      if (this.customQuantity() === this.perSheet()) this.customQuantity.set(null);
    });
  }

  selectSize(next: LabelSize): void {
    this.sizeId.set(next.id);
  }

  setQuantity(value: number | string | null): void {
    const n = Math.floor(Number(value));
    this.customQuantity.set(Number.isFinite(n) ? Math.min(MAX_LABELS, Math.max(1, n)) : 1);
  }

  fillSheet(): void {
    this.customQuantity.set(null);
  }

  print(): void {
    window.print();
  }
}
