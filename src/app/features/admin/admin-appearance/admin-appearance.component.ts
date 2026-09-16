import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { CatalogPageComponent } from '../../catalog/catalog-page/catalog-page.component';
import { generateBrandRamp } from '../../../core/utils/color-ramp';
import { extractLogoColor } from '../../../core/utils/logo-color';

/** Diseños realmente construidos (ver PLAN_SAAS.md Fase 10). Agregar uno acá cuando exista. */
export const LAYOUTS: { id: string; label: string }[] = [
  { id: 'classic', label: 'Clásico' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'curva', label: 'Curva' },
  { id: 'grid', label: 'Grid' },
  { id: 'mercado', label: 'Mercado' },
];

const DEFAULT_PREVIEW_COLOR = '#f97316';

/**
 * "Apariencia": elegir diseño (layout) y color de marca — dos ejes
 * independientes entre sí (ver PLAN_SAAS.md Fase 10). Las miniaturas de
 * diseño son el `CatalogPageComponent` real, escalado — no imágenes
 * estáticas — para que sean 100% fieles a lo que ve el cliente.
 */
@Component({
  selector: 'app-admin-appearance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgStyle, CatalogPageComponent],
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
