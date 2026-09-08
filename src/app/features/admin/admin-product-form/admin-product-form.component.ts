import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { Product, ProductSize, margin } from '../../../core/models/product.model';
import { ProductParams } from '../../../core/models/param.model';

const ALL_SIZES: ProductSize[] = [
  'RN', '0-3M', '3-6M', '6-12M', '1', '2', '3', '4', '6', '8', '10', '12', '14', '16',
];

/** Precio de venta = costo + markup%. null si falta el costo o el %. */
function priceFromMarkup(cost: number, markupPercent: number): number | null {
  const m = Number(markupPercent) || 0;
  if (cost <= 0 || m <= 0) return null;
  return Math.round(cost * (1 + m / 100));
}

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.css',
})
export class AdminProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly supplierService = inject(SupplierService);

  readonly allSizes = ALL_SIZES;
  readonly paramGroups = this.paramService.groups;
  readonly suppliers = this.supplierService.suppliers;

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

  /** Parametrías elegidas: { [groupId]: optionId[] } */
  readonly selectedParams = signal<ProductParams>(
    structuredClone(this.editingProduct?.params ?? {})
  );

  readonly totalStockPreview = computed(() =>
    Array.from(this.sizeStocks().values()).reduce((sum, n) => sum + n, 0)
  );

  readonly form = this.fb.nonNullable.group({
    name: [this.editingProduct?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.editingProduct?.description ?? '', [Validators.required, Validators.minLength(5)]],
    price: [this.editingProduct?.price ?? 0, [Validators.required, Validators.min(1)]],
    ageRange: [this.editingProduct?.ageRange ?? '', Validators.required],
    imageUrl: [this.editingProduct?.imageUrl ?? '', [Validators.required]],
    active: [this.editingProduct?.active ?? true],
    supplierId: [this.editingProduct?.supplierId ?? ''],
    costPrice: [this.editingProduct?.costPrice ?? 0, [Validators.min(0)]],
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Ganancia estimada según lo cargado en el form (precio de venta − costo) */
  readonly marginPreview = computed(() => {
    const v = this.formValue();
    return margin({ price: Number(v.price) || 0, costPrice: Number(v.costPrice) || 0 });
  });

  /**
   * % de ganancia que se le quiere poner sobre el costo. NO se guarda en el
   * producto: es solo una calculadora — al cargarlo, escribe el precio de venta.
   */
  readonly markupPercent = signal<number>(this.initialMarkup());

  /** Precio de venta que saldría de aplicar el % de ganancia al costo actual */
  readonly suggestedPrice = computed(() =>
    priceFromMarkup(Number(this.formValue().costPrice) || 0, this.markupPercent())
  );

  private initialMarkup(): number {
    const cost = this.editingProduct?.costPrice ?? 0;
    const price = this.editingProduct?.price ?? 0;
    if (cost > 0 && price > 0) return Math.round(((price - cost) / cost) * 100);
    return 0;
  }

  /** Escribe el precio de venta a partir del % de ganancia y el costo dado */
  private applyMarkup(cost: number): void {
    const price = priceFromMarkup(cost, this.markupPercent());
    if (price !== null) {
      this.form.controls.price.setValue(price);
      this.form.controls.price.markAsDirty();
    }
  }

  onMarkupChange(value: number): void {
    this.markupPercent.set(Math.max(0, Number(value) || 0));
    this.applyMarkup(Number(this.form.controls.costPrice.value) || 0);
  }

  /** Al cambiar el costo, si ya hay un % de ganancia cargado, recalcula el precio */
  onCostPriceInput(event: Event): void {
    if (this.markupPercent() > 0) {
      this.applyMarkup(Number((event.target as HTMLInputElement).value) || 0);
    }
  }

  readonly submitted = signal(false);

  readonly sizesInvalid = computed(() => this.submitted() && this.sizeStocks().size === 0);

  /** Los grupos "de sistema" (ej: Público) son obligatorios */
  readonly missingRequiredParams = computed(() =>
    this.paramGroups().filter(
      (g) => g.system && (this.selectedParams()[g.id] ?? []).length === 0
    )
  );
  readonly paramsInvalid = computed(
    () => this.submitted() && this.missingRequiredParams().length > 0
  );

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

  // --- Parametrías ---

  isOptionSelected(groupId: string, optionId: string): boolean {
    return (this.selectedParams()[groupId] ?? []).includes(optionId);
  }

  /** Grupo de una sola opción (select): setea o limpia */
  setSingleParam(groupId: string, optionId: string): void {
    this.selectedParams.update((current) => {
      const next = { ...current };
      if (optionId) next[groupId] = [optionId];
      else delete next[groupId];
      return next;
    });
  }

  /** Grupo multi-opción (checkboxes): agrega/saca */
  toggleParamOption(groupId: string, optionId: string): void {
    this.selectedParams.update((current) => {
      const next = { ...current };
      const list = new Set(next[groupId] ?? []);
      if (list.has(optionId)) list.delete(optionId);
      else list.add(optionId);
      if (list.size) next[groupId] = Array.from(list);
      else delete next[groupId];
      return next;
    });
  }

  singleValue(groupId: string): string {
    return (this.selectedParams()[groupId] ?? [])[0] ?? '';
  }

  absMargin(amount: number): string {
    return Math.abs(amount).toLocaleString('es-AR');
  }

  save(): void {
    this.submitted.set(true);
    if (
      this.form.invalid ||
      this.sizeStocks().size === 0 ||
      this.missingRequiredParams().length > 0
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const input = {
      ...value,
      supplierId: value.supplierId || undefined,
      costPrice: value.costPrice > 0 ? value.costPrice : undefined,
      params: this.selectedParams(),
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
