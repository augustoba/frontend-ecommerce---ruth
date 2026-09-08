import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ParamService } from '../../../core/services/param.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { Product, margin, totalStock } from '../../../core/models/product.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-products',
  imports: [CurrencyPipe, RouterLink, SkeletonComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly paramService = inject(ParamService);
  private readonly supplierService = inject(SupplierService);

  readonly products = this.productService.products;
  readonly status = this.productService.adminStatus;
  readonly saving = this.productService.saving;
  readonly reload = () => this.productService.reloadAdmin();

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

  remove(id: string, name: string): void {
    const confirmed = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
    if (confirmed) {
      this.productService.delete(id);
    }
  }
}
