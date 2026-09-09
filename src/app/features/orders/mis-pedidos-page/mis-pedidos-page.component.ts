import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PublicOrder } from '../../../core/models/order.model';
import {
  RememberedOrder,
  forgetRememberedOrder,
  loadRememberedOrders,
  rememberOrder,
} from '../../../core/utils/remembered-orders';

@Component({
  selector: 'app-mis-pedidos-page',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './mis-pedidos-page.component.html',
})
export class MisPedidosPageComponent {
  private readonly orderService = inject(OrderService);

  readonly code = signal('');
  readonly name = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly results = signal<PublicOrder[]>([]);

  readonly remembered = signal<RememberedOrder[]>(loadRememberedOrders());

  constructor() {
    // carga automática de los pedidos ya recordados en este navegador
    for (const r of this.remembered()) this.fetch(r.code, r.name, false);
  }

  lookup(): void {
    const code = this.code().trim();
    const name = this.name().trim();
    if (!code || !name) {
      this.error.set('Cargá el código del pedido y tu nombre.');
      return;
    }
    this.error.set(null);
    this.fetch(code, name, true);
  }

  private fetch(code: string, name: string, remember: boolean): void {
    this.loading.set(true);
    this.orderService.lookup(code, name).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.results.update((list) => [order, ...list.filter((o) => o.code !== order.code)]);
        if (remember) {
          rememberOrder(order.code, name);
          this.remembered.set(loadRememberedOrders());
          this.code.set('');
        }
      },
      error: () => {
        this.loading.set(false);
        if (remember) {
          this.error.set('No encontramos un pedido con ese código y ese nombre. Fijate que estén igual que cuando compraste.');
        }
      },
    });
  }

  forget(code: string): void {
    this.remembered.set(forgetRememberedOrder(code));
    this.results.update((list) => list.filter((o) => o.code !== code));
  }

  statusLabel(status: PublicOrder['status']): string {
    switch (status) {
      case 'PENDIENTE':
        return 'En revisión';
      case 'PROCESADO':
        return 'Confirmado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
