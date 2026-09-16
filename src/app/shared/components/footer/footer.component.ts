import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { GENERIC_LOGO_PLACEHOLDER } from '../../../core/utils/generic-logo';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;

  /** Overrides para previsualización — ver el mismo mecanismo en `HeaderComponent`. */
  readonly footerColorOverride = input<string | null | undefined>(undefined);
  readonly textColorOverride = input<string | null | undefined>(undefined);
  readonly storeNameOverride = input<string | undefined>(undefined);
  readonly logoOverride = input<string | null | undefined>(undefined);

  readonly storeName = computed(
    () => this.storeNameOverride() ?? this.settingsService.settings().storeName
  );
  readonly logoSrc = computed(() =>
    this.logoOverride() !== undefined
      ? this.logoOverride() || GENERIC_LOGO_PLACEHOLDER
      : this.settingsService.logoSrc()
  );

  /**
   * `null` = sin pisar nada, queda la clase `bg-brand-700` del template (el
   * color de marca del rubro/tenant, reactivo a `[data-theme]` en el sitio
   * real y a `previewVars()`/`--color-brand-700` en las vistas previas de
   * Apariencia y del asistente "Crear tienda") — mismo mecanismo que
   * `headerBg()` en `HeaderComponent`. Antes esto devolvía un color fijo
   * (`#7c2d12`) como fallback, lo que rompía el color por rubro: todas las
   * tiendas nuevas (sea cual sea su rubro) mostraban el mismo marrón en vez
   * de la paleta que les corresponde.
   */
  readonly footerBg = computed(() => {
    const override = this.footerColorOverride();
    if (override !== undefined) {
      return override || null;
    }
    return this.settingsService.settings().footerColor || null;
  });
  readonly titleColor = computed(() =>
    this.textColorOverride() !== undefined ? this.textColorOverride() : this.settingsService.settings().textColor || null
  );
  readonly currentYear = new Date().getFullYear();
  readonly whatsappContactUrl = this.settingsService.whatsappUrl;
  readonly instagramUrl = this.settingsService.instagramUrl;
  readonly instagramLabel = computed(() => '@' + (this.settings().instagram ?? ''));
}
