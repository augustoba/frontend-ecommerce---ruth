import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CldImagePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;
  readonly logoSrc = this.settingsService.logoSrc;
  readonly currentYear = new Date().getFullYear();
  readonly whatsappContactUrl = this.settingsService.whatsappUrl;
  readonly instagramUrl = this.settingsService.instagramUrl;
  readonly instagramLabel = computed(() => '@' + (this.settings().instagram ?? ''));
}
