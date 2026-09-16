import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantAdminService, TenantRecord } from '../../../core/services/tenant-admin.service';
import { DemoTenantService } from '../../../core/services/demo-tenant.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { resizeImageFile, validateImageFile } from '../../../core/utils/image-resize';
import { generateBrandRamp } from '../../../core/utils/color-ramp';
import { extractLogoColor } from '../../../core/utils/logo-color';
import { CatalogPageComponent } from '../../catalog/catalog-page/catalog-page.component';
import { LAYOUTS } from '../admin-appearance/admin-appearance.component';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const DEFAULT_PREVIEW_COLOR = '#f97316';

export interface TenantDraft {
  name: string;
  slug: string;
  rubro: string;
}

/**
 * Asistente "Crear tienda" a pantalla completa (ver PLAN_SAAS.md Fase 10,
 * Paso 7): diseño → logo → color (con sugerencia según el logo) →
 * identidad → previsualización (pantalla completa de verdad, ESC nativo del
 * navegador para salir) → confirmar → listo. El logo va antes que el color
 * a propósito: así se le puede sugerir un color de marca sacado del logo ya
 * elegido. Todo en borrador local — no se crea nada hasta "Crear tienda" del
 * paso de confirmación, que manda todo junto en un solo alta.
 */
@Component({
  selector: 'app-tenant-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgStyle, CatalogPageComponent],
  templateUrl: './tenant-wizard.component.html',
})
export class TenantWizardComponent {
  private readonly tenantAdmin = inject(TenantAdminService);
  private readonly demoTenant = inject(DemoTenantService);
  private readonly cloudinary = inject(CloudinaryService);

  readonly draft = input.required<TenantDraft>();
  readonly cancelled = output<void>();
  readonly created = output<TenantRecord>();

  readonly fullscreenHost = viewChild<ElementRef<HTMLDivElement>>('fullscreenHost');

  readonly layouts = LAYOUTS;
  readonly step = signal<WizardStep>(1);
  readonly creating = signal(false);
  readonly error = signal<string | null>(null);

  // Paso 1: diseño
  readonly draftLayout = signal('classic');
  readonly layoutLabel = computed(() => this.layouts.find((l) => l.id === this.draftLayout())?.label ?? '');

  // Paso 2: logo (va antes que el color para poder sugerirlo a partir de acá)
  /**
   * El logo NO se sube a Cloudinary al elegirlo — recién se sube en
   * `crearTienda()`, si el asistente llega hasta el final. Antes de eso
   * vive sólo en memoria como data URL (ya redimensionado, ver
   * `resizeImageFile`), que sirve a la vez de preview, de fuente para la
   * subida y para sugerir el color de marca — así no quedan imágenes
   * húerfanas en la nube si el superadmin cancela el asistente a mitad de
   * camino.
   */
  readonly logoDataUrl = signal<string | null>(null);
  readonly logoShape = signal('circle');
  readonly uploadingLogo = signal(false);

  readonly logoShapeOptions: { value: string; label: string }[] = [
    { value: 'circle', label: 'Redondo' },
    { value: 'square', label: 'Cuadrado' },
    { value: 'rectangle', label: 'Rectangular' },
  ];
  readonly logoPreviewClass = computed(() => {
    const shape = this.logoShape();
    return shape === 'square'
      ? 'rounded-lg object-cover'
      : shape === 'rectangle'
        ? 'rounded-md object-contain'
        : 'rounded-full object-cover';
  });

  // Paso 3: color
  readonly draftBrandColor = signal<string | null>(null);
  readonly draftHeaderColor = signal<string | null>(null);
  readonly draftFooterColor = signal<string | null>(null);
  readonly draftTextColor = signal<string | null>(null);
  readonly draftPageBgColor = signal<string | null>(null);
  readonly suggestingColor = signal(false);
  readonly previewVars = computed(() => {
    const ramp = generateBrandRamp(this.draftBrandColor() ?? DEFAULT_PREVIEW_COLOR);
    if (!ramp) return {};
    const vars: Record<string, string> = {};
    for (const stop of ['50', '100', '200', '300', '400', '500', '600', '700'] as const) {
      vars[`--color-brand-${stop}`] = ramp[stop];
    }
    return vars;
  });

  // Paso 4: identidad
  readonly whatsappNumber = signal('');
  readonly instagram = signal('');
  readonly facebookUrl = signal('');

