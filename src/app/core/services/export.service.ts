import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiUrl } from '../config/site-config';
import { ToastService } from './toast.service';
import { downloadText } from '../utils/csv';

/** Descarga CSVs generados por el backend (`/api/admin/export/*`). */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  download(path: string, filename: string, params?: Record<string, string | undefined>): void {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(params ?? {})) if (v) p = p.set(k, v);
    this.http.get(apiUrl(path), { responseType: 'text', params: p }).subscribe({
      next: (text) => downloadText(filename, text),
      error: () => this.toast.error('No se pudo exportar el CSV.'),
    });
  }
}
