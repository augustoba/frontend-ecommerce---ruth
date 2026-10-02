import { Injectable, Injector, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SettingsService } from './services/settings.service';

/**
 * Título de pestaña de la tienda: "<página> | <nombre de la tienda>", donde el
 * nombre sale de `/api/settings` (se edita en `/admin/config/identidad`).
 * Así, cambiar la marca no obliga a tocar las rutas ni redeployar.
 *
 * En el panel (`/admin`) el título queda tal cual lo define cada ruta
 * ("Productos | Admin"): el backoffice no lleva el nombre de la tienda.
 *
 * `SettingsService` se resuelve DIFERIDO en la primera navegación, no con
 * `inject()` en el constructor: el Router crea la estrategia mientras se está
 * construyendo, y construir `SettingsService` ahí dispara el request de
 * `/api/settings` cuyo interceptor vuelve a pedir el Router → ciclo de DI.
 */
@Injectable()
export class StoreTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly injector = inject(Injector);

  private readonly pageLabel = signal<string | undefined>(undefined);
  private readonly inAdmin = signal(false);
  private settings: SettingsService | null = null;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const label = this.buildTitle(snapshot);
    const admin = snapshot.url.startsWith('/admin');
    this.inAdmin.set(admin);
    this.pageLabel.set(label);

    if (admin) {
      this.title.setTitle(label ?? 'Admin');
      return;
    }

    // A esta altura el Router ya terminó de construirse (corremos en una
    // navegación), así que resolver el servicio es seguro.
    if (!this.settings) {
      this.settings = this.injector.get(SettingsService);
      effect(() => {
        if (this.inAdmin()) return;
        const store = this.settings!.settings().storeName;
        const page = this.pageLabel();
        this.title.setTitle(page ? `${page} | ${store}` : store);
      }, { injector: this.injector });
    }
  }
}
