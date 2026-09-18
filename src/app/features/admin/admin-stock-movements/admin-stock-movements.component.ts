import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { StockMovementService } from '../../../core/services/stock-movement.service';
import { ToastService } from '../../../core/services/toast.service';
import { STOCK_MOVEMENT_REASON_LABELS } from '../../../core/models/stock-movement.model';
import { ProductSize } from '../../../core/models/product.model';

/** Historial de movimientos de stock + ajuste manual + registrar compra a proveedor. */
@Component({
  selector: 'app-admin-stock-movements',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-stock-movements.component.html',
})
export class AdminStockMovementsComponent {
  private readonly productService = inject(ProductService);
  private readonly supplierService = inject(SupplierService);
  private readonly movementService = inject(StockMovementService);
  private readonly toast = inject(ToastService);

  readonly reasonLabels = STOCK_MOVEMENT_REASON_LABELS;

  readonly products = this.productService.products;
  readonly suppliers = this.supplierService.suppliers;
  readonly movements = this.movementService.items;
  readonly status = this.movementService.status;

  constructor() {
    this.productService.ensureAdminLoaded();
    this.supplierService.ensureLoaded();
    this.reload();
  }

  // --- filtros del historial ---
  readonly filterProductId = signal('');
  readonly filterFrom = signal('');
  readonly filterTo = signal('');

  reload(): void {
    this.movementService.load({
      productId: this.filterProductId() || undefined,
      from: this.filterFrom() || undefined,
      to: this.filterTo() || undefined,
    });
  }

  clearFilters(): void {
    this.filterProductId.set('');
    this.filterFrom.set('');
    this.filterTo.set('');
    this.reload();
  }

  // --- ajuste manual ---
  readonly adjustProductId = signal('');
  readonly adjustSize = signal('');
  readonly adjustStock = signal<number | null>(null);
  readonly adjustNote = signal('');
  readonly adjustSaving = signal(false);

  readonly adjustSizes = computed<ProductSize[]>(() => {
    const p = this.products().find((x) => x.id === this.adjustProductId());
    return p ? p.sizeStocks.map((s) => s.size) : [];
  });

  submitAdjust(): void {
    const productId = this.adjustProductId();
    const size = this.adjustSize();
    const stock = this.adjustStock();
    if (!productId || !size || stock === null || stock < 0) {
      this.toast.error('Elegí producto, talle y un stock válido.');
      return;
    }
    this.adjustSaving.set(true);
    this.productService.setStock(productId, size, stock, this.adjustNote().trim() || undefined, () => {
      this.adjustSaving.set(false);
      this.toast.success('Stock ajustado.');
      this.adjustStock.set(null);
      this.adjustNote.set('');
      this.reload();
    });
  }

  // --- registrar compra a proveedor ---
  readonly purchaseProductId = signal('');
  readonly purchaseSize = signal('');
  readonly purchaseQty = signal<number | null>(null);
  readonly purchaseUnitCost = signal<number | null>(null);
  readonly purchaseSupplierId = signal('');
  readonly purchaseSaving = signal(false);

  readonly purchaseSizes = computed<ProductSize[]>(() => {
    const p = this.products().find((x) => x.id === this.purchaseProductId());
    return p ? p.sizeStocks.map((s) => s.size) : [];
  });

  submitPurchase(): void {
    const productId = this.purchaseProductId();
    const size = this.purchaseSize();
    const quantity = this.purchaseQty();
    const unitCost = this.purchaseUnitCost();
    if (!productId || !size || !quantity || quantity <= 0 || !unitCost || unitCost <= 0) {
      this.toast.error('Elegí producto, talle, cantidad y costo unitario válidos.');
      return;
    }
    this.purchaseSaving.set(true);
    this.productService.registerPurchase(
      productId,
      { size, quantity, unitCost, supplierId: this.purchaseSupplierId() || null },
      (product) => {
        this.purchaseSaving.set(false);
        this.toast.success(`Compra registrada. Costo promedio nuevo: $${product.costPrice ?? 0}.`);
        this.purchaseQty.set(null);
        this.purchaseUnitCost.set(null);
        this.reload();
      }
    );
  }
}
