import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
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
  private readonly whatsapp = inject(WhatsappService);
  private readonly route = inject(ActivatedRoute);

  readonly code = signal('');
  readonly name = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly results = signal<PublicOrder[]>([]);

  /** Volvió del checkout de Mercado Pago con el pago aprobado (`?code=...&pago=aprobado`). */
  readonly justPaid = signal(false);

  readonly remembered = signal<RememberedOrder[]>(loadRememberedOrders());

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const qCode = qp.get('code');
    if (qCode) this.code.set(qCode);
    if (qp.get('pago') === 'aprobado') this.justPaid.set(true);

    // carga automática de los pedidos ya recordados en este navegador
    for (const r of this.remembered()) this.fetch(r.code, r.name, false);
  }

  /** Abre WhatsApp para coordinar la entrega de un pedido ya pagado por Mercado Pago. */
  coordinate(order: PublicOrder): void {
    window.open(this.whatsapp.buildPublicCoordinationLink(order), '_blank', 'noopener');
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
