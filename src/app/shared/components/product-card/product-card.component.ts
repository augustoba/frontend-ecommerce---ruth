import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, totalStock } from '../../../core/models/product.model';
import { ParamService } from '../../../core/services/param.service';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private readonly paramService = inject(ParamService);

  readonly product = input.required<Product>();

  /** Etiqueta del "Público" del producto (Bebé / Nena / ...) para el badge */
  get categoryLabel(): string {
    const opt = (this.product().params?.['grp-publico'] ?? [])[0];
    return opt ? this.paramService.labelFor('grp-publico', opt) : '';
  }

  get outOfStock(): boolean {
    return totalStock(this.product()) <= 0;
  }

  /** Aviso "últimas X unidades" cuando el stock total está por debajo del umbral. */
  get lowStockLabel(): string {
    const total = totalStock(this.product());
    const threshold = this.product().lowStockThreshold ?? 3;
    if (total <= 0 || total > threshold) return '';
    return total === 1 ? '¡Última unidad!' : `Quedan ${total}`;
  }
}
