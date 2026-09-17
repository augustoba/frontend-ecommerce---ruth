import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditNote } from '../models/credit-note.model';
import { apiUrl } from '../config/site-config';

/** Notas de crédito ARCA contra un pedido ya facturado (ítem 2) — `/api/admin/orders/{id}/credit-notes`. */
@Injectable({ providedIn: 'root' })
export class CreditNoteService {
  private readonly http = inject(HttpClient);

  list(orderId: string): Observable<CreditNote[]> {
    return this.http.get<CreditNote[]>(apiUrl(`/admin/orders/${orderId}/credit-notes`));
  }

  emit(orderId: string, amount: number, reason: string): Observable<CreditNote> {
    return this.http.post<CreditNote>(apiUrl(`/admin/orders/${orderId}/credit-notes`), { amount, reason });
  }
}
