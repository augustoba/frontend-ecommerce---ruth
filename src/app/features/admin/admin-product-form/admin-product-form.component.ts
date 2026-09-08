import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductCategory, ProductSize } from '../../../core/models/product.model';

const ALL_SIZES: ProductSize[] = [
  'RN', '0-3M', '3-6M', '6-12M', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16',
];

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.css',
})
export class AdminProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  readonly allSizes = ALL_SIZES;
  readonly categories = this.productService.categories;

  private readonly editingId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.editingId;

  private readonly editingProduct: Product | undefined = this.editingId
    ? this.productService.getById(this.editingId)
    : undefined;

  readonly notFound = this.isEditMode && !this.editingProduct;

  /** Talles habilitados para este producto, cada uno con su stock (0 = sin stock por ahora) */
  readonly sizeStocks = signal<Map<ProductSize, number>>(
    new Map((this.editingProduct?.sizeStocks ?? []).map((s) => [s.size, s.stock]))
  );

  readonly totalStockPreview = computed(() =>
    Array.from(this.sizeStocks().values()).reduce((sum, n) => sum + n, 0)
  );

  readonly form = this.fb.nonNullable.group({
    name: [this.editingProduct?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.editingProduct?.description ?? '', [Validators.required, Validators.minLength(5)]],
    price: [this.editingProduct?.price ?? 0, [Validators.required, Validators.min(1)]],
    category: [this.editingProduct?.category ?? ('unisex' as ProductCategory), Validators.required],
    ageRange: [this.editingProduct?.ageRange ?? '', Validators.required],
    imageUrl: [this.editingProduct?.imageUrl ?? '', [Validators.required]],
    active: [this.editingProduct?.active ?? true],
  });

  readonly submitted = signal(false);

  readonly sizesInvalid = computed(() => this.submitted() && this.sizeStocks().size === 0);

  isSizeEnabled(size: ProductSize): boolean {
    return this.sizeStocks().has(size);
  }

  stockOf(size: ProductSize): number {
    return this.sizeStocks().get(size) ?? 0;
  }

  toggleSize(size: ProductSize): void {
    this.sizeStocks.update((current) => {
      const next = new Map(current);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.set(size, 0);
      }
      return next;
    });
  }

  setStock(size: ProductSize, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const value = Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
    this.sizeStocks.update((current) => {
      const next = new Map(current);
      next.set(size, value);
      return next;
    });
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.sizeStocks().size === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const input = {
      ...value,
      sizeStocks: Array.from(this.sizeStocks(), ([size, stock]) => ({ size, stock })),
    };

    if (this.isEditMode && this.editingId) {
      this.productService.update(this.editingId, input);
    } else {
      this.productService.create(input);
    }

    this.router.navigate(['/admin/productos']);
  }
}
