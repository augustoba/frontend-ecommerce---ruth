import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, totalStock } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent {
  private readonly productService = inject(ProductService);

  readonly products = this.productService.products;

  stockTotal(product: Product): number {
    return totalStock(product);
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
