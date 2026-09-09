import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { PaymentMethod } from '../models/order.model';

export interface SiteSettings {
  storeName: string;
  whatsappNumber: string;
  aboutText: string | null;
  instagram: string | null;
  facebookUrl: string | null;
  /** Logo del negocio (URL o data URI). null = usar `LOGO_FALLBACK`. */
  logoUrl: string | null;
  /** Saludo del mensaje de pedido de WhatsApp. null = `WHATSAPP_INTRO_DEFAULT`. */
  whatsappIntro: string | null;
  /** Cierre del mensaje de pedido de WhatsApp. null = `WHATSAPP_CLOSING_DEFAULT`. */
  whatsappClosing: string | null;
  /** Dirección del local (opción "Retiro en el local" del checkout). */
  storeAddress: string | null;
  /** Texto de la página "Cómo comprar" (texto libre). null = no hay página. */
  helpText: string | null;
  /** Preguntas frecuentes: bloques separados por línea en blanco (1ra línea = pregunta). */
  faqText: string | null;
  /** Un medio de pago aparece en el checkout si está habilitado Y tiene su dato. */
  paymentTransferEnabled: boolean;
  paymentTransferAlias: string | null;
  paymentQrTransferEnabled: boolean;
  paymentQrTransferImage: string | null;
  paymentQrCardEnabled: boolean;
  paymentQrCardImage: string | null;
  paymentCardLink: string | null;
  /** Habilita "efectivo al recibir/retirar". */
  paymentCashEnabled: boolean;
}

/** Logo por defecto (archivo estático en `public/`) si el negocio no subió uno. */
export const LOGO_FALLBACK = 'logo.jpeg';

/** Textos por defecto del mensaje de pedido de WhatsApp. Admiten {tienda} y {codigo}. */
export const WHATSAPP_INTRO_DEFAULT = '¡Hola! Quiero hacer un pedido en *{tienda}* 🧸';
export const WHATSAPP_CLOSING_DEFAULT =
  'Quedo atento/a a que me pases el alias o el link de Mercado Pago para coordinar el pago. ¡Gracias!';

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
  logoUrl: null,
  whatsappIntro: WHATSAPP_INTRO_DEFAULT,
  whatsappClosing: WHATSAPP_CLOSING_DEFAULT,
  storeAddress: null,
  helpText: null,
  faqText: null,
  paymentTransferEnabled: false,
  paymentTransferAlias: null,
  paymentQrTransferEnabled: false,
  paymentQrTransferImage: null,
  paymentQrCardEnabled: false,
  paymentQrCardImage: null,
  paymentCardLink: null,
  paymentCashEnabled: false,
};

/**
 * Datos del local (nombre, WhatsApp, "sobre nosotros", redes). Se editan desde
 * `/admin/config` y se guardan en el backend → cambiar el número o las redes
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

  /** Src del logo a usar: el que subió el negocio o el archivo por defecto. */
  readonly logoSrc = computed(() => this.settingsSignal().logoUrl || LOGO_FALLBACK);

  /** Medios de pago que se ofrecen en el checkout: habilitados Y con su dato cargado. */
  readonly availablePaymentMethods = computed<PaymentMethod[]>(() => {
    const s = this.settingsSignal();
    const out: PaymentMethod[] = [];
    if (s.paymentTransferEnabled && s.paymentTransferAlias?.trim()) out.push('TRANSFER');
    if (s.paymentQrTransferEnabled && s.paymentQrTransferImage) out.push('QR_TRANSFER');
    if (s.paymentQrCardEnabled && (s.paymentQrCardImage || s.paymentCardLink?.trim())) out.push('QR_CARD');
    if (s.paymentCashEnabled) out.push('CASH');
    return out;
  });

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
        this.applyFavicon(s.logoUrl || LOGO_FALLBACK);
      },
      error: () => this.statusSignal.set('error'),
    });
  }

  private applyFavicon(href: string): void {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link && link.getAttribute('href') !== href) link.setAttribute('href', href);
  }

  /**
   * Guarda cambios de configuración. Acepta un objeto parcial: se mezcla con los
   * settings actuales antes de mandar el objeto completo al backend (así una
   * pantalla que sólo edita su parte no pisa el resto de los campos).
   */
  update(req: Partial<SiteSettings>): Observable<boolean> {
    this.saving.set(true);
    const full: SiteSettings = { ...this.settingsSignal(), ...req };
    return new Observable<boolean>((sub) => {
      this.http.put<SiteSettings>(apiUrl('/admin/settings'), full).subscribe({
        next: (s) => {
          this.settingsSignal.set(s);
          this.statusSignal.set('loaded');
          this.applyFavicon(s.logoUrl || LOGO_FALLBACK);
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
