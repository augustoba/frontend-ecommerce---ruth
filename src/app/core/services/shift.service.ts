import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shift } from '../models/shift.model';
import { CollectionStore } from '../state/collection-store';
import { apiUrl } from '../config/site-config';

/**
 * Turnos: un vendedor/cajero abre uno al empezar a trabajar y lo cierra al
 * terminar. El historial es paginado (20 por página), como el resto del panel.
 */
@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly http = inject(HttpClient);
  private readonly store = new CollectionStore<Shift>(this.http, '/admin/shifts', (raw) => raw as Shift[], 20);

  readonly shifts = this.store.items;
  readonly status = this.store.status;
  readonly loading = this.store.loading;
  readonly page = this.store.page;
  readonly totalPages = this.store.totalPages;

  ensureLoaded(): void {
    this.store.ensureLoaded();
  }

  loadPage(n: number): void {
    this.store.loadPage(n);
  }

  /** El turno abierto del usuario logueado (null si no tiene ninguno). */
  current(): Observable<Shift | null> {
    return this.http.get<Shift | null>(apiUrl('/admin/shifts/current'));
  }

  open(): Observable<Shift> {
    return this.http.post<Shift>(apiUrl('/admin/shifts/open'), {});
  }

  close(id: string): Observable<Shift> {
    return this.http.post<Shift>(apiUrl(`/admin/shifts/${id}/close`), {});
  }
}
