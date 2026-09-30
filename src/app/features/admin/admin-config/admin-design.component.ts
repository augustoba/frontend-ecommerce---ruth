import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { LAYOUTS, LayoutOption, ensureLayoutFonts } from '../../../core/layouts';
import { CatalogPageComponent } from '../../catalog/catalog-page/catalog-page.component';

/**
 * Elección del diseño de la tienda.
 *
 * Cada opción se muestra con una miniatura VIVA: es la home real (mismas
 * prendas, mismas fotos, mismos textos) renderizada por la plantilla
 * correspondiente y achicada con `transform: scale()`, no un dibujito. Por eso
 * `CatalogPageComponent` tiene `layoutOverride` (forzar el diseño ignorando el
 * guardado) y `preview` (pocas prendas, sin "lo más vendido").
 */
@Component({
  selector: 'app-admin-design',
  imports: [RouterLink, CatalogPageComponent],
  templateUrl: './admin-design.component.html',
})
export class AdminDesignComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly layouts = LAYOUTS;
  readonly active = this.settingsService.layout;
  /** Id del diseño que se está guardando, para mostrar "Guardando…" sólo en esa tarjeta. */
  readonly pending = signal<string | null>(null);

  constructor() {
    // En /admin el `data-layout` global está sacado a propósito (el backoffice
    // tiene su propia identidad), así que las tipografías se cargan acá: sin
    // esto la miniatura de Editorial se vería con la serif del sistema en vez
    // de Playfair, y la de Pop sin Archivo Black.
    for (const l of LAYOUTS) ensureLayoutFonts(l.id);
  }

  choose(layout: LayoutOption): void {
    if (this.pending() || layout.id === this.active()) return;
    this.pending.set(layout.id);
    this.settingsService.updateAppearance(layout.id).subscribe((ok) => {
      this.pending.set(null);
      if (ok) this.toast.success(`Diseño ${layout.label} activado.`);
      else this.toast.error('No se pudo guardar el diseño. Probá de nuevo.');
    });
  }
}
