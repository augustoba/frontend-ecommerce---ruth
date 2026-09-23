import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { apiUrl } from '../config/site-config';
import { LoadStatus } from '../state/collection-store';
import { PaymentMethod } from '../models/order.model';

/**
 * Config de SMTP (recuperación de cuenta por mail). `password` nunca viaja del
 * backend hacia acá — sólo `passwordSet` dice si hay una guardada.
 */
export interface MailConfig {
  host: string | null;
  port: number | null;
  username: string | null;
  passwordSet: boolean;
  fromEmail: string | null;
  fromName: string | null;
}

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
  /** Foto del local (URL o data URI). null = no tiene local físico o no la cargó. */
  storePhotoUrl: string | null;
  /** true = existe la página pública "Quiénes somos" (`/nosotros`) y aparece en el footer. */
  aboutPageEnabled: boolean;
  /** true = se muestra el banner promocional (popup) al entrar al catálogo. */
  promoBannerEnabled: boolean;
  /** Imagen del banner (URL o data URI). null = sin banner cargado. */
  promoBannerImage: string | null;
  /** A dónde va si lo tocan (opcional). null = no navega a ningún lado. */
  promoBannerLink: string | null;
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
  /**
   * Cuenta de Cloudinary usada para subir fotos desde el panel. Sólo lectura acá
   * (se editan desde `/admin/superadmin/cloudinary`, solo superadmin — ver
   * `updateCloudinaryConfig`). null = la subida de imágenes queda deshabilitada.
   */
  cloudinaryCloudName: string | null;
  cloudinaryUploadPreset: string | null;
  /**
   * true sólo si el dueño activó el checkout Y ya cargó su Access Token —
   * recién ahí tiene sentido ofrecer "Pagar con Mercado Pago" en el carrito.
   * Cuando está en true, Mercado Pago pasa a ser el ÚNICO medio de pago
   * online (ver `availablePaymentMethods`) — no aplica a la venta local.
   */
  mercadoPagoAvailable: boolean;
}

/** Credenciales de Mercado Pago. `accessToken` nunca viaja del backend — sólo `accessTokenSet`. */
export interface MercadoPagoConfig {
  mpEnabled: boolean;
  accessTokenSet: boolean;
  publicKey: string | null;
}

