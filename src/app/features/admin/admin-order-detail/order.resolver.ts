import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';

/**
 * Trae el pedido antes de entrar al detalle (así no depende de que esté en la
 * página cargada del listado). Si falla, devuelve null → "no encontrado".
 */
export const orderResolver: ResolveFn<Order | null> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) return of(null);
  return inject(OrderService)
    .fetchOne(id)
    .pipe(catchError(() => of(null)));
};
