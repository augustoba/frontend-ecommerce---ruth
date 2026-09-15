import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RubroOption, TenantAdminService, TenantRecord } from '../../../core/services/tenant-admin.service';
import { DemoTenantService } from '../../../core/services/demo-tenant.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Asistente "Crear tienda" (ver PLAN_SAAS.md Fase 9): alta de un tenant
 * nuevo eligiendo un rubro de una lista extensible, y acceso rápido para
 * verlo funcionando en local vía el selector de tienda modo demo
 * (`DemoTenantService` + header `X-Demo-Tenant`). Sólo superadmin.
 */
@Component({
  selector: 'app-admin-superadmin-tiendas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
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

  submit(): void {
    if (!this.canSubmit()) return;
    this.error.set(null);
    this.tenantAdmin.create(
      { name: this.name().trim(), slug: this.slug().trim(), rubro: this.rubro() },
      (tenant) => {
        this.toast.success(`Tienda "${tenant.name}" creada.`);
        this.name.set('');
        this.slug.set('');
        this.slugTouched.set(false);
        this.ver(tenant);
      },
      () => this.error.set('No se pudo crear la tienda. Revisá el identificador (puede que ya exista).')
    );
  }

  /** Activa el selector de tienda modo demo con esta tienda y va a la home pública a mirarla. */
  ver(tenant: TenantRecord): void {
    this.demoTenant.view(tenant.slug);
    this.router.navigateByUrl('/').then(() => window.location.reload());
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
