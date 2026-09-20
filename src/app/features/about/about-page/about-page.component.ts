import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';

/**
 * Página pública "Quiénes somos". El contenido se edita desde
 * `/admin/config/sobre-nosotros` y sólo se enruta acá si el negocio activó
 * `aboutPageEnabled` (ver footer, que oculta el link si no).
 */
@Component({
  selector: 'app-about-page',
  imports: [RouterLink, CldImagePipe],
  templateUrl: './about-page.component.html',
})
export class AboutPageComponent {
  private readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;
  readonly logoSrc = this.settingsService.logoSrc;
  readonly whatsappUrl = this.settingsService.whatsappUrl;
  readonly instagramUrl = this.settingsService.instagramUrl;
  readonly instagramLabel = computed(() => '@' + (this.settings().instagram ?? ''));
}
