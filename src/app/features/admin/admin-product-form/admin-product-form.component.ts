import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { SizeScaleService } from '../../../core/services/size-scale.service';
import { Product, ProductSize, margin } from '../../../core/models/product.model';
import { ProductParams } from '../../../core/models/param.model';
import { resizeImageFile, validateImageFile } from '../../../core/utils/image-resize';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { slugify } from '../../../core/utils/slugify';
import { youtubeId } from '../../../core/utils/youtube';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/** Precio de venta = costo + markup%. null si falta el costo o el %. */
function priceFromMarkup(cost: number, markupPercent: number): number | null {
  const m = Number(markupPercent) || 0;
  if (cost <= 0 || m <= 0) return null;
  return Math.round(cost * (1 + m / 100));
}

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, CldImagePipe],
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
  private readonly sizeScaleService = inject(SizeScaleService);
  private readonly cloudinary = inject(CloudinaryService);

  /** true si se puede subir fotos del disco (Cloudinary configurado en site-config.ts). */
  readonly canUploadFiles = this.cloudinary.configured;

  readonly paramGroups = this.paramService.groups;
  readonly suppliers = this.supplierService.suppliers;
  readonly sizeScales = this.sizeScaleService.scales;
  readonly saving = this.productService.saving;

  readonly editingId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.editingId;

  /** El producto a editar lo trae el `productResolver` (route data). */
  private readonly editingProduct: Product | undefined =
    (this.route.snapshot.data['product'] as Product | null) ?? undefined;

  readonly notFound = this.isEditMode && !this.editingProduct;

  /** Talles habilitados para este producto, cada uno con su stock (0 = sin stock por ahora) */
  readonly sizeStocks = signal<Map<ProductSize, number>>(
    new Map((this.editingProduct?.sizeStocks ?? []).map((s) => [s.size, s.stock]))
  );

  /** Parametrías elegidas: { [groupId]: optionId[] } */
  readonly selectedParams = signal<ProductParams>(
    structuredClone(this.editingProduct?.params ?? {})
  );

  /** Fotos del producto, en orden. La primera es la portada. */
  readonly images = signal<string[]>(
    this.editingProduct?.images?.length
      ? [...this.editingProduct.images]
      : this.editingProduct?.imageUrl
        ? [this.editingProduct.imageUrl]
        : []
  );
  /** URL suelta que se está por agregar a mano */
  readonly newImageUrl = signal('');
  readonly uploadingImage = signal(false);
  readonly imageError = signal<string | null>(null);

  readonly totalStockPreview = computed(() =>
    Array.from(this.sizeStocks().values()).reduce((sum, n) => sum + n, 0)
  );

  readonly form = this.fb.nonNullable.group({
    name: [this.editingProduct?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.editingProduct?.description ?? '', [Validators.required, Validators.minLength(5)]],
    price: [this.editingProduct?.price ?? 0, [Validators.required, Validators.min(1)]],
    ageRange: [this.editingProduct?.ageRange ?? '', Validators.required],
    videoUrl: [this.editingProduct?.videoUrl ?? ''],
    active: [this.editingProduct?.active ?? true],
    discontinued: [this.editingProduct?.discontinued ?? false],
    sizeScaleId: [this.editingProduct?.sizeScaleId ?? ''],
    supplierId: [this.editingProduct?.supplierId ?? ''],
    costPrice: [this.editingProduct?.costPrice ?? 0, [Validators.min(0)]],
    barcode: [this.editingProduct?.barcode ?? ''],
  });

  /** Umbral de stock bajo propio del producto (vacío = usar el default global). */
  readonly lowStockThreshold = signal<number | null>(this.editingProduct?.lowStockThreshold ?? null);

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Talles de la escala elegida (o [] si todavía no se eligió ninguna) */
  readonly scaleSizes = computed(() =>
    this.sizeScaleService.valuesFor(this.formValue().sizeScaleId || undefined)
  );

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

  constructor() {
    // el form usa parametrías, proveedores y escalas: asegurarse de que estén cargados
    this.paramService.ensureLoaded();
    this.sizeScaleService.ensureLoaded();
    this.supplierService.ensureLoaded();
  }

  readonly sizeScaleInvalid = computed(
    () => this.submitted() && !this.formValue().sizeScaleId
  );
  readonly sizesInvalid = computed(() => this.submitted() && this.sizeStocks().size === 0);
  readonly imagesInvalid = computed(() => this.submitted() && this.images().length === 0);

  /** Se cargó un link de video pero no lo reconocemos como YouTube. */
  readonly videoInvalid = computed(() => {
    const raw = (this.formValue().videoUrl ?? '').trim();
    return raw.length > 0 && !youtubeId(raw);
  });

  // --- Fotos ---

  /** Agrega la URL escrita a mano al final de la lista. */
  addImageUrl(): void {
    const url = this.newImageUrl().trim();
    if (!url) return;
    this.images.update((list) => [...list, url]);
    this.newImageUrl.set('');
    this.imageError.set(null);
  }

  /**
   * Sube archivos del disco a Cloudinary: se redimensionan en el navegador y se
   * suben con el nombre `<slug-del-producto>-<n>` (n = posición en la galería).
   * Se guarda la URL del CDN en `images[]`.
   */
  async onImageFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    if (!this.cloudinary.configured) {
      this.imageError.set(
        'La subida de fotos todavía no está configurada. Por ahora agregá la foto pegando su URL.'
      );
      input.value = '';
      return;
    }

    const invalid = files.map(validateImageFile).find((m) => m !== null);
    if (invalid) {
      this.imageError.set(invalid);
      input.value = '';
      return;
    }

    this.imageError.set(null);
    this.uploadingImage.set(true);
    const slug = slugify(this.form.controls.name.value);
    try {
      for (const file of files) {
        const resized = await resizeImageFile(file);
        const position = this.images().length + 1;
        const { secureUrl } = await this.cloudinary.upload(resized, {
          folder: 'estilos-pequenos/productos',
          publicId: `${slug}-${position}`,
        });
        this.images.update((list) => [...list, secureUrl]);
      }
    } catch (e) {
      this.imageError.set(
        e instanceof Error ? `No se pudo subir la foto: ${e.message}` : 'No se pudo subir la foto.'
      );
    } finally {
      this.uploadingImage.set(false);
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.images.update((list) => list.filter((_, i) => i !== index));
  }

  setLowStockThreshold(value: string): void {
    const n = Number(value);
    this.lowStockThreshold.set(value === '' || !Number.isFinite(n) || n < 0 ? null : Math.trunc(n));
  }

  moveImage(index: number, dir: -1 | 1): void {
    this.images.update((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  /** Al cambiar la escala de talle, se quedan sólo los talles que existen en la nueva */
  onSizeScaleChange(event: Event): void {
    const newId = (event.target as HTMLSelectElement).value;
    const allowed = new Set(this.sizeScaleService.valuesFor(newId || undefined));
    this.sizeStocks.update((current) => {
      const next = new Map<string, number>();
      for (const [size, stock] of current) {
        if (allowed.has(size)) next.set(size, stock);
      }
      return next;
    });
  }

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

  /** Sólo tiene sentido con el producto ya guardado (necesita su id). No pisa un código ya cargado. */
  readonly generatingBarcode = signal(false);
  generateBarcode(): void {
    if (!this.editingId || this.generatingBarcode()) return;
    this.generatingBarcode.set(true);
    this.productService.generateBarcode(this.editingId, (p) => {
      this.generatingBarcode.set(false);
      this.form.controls.barcode.setValue(p.barcode ?? '');
    });
  }

  save(): void {
    this.submitted.set(true);
    if (
      this.form.invalid ||
      !this.form.controls.sizeScaleId.value ||
      this.sizeStocks().size === 0 ||
      this.images().length === 0 ||
      this.missingRequiredParams().length > 0 ||
      this.videoInvalid()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const input = {
      ...value,
      videoUrl: value.videoUrl.trim() || undefined,
      sizeScaleId: value.sizeScaleId || undefined,
      supplierId: value.supplierId || undefined,
      costPrice: value.costPrice > 0 ? value.costPrice : undefined,
      lowStockThreshold: this.lowStockThreshold() ?? undefined,
      barcode: value.barcode.trim() || undefined,
      images: this.images(),
      params: this.selectedParams(),
      sizeStocks: Array.from(this.sizeStocks(), ([size, stock]) => ({ size, stock })),
    };

    const done = () => this.router.navigate(['/admin/productos']);
    if (this.isEditMode && this.editingId) {
      this.productService.update(this.editingId, input, done);
    } else {
      this.productService.create(input, done);
    }
  }
}