/** Alerta diaria por mail de talles en stock bajo. */
export interface StockAlertConfig {
  lowStockAlertEnabled: boolean;
  lowStockAlertEmail: string | null;
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
  storePhotoUrl: null,
  aboutPageEnabled: false,
  promoBannerEnabled: false,
  promoBannerImage: null,
  promoBannerLink: null,
  paymentTransferEnabled: false,
  paymentTransferAlias: null,
  paymentQrTransferEnabled: false,
  paymentQrTransferImage: null,
  paymentQrCardEnabled: false,
  paymentQrCardImage: null,
  paymentCardLink: null,
  paymentCashEnabled: false,
  // Cuenta actual (fallback si el backend todavía no tiene la fila con estos
  // campos, ej. justo después de deployar esta migración).
  cloudinaryCloudName: 'jitutkbc',
  cloudinaryUploadPreset: 'estilospequenos',
  mercadoPagoAvailable: false,
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
    // Mercado Pago es excluyente en la venta online: si está activo, es la
    // única opción del carrito (no coexiste con transferencia/QR/efectivo).
    if (s.mercadoPagoAvailable) return ['MERCADOPAGO'];
    const out: PaymentMethod[] = [];
    if (s.paymentTransferEnabled && s.paymentTransferAlias?.trim()) out.push('TRANSFER');
    if (s.paymentQrTransferEnabled && s.paymentQrTransferImage) out.push('QR_TRANSFER');
    if (s.paymentQrCardEnabled && (s.paymentQrCardImage || s.paymentCardLink?.trim())) out.push('QR_CARD');
    if (s.paymentCashEnabled) out.push('CASH');
    return out;
  });

  /** true si hay cuenta de Cloudinary cargada (subida de imágenes habilitada). */
  readonly cloudinaryConfigured = computed(() => {
    const s = this.settingsSignal();
    return !!(s.cloudinaryCloudName && s.cloudinaryUploadPreset);
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
   * Identidad, logo, WhatsApp, redes, textos. Sólo superadmin
   * (`PLATFORM_SETTINGS_MANAGE`). Acepta un objeto parcial: se mezcla con los
   * settings actuales antes de mandar sólo los campos de plataforma al backend.
   */
  updatePlatform(req: Partial<SiteSettings>): Observable<boolean> {
    const full: SiteSettings = { ...this.settingsSignal(), ...req };
    const {
      storeName, whatsappNumber, aboutText, instagram, facebookUrl, logoUrl,
      whatsappIntro, whatsappClosing, storeAddress, helpText, faqText,
      storePhotoUrl, aboutPageEnabled, promoBannerEnabled, promoBannerImage, promoBannerLink,
    } = full;
    return this.putMerged('/admin/settings/platform', {
      storeName, whatsappNumber, aboutText, instagram, facebookUrl, logoUrl,
      whatsappIntro, whatsappClosing, storeAddress, helpText, faqText,
      storePhotoUrl, aboutPageEnabled, promoBannerEnabled, promoBannerImage, promoBannerLink,
    });
  }

  /** Medios de pago. Lo edita el admin normal (`PAYMENTS_MANAGE`). */
  updatePayments(req: Partial<SiteSettings>): Observable<boolean> {
    const full: SiteSettings = { ...this.settingsSignal(), ...req };
    const {
      paymentTransferEnabled, paymentTransferAlias, paymentQrTransferEnabled,
      paymentQrTransferImage, paymentQrCardEnabled, paymentQrCardImage,
      paymentCardLink, paymentCashEnabled,
    } = full;
    return this.putMerged('/admin/settings/payments', {
      paymentTransferEnabled, paymentTransferAlias, paymentQrTransferEnabled,
      paymentQrTransferImage, paymentQrCardEnabled, paymentQrCardImage,
      paymentCardLink, paymentCashEnabled,
    });
  }

  private putMerged(path: string, body: Record<string, unknown>): Observable<boolean> {
    this.saving.set(true);
    return new Observable<boolean>((sub) => {
      this.http.put<SiteSettings>(apiUrl(path), body).subscribe({
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

  /**
   * Config de Cloudinary. Sólo la puede leer/editar un superadmin (ver backend).
   * `apiSecret` nunca viaja del backend — sólo `apiSecretSet` dice si hay uno guardado.
   */
  getCloudinaryConfig(): Observable<{ cloudName: string | null; uploadPreset: string | null; apiKey: string | null; apiSecretSet: boolean } | null> {
    return this.http
      .get<{ cloudName: string | null; uploadPreset: string | null; apiKey: string | null; apiSecretSet: boolean }>(
        apiUrl('/admin/settings/cloudinary')
      )
      .pipe(catchError(() => of(null)));
  }

  /**
   * Guarda la cuenta de Cloudinary. Sólo la puede llamar un superadmin — el
   * backend devuelve 403 si no (`/admin/superadmin/cloudinary` ya valida antes
   * de mostrar el form, pero el guard de la ruta es la primera barrera).
   * `apiSecret` vacío/null = no tocar el que ya está guardado.
   */
  updateCloudinaryConfig(req: {
    cloudName: string | null;
    uploadPreset: string | null;
    apiKey: string | null;
    apiSecret: string | null;
  }): Observable<{ cloudName: string | null; uploadPreset: string | null; apiKey: string | null; apiSecretSet: boolean } | null> {
    this.saving.set(true);
    return this.http
      .put<{ cloudName: string | null; uploadPreset: string | null; apiKey: string | null; apiSecretSet: boolean }>(
        apiUrl('/admin/settings/cloudinary'),
        req
      )
      .pipe(
        map((res) => {
          this.settingsSignal.update((s) => ({
            ...s,
            cloudinaryCloudName: res.cloudName,
            cloudinaryUploadPreset: res.uploadPreset,
          }));
          this.saving.set(false);
          return res;
        }),
        catchError(() => {
          this.saving.set(false);
          return of(null);
        })
      );
  }

  /** Config de SMTP. Sólo la puede leer/editar un superadmin (ver backend). */
  getMailConfig(): Observable<MailConfig | null> {
    return this.http
      .get<MailConfig>(apiUrl('/admin/settings/mail'))
      .pipe(catchError(() => of(null)));
  }

  /**
   * Guarda la config de SMTP. `password` vacío/null = no tocar la que ya está
   * guardada (mismo patrón que cambiar la contraseña de un usuario).
   */
  updateMailConfig(req: {
    host: string | null;
    port: number | null;
    username: string | null;
    password: string | null;
    fromEmail: string | null;
    fromName: string | null;
  }): Observable<MailConfig | null> {
    this.saving.set(true);
    return this.http.put<MailConfig>(apiUrl('/admin/settings/mail'), req).pipe(
      map((res) => {
        this.saving.set(false);
        return res;
      }),
      catchError(() => {
        this.saving.set(false);
        return of(null);
      })
    );
  }

  /** Credenciales de Mercado Pago. Las carga/edita el dueño de la tienda (`PAYMENTS_MANAGE`). */
  getMercadoPagoConfig(): Observable<MercadoPagoConfig | null> {
    return this.http
      .get<MercadoPagoConfig>(apiUrl('/admin/settings/mercadopago'))
      .pipe(catchError(() => of(null)));
  }

  /**
   * Guarda la config de Mercado Pago. `accessToken` vacío/null = no tocar el
   * que ya está guardado (mismo criterio que el resto de los secretos del
   * panel). Recarga `/api/settings` al terminar para que el carrito refleje
   * al toque si Mercado Pago pasa a estar disponible u ocultarse.
   */
  updateMercadoPagoConfig(req: {
    mpEnabled: boolean;
    accessToken: string | null;
    publicKey: string | null;
  }): Observable<MercadoPagoConfig | null> {
    this.saving.set(true);
    return this.http.put<MercadoPagoConfig>(apiUrl('/admin/settings/mercadopago'), req).pipe(
      map((res) => {
        this.saving.set(false);
        this.reload();
        return res;
      }),
      catchError(() => {
        this.saving.set(false);
        return of(null);
      })
    );
  }

  /** Alerta diaria por mail de talles en stock bajo. La carga/edita `PRODUCTS_MANAGE`. */
  getStockAlertConfig(): Observable<StockAlertConfig | null> {
    return this.http
      .get<StockAlertConfig>(apiUrl('/admin/settings/stock-alert'))
      .pipe(catchError(() => of(null)));
  }

  updateStockAlertConfig(req: StockAlertConfig): Observable<StockAlertConfig | null> {
    this.saving.set(true);
    return this.http.put<StockAlertConfig>(apiUrl('/admin/settings/stock-alert'), req).pipe(
      map((res) => {
        this.saving.set(false);
        return res;
      }),
      catchError(() => {
        this.saving.set(false);
        return of(null);
      })
    );
  }
}
