import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { CatalogPageComponent } from '../../catalog/catalog-page/catalog-page.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { generateBrandRamp } from '../../../core/utils/color-ramp';
import { extractLogoColor } from '../../../core/utils/logo-color';

/**
 * Diseños realmente construidos (ver PLAN_SAAS.md Fase 10). Agregar uno acá
 * cuando exista. `previewColor` es el color de acento ORIGINAL de cada
 * diseño (sacado del theme de WordPress real que lo inspiró — carpeta
 * `templates/` del Escritorio, no inventado) — se usa fijo en las
 * miniaturas de selección para que las 6 se vean distintas entre sí en vez
 * de compartir el color de marca que se esté editando en ese momento (pedido
 * explícito del usuario, ver PLAN_SAAS.md).
 */
export const LAYOUTS: { id: string; label: string; previewColor: string }[] = [
  // Diseño propio de la tienda piloto (no viene de ningún template
  // descargado) — coincide con el color por defecto del rubro Ropa.
  { id: 'classic', label: 'Clásico', previewColor: '#f97316' },
  // Botiga, paleta "palette1" (la que trae por defecto).
  { id: 'minimal', label: 'Minimal', previewColor: '#212121' },
  // Minna (Framer) — nunca se descargó un archivo del que sacar el color
  // real, aproximado a su estética editorial (negro/grafito sobre foto).
  { id: 'boutique', label: 'Boutique', previewColor: '#1c1917' },
  // Rife Free, color de acento por defecto (`default-settings/*.json`).
  { id: 'curva', label: 'Curva', previewColor: '#3957ff' },
  // Shopper, `--secondary-color` (único acento que define el theme).
  { id: 'grid', label: 'Grid', previewColor: '#734f96' },
  // Consolida Shopping Cart + Big Store + Online Shop — se usa el de
  // Shopping Cart (el que más aportó a la estructura final).
  { id: 'mercado', label: 'Mercado', previewColor: '#f77426' },
  // Astra - Theme minimalista y rápido, color de acento azul característico
  { id: 'astra', label: 'Astra', previewColor: '#3b82f6' },
  // Big Store - Theme para e-commerce con grid prominente, color naranja
  { id: 'big-store', label: 'Big Store', previewColor: '#ff6b35' },
  // Neve - Theme moderno móvil-first, color verde menta
  { id: 'neve', label: 'Neve', previewColor: '#10b981' },
  // OceanWP - Theme versátil, color azul océano
  { id: 'oceanwp', label: 'OceanWP', previewColor: '#0ea5e9' },
  // Orchid Store - Theme para tiendas online, color púrpura
  { id: 'orchid-store', label: 'Orchid Store', previewColor: '#8b5cf6' },
  // Shopper Store - Theme minimalista e-commerce, color rosa
  { id: 'shopper-store', label: 'Shopper Store', previewColor: '#ec4899' },
  // Sydney - Theme corporativo/profesional, color rojo coral
  { id: 'sydney', label: 'Sydney', previewColor: '#f43f5e' },
  // Woostify - Theme optimizado para WooCommerce, color índigo
  { id: 'woostify', label: 'Woostify', previewColor: '#6366f1' },
  // Studio - Layout único asimétrico con imagen diagonal y miniaturas de productos
  { id: 'studio', label: 'Studio', previewColor: '#0d9488' },
];

const DEFAULT_PREVIEW_COLOR = '#f97316';

/**
 * Variables CSS `--color-brand-*` fijas para el color original de un
 * layout — independiente de cualquier color en edición, para que las
 * miniaturas de comparación no cambien según qué tienda se vio último.
 */
export function layoutSwatchVars(colorHex: string): Record<string, string> {
  const ramp = generateBrandRamp(colorHex);
  if (!ramp) return {};
  const vars: Record<string, string> = {};
  for (const stop of ['50', '100', '200', '300', '400', '500', '600', '700'] as const) {
    vars[`--color-brand-${stop}`] = ramp[stop];
  }
  return vars;
}

/**
 * "Apariencia": elegir diseño (layout) y color de marca — dos ejes
 * independientes entre sí (ver PLAN_SAAS.md Fase 10). Las miniaturas de
 * diseño son el `CatalogPageComponent` real, escalado — no imágenes
 * estáticas — para que sean 100% fieles a lo que ve el cliente.
 */
