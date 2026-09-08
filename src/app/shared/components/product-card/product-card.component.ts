import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, totalStock } from '../../../core/models/product.model';

const CATEGORY_LABELS: Record<Product['category'], string> = {
  bebe: 'Bebé',
  nena: 'Nena',
  nene: 'Nene',
  unisex: 'Unisex',
};

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  get categoryLabel(): string {
    return CATEGORY_LABELS[this.product().category];
  }

  get outOfStock(): boolean {
    return totalStock(this.product()) <= 0;
  }
}
