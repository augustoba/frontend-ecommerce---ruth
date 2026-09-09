import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponCheck, CouponInput } from '../models/coupon.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Cupones de descuento (`/admin/cupones`). Distintos de los descuentos
 * automáticos: son códigos que el cliente escribe en el carrito.
 */
@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<Coupon>(this.http, '/admin/coupons');

  readonly coupons = this.store.items;
  readonly status = this.store.status;
  readonly saving = this.store.saving;
  readonly reload = this.store.reload;
  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  /** Valida un código para un subtotal dado (público, no lo consume). */
  check(code: string, subtotal: number): Observable<CouponCheck> {
    return this.http.get<CouponCheck>(apiUrl(`/coupons/${encodeURIComponent(code.trim())}`), {
      params: new HttpParams().set('subtotal', Math.max(0, Math.round(subtotal))),
    });
  }

  create(input: CouponInput, onSuccess?: () => void): void {
    this.store.mutate(this.http.post(apiUrl('/admin/coupons'), input), onSuccess);
  }

  update(id: string, input: CouponInput, onSuccess?: () => void): void {
    this.store.mutate(this.http.put(apiUrl(`/admin/coupons/${id}`), input), onSuccess);
  }

  setEnabled(id: string, enabled: boolean): void {
    this.store.mutate(this.http.patch(apiUrl(`/admin/coupons/${id}/enabled`), { enabled }));
  }

  delete(id: string): void {
    this.store.mutate(this.http.delete(apiUrl(`/admin/coupons/${id}`)));
  }
}