@Component({
  selector: 'app-admin-appearance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgStyle, CatalogPageComponent, HeaderComponent, FooterComponent],
  templateUrl: './admin-appearance.component.html',
})
export class AdminAppearanceComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly layouts = LAYOUTS;
  readonly saving = this.settingsService.saving;

  readonly draftLayout = signal<string>('classic');
  /** Layout mostrado en grande en el modal de "ver más grande" — null = cerrado. */
  readonly expandedLayout = signal<string | null>(null);
  readonly expandedLabel = computed(
    () => this.layouts.find((l) => l.id === this.expandedLayout())?.label ?? ''
  );
  readonly draftBrandColor = signal<string | null>(null);
  readonly draftHeaderColor = signal<string | null>(null);
  readonly draftFooterColor = signal<string | null>(null);
  readonly draftTextColor = signal<string | null>(null);
  readonly draftPageBgColor = signal<string | null>(null);
  readonly suggesting = signal(false);
  private touched = false;

  readonly hasLogo = computed(() => !!this.settingsService.settings().logoUrl);

  readonly dirty = computed(() => {
    const s = this.settingsService.settings();
    return (
      this.draftLayout() !== (s.layout || 'classic') ||
      this.draftBrandColor() !== s.brandColor ||
      this.draftHeaderColor() !== s.headerColor ||
      this.draftFooterColor() !== s.footerColor ||
      this.draftTextColor() !== s.textColor ||
      this.draftPageBgColor() !== s.pageBackgroundColor
    );
  });

  /**
   * Variables CSS del color en borrador, para pintar sólo las miniaturas de
   * esta pantalla — a propósito NO se tocan las `--color-brand-*` globales
   * hasta guardar, para no repintar el resto del panel mientras se elige.
   */
  readonly previewVars = computed(() => {
    const ramp = generateBrandRamp(this.draftBrandColor() ?? DEFAULT_PREVIEW_COLOR);
    if (!ramp) return {};
    const vars: Record<string, string> = {};
    for (const stop of ['50', '100', '200', '300', '400', '500', '600', '700'] as const) {
      vars[`--color-brand-${stop}`] = ramp[stop];
    }
    return vars;
  });

  constructor() {
    this.settingsService.ensureLoaded();
    effect(() => {
      const s = this.settingsService.settings();
      if (!this.touched) {
        this.draftLayout.set(s.layout || 'classic');
        this.draftBrandColor.set(s.brandColor);
        this.draftHeaderColor.set(s.headerColor);
        this.draftFooterColor.set(s.footerColor);
        this.draftTextColor.set(s.textColor);
        this.draftPageBgColor.set(s.pageBackgroundColor);
      }
    });
  }

  /** Color original fijo de cada miniatura de diseño (ver `LAYOUTS`) — no depende del color en edición. */
  readonly layoutSwatchVars = layoutSwatchVars;

  chooseLayout(id: string): void {
    this.touched = true;
    this.draftLayout.set(id);
  }

  openPreview(id: string, event: Event): void {
    event.stopPropagation();
    this.expandedLayout.set(id);
  }

  closePreview(): void {
    this.expandedLayout.set(null);
  }

  chooseAndClosePreview(id: string): void {
    this.chooseLayout(id);
    this.closePreview();
  }

  setBrandColor(hex: string): void {
    this.touched = true;
    this.draftBrandColor.set(hex);
  }

  clearBrandColor(): void {
    this.touched = true;
    this.draftBrandColor.set(null);
  }

  setHeaderColor(hex: string): void {
    this.touched = true;
    this.draftHeaderColor.set(hex);
  }
  clearHeaderColor(): void {
    this.touched = true;
    this.draftHeaderColor.set(null);
  }

  setFooterColor(hex: string): void {
    this.touched = true;
    this.draftFooterColor.set(hex);
  }
  clearFooterColor(): void {
    this.touched = true;
    this.draftFooterColor.set(null);
  }

  setTextColor(hex: string): void {
    this.touched = true;
    this.draftTextColor.set(hex);
  }
  clearTextColor(): void {
    this.touched = true;
    this.draftTextColor.set(null);
  }

  setPageBgColor(hex: string): void {
    this.touched = true;
    this.draftPageBgColor.set(hex);
  }
  clearPageBgColor(): void {
    this.touched = true;
    this.draftPageBgColor.set(null);
  }

  /** Sugiere el color de marca a partir del logo ya subido — se puede ajustar después a mano. */
  async suggestFromLogo(): Promise<void> {
    const logoUrl = this.settingsService.settings().logoUrl;
    if (!logoUrl || this.suggesting()) return;
    this.suggesting.set(true);
    try {
      const color = await extractLogoColor(logoUrl);
      if (color) {
        this.setBrandColor(color);
        this.toast.success(`Color sugerido del logo: ${color}`);
      } else {
        this.toast.error('No se pudo sacar un color claro del logo — elegilo a mano.');
      }
    } finally {
      this.suggesting.set(false);
    }
  }

  save(): void {
    if (this.saving()) return;
    this.settingsService
      .updateAppearance(
        this.draftLayout(),
        this.draftBrandColor(),
        this.draftHeaderColor(),
        this.draftFooterColor(),
        this.draftTextColor(),
        this.draftPageBgColor()
      )
      .subscribe((ok) => {
        if (ok) {
          this.touched = false;
          this.toast.success('Apariencia guardada.');
        } else {
          this.toast.error('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
