import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';

export interface SiteSettings {
  storeName: string;
  whatsappNumber: string;
  aboutText: string | null;
  instagram: string | null;
  facebookUrl: string | null;
}

/** Valores por defecto: se usan para el primer render, antes de que llegue `/api/settings`. */
const DEFAULTS: SiteSettings = {
  storeName: 'Estilos Pequeños',
  whatsappNumber: '5491122334455',
  aboutText:
    'Somos Estilos Pequeños 🧸 Hace 5 años vestimos a los más chicos con ropa cómoda, ' +
    'de calidad y con onda. Elegimos cada prenda pensando en la comodidad de los peques ' +
    'y la tranquilidad de las familias. ¡Gracias por elegirnos!',
  instagram: 'estilospequenos_',
  facebookUrl: 'https://www.facebook.com/share/1NZXdYgick/',
};

/**
 * Datos del local (nombre, WhatsApp, "sobre nosotros", redes). Se editan desde
 * `/admin/ajustes` y se guardan en el backend → cambiar el número o las redes
 * no requiere redesplegar nada.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  private readonly settingsSignal = signal<SiteSettings>(DEFAULTS);
  private readonly statusSignal = signal<LoadStatus>('idle');
  readonly saving = signal(false);

  readonly settings = this.settingsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();

  /** Link a wa.me con el número actual (sin mensaje). */
  readonly whatsappUrl = computed(() => `https://wa.me/${this.settingsSignal().whatsappNumber}`);
  readonly instagramUrl = computed(() => {
    const h = this.settingsSignal().instagram;
    return h ? `https://instagram.com/${h}` : null;
  });

  constructor() {
    this.load();
  }

  reload = (): void => this.load();
  ensureLoaded(): void {
    if (this.statusSignal() === 'idle' || this.statusSignal() === 'error') this.load();
  }

  private load(): void {
    this.statusSignal.set('loading');
    this.http.get<SiteSettings>(apiUrl('/settings')).subscribe({
      next: (s) => {
        this.settingsSignal.set(s);
        this.statusSignal.set('loaded');
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  update(req: SiteSettings): Observable<boolean> {
    this.saving.set(true);
    return new Observable<boolean>((sub) => {
      this.http.put<SiteSettings>(apiUrl('/admin/settings'), req).subscribe({
        next: (s) => {
          this.settingsSignal.set(s);
          this.statusSignal.set('loaded');
          this.saving.set(false);
          sub.next(true);
          sub.complete();
        },
        error: () => {
          this.saving.set(false);
          sub.next(false);
          sub.complete();
        },
      });
    });
  }
}
