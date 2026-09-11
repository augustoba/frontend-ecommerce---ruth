import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config/site-config';

/** Una fila del cierre de caja: total de un medio de pago, abierto por origen. */
export interface CashMethodRow {
  method: string;
  label: string;
  local: number;
  exchanges: number;
  online: number;
  total: number;
}

export interface CashRegister {
  date: string;
  rows: CashMethodRow[];
  total: CashMethodRow;
}

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private readonly http = inject(HttpClient);

  forDay(date: string): Observable<CashRegister> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<CashRegister>(apiUrl('/admin/cash-register'), { params });
  }

  /** Caja de un turno puntual: sólo lo que esa persona cobró/procesó en su ventana. */
  forShift(shiftId: string): Observable<CashRegister> {
    return this.http.get<CashRegister>(apiUrl(`/admin/cash-register/shift/${shiftId}`));
  }
}
