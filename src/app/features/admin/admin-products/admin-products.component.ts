import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, margin, totalStock } from '../../../core/models/product.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-products',
  imports: [CurrencyPipe, RouterLink, SkeletonComponent, PaginationComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly supplierService = inject(SupplierService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

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

  constructor() {
    this.productService.ensureAdminLoaded();
    this.paramService.ensureLoaded();
    this.supplierService.ensureLoaded();
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

  remove(id: string, name: string): void {
    const confirmed = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
    if (confirmed) {
      this.productService.delete(id);
    }
  }
}