  // Paso 5: previsualización a pantalla completa
  readonly fullscreenActive = signal(false);
  private awaitingFullscreenExit = false;

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (!document.fullscreenElement) {
      this.fullscreenActive.set(false);
      if (this.awaitingFullscreenExit) {
        this.awaitingFullscreenExit = false;
        this.step.set(6);
      }
    }
  }

  chooseLayout(id: string): void {
    this.draftLayout.set(id);
  }

  setBrandColor(hex: string): void {
    this.draftBrandColor.set(hex);
  }

  clearBrandColor(): void {
    this.draftBrandColor.set(null);
  }

  setHeaderColor(hex: string): void {
    this.draftHeaderColor.set(hex);
  }
  clearHeaderColor(): void {
    this.draftHeaderColor.set(null);
  }

  setFooterColor(hex: string): void {
    this.draftFooterColor.set(hex);
  }
  clearFooterColor(): void {
    this.draftFooterColor.set(null);
  }

  setTextColor(hex: string): void {
    this.draftTextColor.set(hex);
  }
  clearTextColor(): void {
    this.draftTextColor.set(null);
  }

  setPageBgColor(hex: string): void {
    this.draftPageBgColor.set(hex);
  }
  clearPageBgColor(): void {
    this.draftPageBgColor.set(null);
  }

  /** Sugiere el color de marca a partir del logo ya elegido (todavía en memoria, sin subir). */
  async suggestColorFromLogo(): Promise<void> {
    const dataUrl = this.logoDataUrl();
    if (!dataUrl || this.suggestingColor()) return;
    this.suggestingColor.set(true);
    try {
      const color = await extractLogoColor(dataUrl);
      if (color) {
        this.draftBrandColor.set(color);
      } else {
        this.error.set('No se pudo sacar un color claro del logo — elegilo a mano.');
      }
    } finally {
      this.suggestingColor.set(false);
    }
  }

  back(): void {
    this.error.set(null);
    this.step.update((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
  }

  goToLogo(): void {
    this.step.set(2);
  }

  goToColor(): void {
    this.step.set(3);
  }

  goToIdentity(): void {
    this.step.set(4);
  }

  goToPreview(): void {
    this.error.set(null);
    if (this.whatsappNumber().trim() && !/^\d{8,15}$/.test(this.whatsappNumber().trim())) {
      this.error.set('El WhatsApp tiene que ser solo números (país + área + número, sin +, espacios ni el 15).');
      return;
    }
    this.step.set(5);
  }

  async enterFullscreen(): Promise<void> {
    const el = this.fullscreenHost()?.nativeElement;
    if (!el) return;
    try {
      await el.requestFullscreen();
      this.fullscreenActive.set(true);
      this.awaitingFullscreenExit = true;
    } catch {
      // Si el navegador no permite fullscreen (poco común), seguimos igual al confirmar.
      this.step.set(6);
    }
  }

  skipPreview(): void {
    this.step.set(6);
  }

  /** Sólo redimensiona y arma una preview local — no toca la red. */
  async onLogoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      this.error.set(invalid);
      return;
    }

    this.error.set(null);
    this.uploadingLogo.set(true);
    try {
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const resized = await resizeImageFile(file, 512, 0.9, type);
      this.logoDataUrl.set(resized);
    } catch (e) {
      this.error.set(e instanceof Error ? `No se pudo procesar el logo: ${e.message}` : 'No se pudo procesar el logo.');
    } finally {
      this.uploadingLogo.set(false);
    }
  }

  removeLogo(): void {
    this.logoDataUrl.set(null);
  }

  /**
   * Recién acá se sube el logo a Cloudinary (si se eligió uno) — hasta este
   * momento vivió sólo en memoria, para no dejar imágenes húerfanas en la
   * nube si el asistente se cancela antes de llegar a este paso.
   */
  async crearTienda(): Promise<void> {
    if (this.creating()) return;
    this.error.set(null);
    this.creating.set(true);

    let logoUrl: string | undefined;
    const dataUrl = this.logoDataUrl();
    if (dataUrl) {
      if (!this.cloudinary.configured) {
        this.creating.set(false);
        this.error.set('La subida de imágenes todavía no está configurada.');
        return;
      }
      try {
        const { secureUrl } = await this.cloudinary.upload(dataUrl, {
          folder: `${this.draft().slug}/logo`,
          publicId: 'logo',
        });
        logoUrl = secureUrl;
      } catch (e) {
        this.creating.set(false);
        this.error.set(e instanceof Error ? `No se pudo subir el logo: ${e.message}` : 'No se pudo subir el logo.');
        return;
      }
    }

    const d = this.draft();
    this.tenantAdmin.create(
      {
        name: d.name,
        slug: d.slug,
        rubro: d.rubro,
        layout: this.draftLayout(),
        brandColor: this.draftBrandColor() ?? undefined,
        headerColor: this.draftHeaderColor() ?? undefined,
        footerColor: this.draftFooterColor() ?? undefined,
        textColor: this.draftTextColor() ?? undefined,
        pageBackgroundColor: this.draftPageBgColor() ?? undefined,
        whatsappNumber: this.whatsappNumber().trim() || undefined,
        instagram: this.instagram().trim() || undefined,
        facebookUrl: this.facebookUrl().trim() || undefined,
        logoUrl,
        logoShape: this.logoShape(),
      },
      (tenant) => {
        this.creating.set(false);
        this.logoDataUrl.set(null);
        this.demoTenant.view(tenant.slug);
        this.created.emit(tenant);
        this.step.set(7);
      },
      () => {
        this.creating.set(false);
        this.error.set('No se pudo crear la tienda. Revisá el identificador (puede que ya exista).');
      }
    );
  }

  verPagina(): void {
    window.open('/', '_blank');
  }

  cancel(): void {
    if (document.fullscreenElement) document.exitFullscreen();
    this.logoDataUrl.set(null);
    this.cancelled.emit();
  }
}
