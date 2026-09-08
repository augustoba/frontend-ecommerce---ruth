import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ParamService } from '../../../core/services/param.service';
import { ProductSize, stockForSize, totalStock } from '../../../core/models/product.model';
import { QuantityStepperComponent } from '../../../shared/components/quantity-stepper/quantity-stepper.component';

@Component({
  selector: 'app-product-detail-page',
  imports: [CurrencyPipe, RouterLink, QuantityStepperComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.css',
})
export class ProductDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly paramService = inject(ParamService);

  /** Se actualiza cada vez que cambia el :id de la ruta (navegación entre fichas) */
  private readonly routeParamMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly catalogStatus = this.productService.catalogStatus;
  readonly reloadCatalog = () => this.productService.reloadCatalog();

  readonly product = computed(() => {
    const id = this.routeParamMap().get('id') ?? '';
    return this.productService.getById(id);
  });

  readonly selectedSize = signal<ProductSize | null>(null);
  readonly quantity = signal(1);
  readonly justAdded = signal(false);

  /** Galería de fotos */
  readonly selectedImageIndex = signal(0);
  readonly images = computed(() => this.product()?.images ?? []);
  readonly mainImage = computed(
    () => this.images()[this.selectedImageIndex()] ?? this.product()?.imageUrl ?? ''
  );

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  readonly categoryLabel = computed(() => {
    const p = this.product();
    const opt = p ? (p.params?.['grp-publico'] ?? [])[0] : undefined;
    return opt ? this.paramService.labelFor('grp-publico', opt) : '';
  });

  /** Chips de tipo de prenda / estación / etc. (todos los grupos menos "Público") */
  readonly paramChips = computed(() => {
    const p = this.product();
    if (!p) return [] as string[];
    const chips: string[] = [];
    for (const group of this.paramService.groups()) {
      if (group.id === 'grp-publico') continue;
      for (const optId of p.params?.[group.id] ?? []) {
        const label = this.paramService.labelFor(group.id, optId);
        if (label) chips.push(label);
      }
    }
    return chips;
  });

  readonly outOfStock = computed(() => {
    const p = this.product();
    return !p || totalStock(p) <= 0;
  });

  /** Stock disponible para el talle actualmente seleccionado */
  readonly stockForSelectedSize = computed(() => {
    const p = this.product();
    const size = this.selectedSize();
    if (!p || !size) return 0;
    return stockForSize(p, size);
  });

  constructor() {
    // Si cambia el producto (navegación entre fichas), reseteamos la selección
    this.route.paramMap.subscribe(() => {
      this.selectedSize.set(null);
      this.quantity.set(1);
      this.justAdded.set(false);
      this.selectedImageIndex.set(0);
    });
  }

  stockOf(size: ProductSize): number {
    const p = this.product();
    return p ? stockForSize(p, size) : 0;
  }

  selectSize(size: ProductSize): void {
    if (this.stockOf(size) <= 0) return;
    this.selectedSize.set(size);
    // Si la cantidad elegida ya no entra en el stock del nuevo talle, la ajustamos
    this.quantity.set(Math.min(this.quantity(), this.stockOf(size)));
    this.justAdded.set(false);
  }

  addToCart(): void {
    const product = this.product();
    const size = this.selectedSize();
    if (!product || !size || this.stockForSelectedSize() <= 0) return;

    this.cartService.add(product, size, this.quantity());
    this.justAdded.set(true);
  }

  goToCart(): void {
    this.router.navigate(['/carrito']);
  }
}
