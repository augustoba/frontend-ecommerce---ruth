import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ExportService } from '../../../core/services/export.service';
import { Product, margin, totalStock } from '../../../core/models/product.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-products',
  imports: [CurrencyPipe, FormsModule, RouterLink, SkeletonComponent, PaginationComponent, CldImagePipe],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly supplierService = inject(SupplierService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly confirm = inject(ConfirmService);
  private readonly exporter = inject(ExportService);

  exportCsv(): void {
    this.exporter.download('/admin/export/products.csv', 'productos.csv');
  }

  /** true si el usuario puede crear/editar/archivar productos. */
  readonly canManage = () => this.auth.has('PRODUCTS_MANAGE');

  /** id del producto que se está duplicando (para deshabilitar el botón). */
  readonly duplicatingId = signal<string | null>(null);

  readonly products = this.productService.products;
  readonly status = this.productService.adminStatus;
  readonly saving = this.productService.saving;
  readonly reload = () => this.productService.reloadAdmin();
  readonly page = this.productService.adminPage;
  readonly totalPages = this.productService.adminTotalPages;
  readonly totalElements = this.productService.adminTotalElements;
  readonly goToPage = (n: number) => this.productService.loadAdminPage(n);

  readonly paramGroups = this.paramService.groups;
  readonly suppliers = this.supplierService.suppliers;

  // --- filtros ---
  readonly search = signal('');
  readonly supplierFilter = signal('');
  /** 'grupoId:opcionId' de una parametría, o '' */
  readonly paramFilter = signal('');
  readonly statusFilter = signal<'' | 'true' | 'false'>('');
  readonly noStock = signal(false);

  readonly hasFilters = computed(
    () =>
      !!this.search() ||
      !!this.supplierFilter() ||
      !!this.paramFilter() ||
      !!this.statusFilter() ||
      this.noStock()
  );

  // --- archivados ---
  readonly showArchived = signal(false);
  readonly archived = signal<Product[]>([]);
  readonly archivedLoading = signal(false);

  // --- ajuste masivo de precio ---
  readonly selected = signal<Set<string>>(new Set());
  readonly bulkPercent = signal<number | null>(null);
  readonly bulkSaving = signal(false);

  readonly allOnPageSelected = computed(() => {
    const list = this.products();
    return list.length > 0 && list.every((p) => this.selected().has(p.id));
  });

  toggleSelect(id: string): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleSelectAllOnPage(): void {
    const list = this.products();
    if (this.allOnPageSelected()) {
      this.selected.update((set) => {
        const next = new Set(set);
        for (const p of list) next.delete(p.id);
        return next;
      });
    } else {
      this.selected.update((set) => new Set([...set, ...list.map((p) => p.id)]));
    }
  }

  clearSelection(): void {
    this.selected.set(new Set());
  }

  /** Aplica el % a los seleccionados, o a TODOS los productos no archivados si no hay ninguno tildado. */
  async applyBulkPrice(): Promise<void> {
    const percent = this.bulkPercent();
    if (percent === null || percent === 0 || this.bulkSaving()) return;
    const ids = [...this.selected()];
    const direction = percent > 0 ? 'subir' : 'bajar';
    const target = ids.length ? `${ids.length} producto(s) seleccionado(s)` : 'TODOS los productos no archivados';
    const ok = await this.confirm.confirm({
      title: 'Ajuste masivo de precio',
      message: `Vas a ${direction} el precio ${Math.abs(percent)}% en ${target}. Sólo cambia el precio de venta, nunca el costo.`,
      confirmLabel: 'Aplicar',
      danger: !ids.length,
    });
    if (!ok) return;
    this.bulkSaving.set(true);
    this.productService.bulkAdjustPrice(percent, ids.length ? ids : undefined).subscribe({
      next: (res) => {
        this.bulkSaving.set(false);
        this.bulkPercent.set(null);
        this.clearSelection();
        this.toast.success(`Precio ajustado en ${res.updated} producto(s).`);
      },
      error: () => {
        this.bulkSaving.set(false);
        this.toast.error('No se pudo ajustar el precio.');
      },
    });
  }

  constructor() {
    this.productService.ensureAdminLoaded();
    this.paramService.ensureLoaded();
    this.supplierService.ensureLoaded();
  }

  applyFilters(): void {
    const [groupId, optionId] = this.paramFilter().split(':');
    this.productService.setAdminQuery({
      search: this.search().trim(),
      supplierId: this.supplierFilter(),
      active: this.statusFilter(),
      groupId: groupId || '',
      optionId: optionId || '',
      noStock: this.noStock() ? 'true' : '',
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.supplierFilter.set('');
    this.paramFilter.set('');
    this.statusFilter.set('');
    this.noStock.set(false);
    this.applyFilters();
  }

  toggleArchived(): void {
    this.showArchived.update((v) => !v);
    if (this.showArchived() && !this.archived().length) this.loadArchived();
  }

  private loadArchived(): void {
    this.archivedLoading.set(true);
    this.productService.fetchArchived().subscribe({
      next: (list) => {
        this.archived.set(list);
        this.archivedLoading.set(false);
      },
      error: () => this.archivedLoading.set(false),
    });
  }

  restore(id: string): void {
    this.productService.restore(id, () => {
      this.toast.success('Producto restaurado (quedó oculto — republicalo cuando quieras).');
      this.archived.update((list) => list.filter((p) => p.id !== id));
    });
  }

  stockTotal(product: Product): number {
    return totalStock(product);
  }

  supplierName(product: Product): string {
    return this.supplierService.nameFor(product.supplierId);
  }

  marginOf(product: Product) {
    return margin(product);
  }

  /** Etiquetas de todas las parametrías del producto, ej: "Bebé · Body · Verano" */
  paramLabels(product: Product): string {
    const labels: string[] = [];
    for (const group of this.paramService.groups()) {
      for (const optId of product.params?.[group.id] ?? []) {
        const label = this.paramService.labelFor(group.id, optId);
        if (label) labels.push(label);
      }
    }
    return labels.join(' · ');
  }

  toggleActive(id: string): void {
    this.productService.toggleActive(id);
  }

  duplicate(id: string): void {
    if (this.duplicatingId()) return;
    this.duplicatingId.set(id);
    this.productService.duplicate(id).subscribe({
      next: (created) => {
        this.duplicatingId.set(null);
        this.toast.success('Producto duplicado. Editá la copia y cargale el stock.');
        this.router.navigate(['/admin/productos', created.id, 'editar']);
      },
      error: () => {
        this.duplicatingId.set(null);
        this.toast.error('No se pudo duplicar el producto.');
      },
    });
  }

  async remove(id: string, name: string): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Archivar producto',
      message: `¿Archivar "${name}"? Sale del catálogo y de los listados, pero se puede restaurar desde "Productos archivados".`,
      confirmLabel: 'Archivar',
    });
    if (ok) this.productService.delete(id);
  }

  /** Sólo sobre un producto ya archivado — borra la fila y, si se puede, sus fotos de Cloudinary. No se puede deshacer. */
  async permanentlyDelete(id: string, name: string): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Eliminar definitivamente',
      message: `¿Eliminar "${name}" para siempre? Esto NO se puede deshacer (a diferencia de archivar).`,
      confirmLabel: 'Eliminar para siempre',
      danger: true,
    });
    if (!ok) return;
    this.productService.permanentlyDelete(id, () => {
      this.archived.update((list) => list.filter((p) => p.id !== id));
      this.toast.success(`"${name}" se eliminó definitivamente.`);
    });
  }
}
