import { Component, ElementRef, EventEmitter, Output, ViewChild, inject, signal } from '@angular/core';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

/**
 * Modal que prende la cámara y lee QR de productos (URL a `/producto/:id`)
 * para agregarlos a la venta sin buscarlos a mano.
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

  ngAfterViewInit(): void {
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private async start(): Promise<void> {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    try {
      const reader = new BrowserQRCodeReader();
      this.controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        video,
        (result) => {
          if (result) this.handleScan(result.getText());
        }
      );
    } catch {
      this.error.set('No se pudo acceder a la cámara. Revisá los permisos del navegador.');
    }
  }

  private handleScan(text: string): void {
    const id = text.split('/').filter(Boolean).pop();
    if (!id) return;
    const product = this.productService.availableProducts().find((p) => p.id === id);
    if (product) {
      this.error.set(null);
      this.scanned.emit(product);
    } else {
      this.error.set('El QR no corresponde a ningún producto disponible.');
    }
  }

  private stop(): void {
    this.controls?.stop();
    this.controls = undefined;
  }

  close(): void {
    this.stop();
    this.closed.emit();
  }
}
