import { Component, ElementRef, EventEmitter, Output, ViewChild, inject, signal } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

/** Qué lee la cámara: el QR de la etiqueta del estante y los códigos de barras de las prendas. */
const FORMATS = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
];

/**
 * Modal que prende la cámara y lee el QR de un producto (URL a `/producto/:id`)
 * o su código de barras, para agregarlo a la venta sin buscarlo a mano.
 */
@Component({
  selector: 'app-admin-pos-scanner',
  imports: [],
  templateUrl: './admin-pos-scanner.component.html',
})
export class AdminPosScannerComponent {
  private readonly productService = inject(ProductService);

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;
  @Output() scanned = new EventEmitter<Product>();
  @Output() closed = new EventEmitter<void>();

  readonly error = signal<string | null>(null);
  private controls?: IScannerControls;
  /** Último texto leído: la cámara devuelve el mismo código en cada cuadro. */
  private lastText = '';
  private done = false;

  ngAfterViewInit(): void {
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private async start(): Promise<void> {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Este navegador no deja usar la cámara desde acá. Abrí el panel con https en Chrome o Safari.');
      return;
    }
    try {
      const hints = new Map<DecodeHintType, unknown>([
        [DecodeHintType.POSSIBLE_FORMATS, FORMATS],
        [DecodeHintType.TRY_HARDER, true],
      ]);
      const reader = new BrowserMultiFormatReader(hints);
      // Resolución alta: un código de barras tiene líneas finas y a 640px no se lee.
      this.controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } },
        video,
        (result) => {
          if (result) this.handleScan(result.getText());
        }
      );
      // Si cerraron el modal mientras se pedía el permiso, apagar la cámara igual.
      if (this.done) this.stop();
    } catch (e) {
      this.error.set(cameraErrorMessage(e));
    }
  }

  private handleScan(raw: string): void {
    const text = raw.trim();
    if (this.done || !text || text === this.lastText) return;
    this.lastText = text;

    const available = this.productService.availableProducts();
    const productId = idFromProductUrl(text);

    if (productId) {
      const product = available.find((p) => p.id === productId);
      if (product) this.emit(product);
      else this.error.set('Ese producto no está disponible para vender (sin stock, pausado o borrado).');
      return;
    }

    // No es un QR de la tienda: se toma como código de barras.
    const local = available.find((p) => p.barcode?.toLowerCase() === text.toLowerCase());
    if (local) {
      this.emit(local);
      return;
    }
    this.productService.findByBarcode(text).subscribe({
      next: (found) => {
        const product = this.productService.availableProducts().find((p) => p.id === found.id);
        if (product) this.emit(product);
        else this.error.set(`"${found.name}" no está disponible para vender (sin stock o pausado).`);
      },
      error: () => this.error.set(`No hay ningún producto con el código ${text}.`),
    });
  }

  private emit(product: Product): void {
    if (this.done) return;
    this.done = true;
    this.error.set(null);
    this.stop();
    this.scanned.emit(product);
  }

  private stop(): void {
    this.controls?.stop();
    this.controls = undefined;
  }

  close(): void {
    this.done = true;
    this.stop();
    this.closed.emit();
  }
}

/** `https://tienda/producto/<id>` → `<id>`; null si el texto no es un link a un producto. */
function idFromProductUrl(text: string): string | null {
  const match = /\/producto\/([^/?#\s]+)/.exec(text);
  return match ? decodeURIComponent(match[1]) : null;
}

function cameraErrorMessage(e: unknown): string {
  const name = e instanceof DOMException || e instanceof Error ? e.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'El navegador bloqueó la cámara. Tocá el candado de la barra de direcciones, permití la cámara y volvé a abrir el escáner.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No se encontró ninguna cámara en este dispositivo.';
    case 'NotReadableError':
    case 'AbortError':
      return 'La cámara está siendo usada por otra aplicación. Cerrala y volvé a intentar.';
    default:
      return 'No se pudo prender la cámara. Revisá los permisos del navegador.';
  }
}
