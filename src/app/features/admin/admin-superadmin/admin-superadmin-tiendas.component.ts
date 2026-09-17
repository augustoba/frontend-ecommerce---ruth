import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RubroOption, TenantAdminService, TenantRecord } from '../../../core/services/tenant-admin.service';
import { DemoTenantService } from '../../../core/services/demo-tenant.service';
import { ToastService } from '../../../core/services/toast.service';
import { TenantDraft, TenantWizardComponent } from './tenant-wizard.component';

/**
 * Asistente "Crear tienda" (ver PLAN_SAAS.md Fase 9/10): nombre/slug/rubro
 * acá mismo, y desde "Siguiente" se abre `TenantWizardComponent` — diseño →
 * color → identidad → confirmar — TODO en borrador, sin crear nada hasta
 * el "Crear tienda" del último paso (así la tienda nace ya configurada, no
 * vacía). Acceso rápido a tiendas existentes vía el selector de tienda modo
 * demo (`DemoTenantService` + header `X-Demo-Tenant`). Sólo superadmin.
 */
@Component({
  selector: 'app-admin-superadmin-tiendas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TenantWizardComponent],
  templateUrl: './admin-superadmin-tiendas.component.html',
})
export class AdminSuperadminTiendasComponent {
  private readonly tenantAdmin = inject(TenantAdminService);
  private readonly demoTenant = inject(DemoTenantService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly tenants = this.tenantAdmin.tenants;
  readonly status = this.tenantAdmin.status;
  readonly saving = this.tenantAdmin.saving;
  readonly currentDemoSlug = this.demoTenant.slug;
  /** Datos de la tienda en borrador mientras el asistente está abierto — null = cerrado. */
  readonly wizardDraft = signal<TenantDraft | null>(null);

  /** Tienda que se está por borrar (confirmación abierta) — null = cerrada. Borrado permanente e irreversible. */
  readonly deleteTarget = signal<TenantRecord | null>(null);
  readonly deleteConfirmText = signal('');
  readonly deleting = signal(false);
  readonly canConfirmDelete = computed(() => {
    const t = this.deleteTarget();
    return !!t && this.deleteConfirmText().trim() === t.slug && !this.deleting();
  });

  readonly rubros = signal<RubroOption[]>([]);

  readonly name = signal('');
  readonly slug = signal('');
  readonly rubro = signal('');
  readonly slugTouched = signal(false);
  readonly error = signal<string | null>(null);

  readonly canSubmit = computed(
    () => this.name().trim().length > 0 && this.slug().trim().length > 0 && this.rubro().length > 0 && !this.saving()
  );

  constructor() {
    this.tenantAdmin.ensureLoaded();
    this.tenantAdmin.rubros().subscribe((opts) => {
      this.rubros.set(opts);
      if (opts.length && !this.rubro()) this.rubro.set(opts[0].value);
    });
  }

  patchName(v: string): void {
    this.name.set(v);
    if (!this.slugTouched()) this.slug.set(slugify(v));
  }

  patchSlug(v: string): void {
    this.slugTouched.set(true);
    this.slug.set(v);
  }

  /** No crea nada todavía — abre el asistente en borrador (diseño → color → identidad → confirmar). */
  submit(): void {
    if (!this.canSubmit()) return;
    this.error.set(null);
    this.wizardDraft.set({ name: this.name().trim(), slug: this.slug().trim(), rubro: this.rubro() });
  }

  /** El asistente creó la tienda (paso "Confirmar") — limpiar el form y refrescar el listado. */
  onTenantCreated(tenant: TenantRecord): void {
    this.toast.success(`Tienda "${tenant.name}" creada.`);
    this.name.set('');
    this.slug.set('');
    this.slugTouched.set(false);
  }

  cerrarAsistente(): void {
    this.wizardDraft.set(null);
  }

  /**
   * Activa el selector de tienda modo demo con esta tienda y va a mirarla —
   * a la home pública si tiene sitio ecommerce, o directo al punto de venta
   * si es una tienda sólo-POS (no tiene sentido mandarla a `/`, que le da
   * 503 "sin sitio online").
   */
  ver(tenant: TenantRecord): void {
    this.demoTenant.view(tenant.slug);
    const destino = tenant.ecommerceSiteEnabled ? '/' : '/admin/kiosco';
    this.router.navigateByUrl(destino).then(() => window.location.reload());
  }

  /**
   * Activa el selector de tienda modo demo con esta tienda y va a
   * "Configuración del sitio" — el superadmin edita identidad, redes,
   * WhatsApp, logo, carrusel y apariencia de CUALQUIER tienda desde acá
   * (ver PLAN_SAAS.md Fase 10): las pantallas de `/admin/config` ya
   * resuelven todo contra el tenant activo del demo-switch, no hace falta
   * un usuario admin propio de esa tienda.
   */
  configurar(tenant: TenantRecord): void {
    this.demoTenant.view(tenant.slug);
    this.router.navigateByUrl('/admin/config').then(() => window.location.reload());
  }

  /** Pausa (deja de poder verse el storefront) o reanuda una tienda — el panel de esa tienda sigue accesible siempre. */
  togglePausar(tenant: TenantRecord): void {
    const active = !tenant.active;
    this.tenantAdmin.setActive(
      tenant.id,
      active,
      () => this.toast.success(active ? `"${tenant.name}" reanudada.` : `"${tenant.name}" pausada — su sitio dejó de verse.`),
      () => this.toast.error('No se pudo cambiar el estado. Probá de nuevo.')
    );
  }

  openDeleteConfirm(tenant: TenantRecord): void {
    this.deleteTarget.set(tenant);
    this.deleteConfirmText.set('');
  }

  closeDeleteConfirm(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
    this.deleteConfirmText.set('');
  }

  /** Borrado permanente — sólo se habilita cuando `deleteConfirmText` matchea el slug exacto. */
  confirmDelete(): void {
    const tenant = this.deleteTarget();
    if (!tenant || !this.canConfirmDelete()) return;
    this.deleting.set(true);
    this.tenantAdmin.deleteTenant(
      tenant.id,
      this.deleteConfirmText().trim(),
      () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.deleteConfirmText.set('');
        this.toast.success(`"${tenant.name}" y todos sus datos fueron eliminados.`);
      },
      (message) => {
        this.deleting.set(false);
        this.toast.error(message || 'No se pudo eliminar la tienda.');
      }
    );
  }

  volverADefault(): void {
    this.demoTenant.clear();
    this.router.navigateByUrl('/').then(() => window.location.reload());
  }
}

function slugify(v: string): string {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
