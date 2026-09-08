import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../../core/config/site-config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly storeName = SITE_CONFIG.storeName;
  readonly about = SITE_CONFIG.about;
  readonly currentYear = new Date().getFullYear();
  readonly whatsappContactUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
  readonly instagramHandle = SITE_CONFIG.redes.instagram;
  readonly instagramUrl = `https://instagram.com/${SITE_CONFIG.redes.instagram}`;
  readonly facebookUrl = SITE_CONFIG.redes.facebookUrl;
}
