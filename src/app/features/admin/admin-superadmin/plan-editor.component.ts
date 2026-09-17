import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanAdminService, PlanRecord } from '../../../core/services/plan-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { MODULE_OPTIONS } from '../../../core/models/plan-module.model';

const BUSINESS_MODEL_LABELS: Record<string, string> = {
  ECOMMERCE: 'Ecommerce',
  POS: 'Punto de venta',
};

/**
 * Una tarjeta editable por plan (límites, módulos, branding) — Fase 17: el
 * `businessModel` del plan (fijo, no se edita acá) filtra qué módulos se
 * pueden tildar, así no aparece "Mercado Pago" como opción en un plan de
 * Punto de venta ni "Punto de venta (kiosco)" en uno de Ecommerce. Self-
 * contained: guarda directo contra `PlanAdminService`, no emite eventos.
 */
@Component({
  selector: 'app-plan-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './plan-editor.component.html',
})
export class PlanEditorComponent {
  private readonly planAdmin = inject(PlanAdminService);
  private readonly toast = inject(ToastService);

  readonly plan = input.required<PlanRecord>();
  readonly saving = this.planAdmin.saving;

  readonly businessModelLabel = computed(() => BUSINESS_MODEL_LABELS[this.plan().businessModel] ?? this.plan().businessModel);

  /** Sólo los módulos compatibles con el modelo de negocio de este plan — el resto ni se muestra. */
  readonly moduleOptions = computed(() => {
    const compatible = new Set(this.plan().compatibleModules);
    return MODULE_OPTIONS.filter((m) => compatible.has(m.key));
  });

  private readonly touched = signal(false);
  private seeded = false;

  readonly name = signal('');
  readonly maxProducts = signal('');
  readonly maxAdminUsers = signal('');
  readonly enabledModules = signal<Set<string>>(new Set());
  readonly showPlatformBranding = signal(false);

  constructor() {
    // Los signal inputs recién quedan seteados de verdad al primer ciclo de
    // detección de cambios, no en el constructor — por eso se siembra el
    // draft acá adentro (sólo la primera vez) en vez de leer `plan()` directo
    // arriba.
    effect(() => {
      const p = this.plan();
      if (this.seeded) return;
      this.seeded = true;
      this.name.set(p.name);
      this.maxProducts.set(p.maxProducts != null ? String(p.maxProducts) : '');
      this.maxAdminUsers.set(p.maxAdminUsers != null ? String(p.maxAdminUsers) : '');
      this.enabledModules.set(new Set(p.enabledModules));
      this.showPlatformBranding.set(p.showPlatformBranding);
    });
  }

  readonly dirty = this.touched.asReadonly();

  setName(v: string): void {
    this.touched.set(true);
    this.name.set(v);
  }

  /** `v` llega como `number` desde un `<input type="number">` — se guarda como string igual, `''` incluida. */
  setMaxProducts(v: string | number): void {
    this.touched.set(true);
    this.maxProducts.set(String(v ?? ''));
  }

  setMaxAdminUsers(v: string | number): void {
    this.touched.set(true);
    this.maxAdminUsers.set(String(v ?? ''));
  }

  toggleModule(key: string): void {
    this.touched.set(true);
    const next = new Set(this.enabledModules());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.enabledModules.set(next);
  }

  hasModule(key: string): boolean {
    return this.enabledModules().has(key);
  }

  setShowPlatformBranding(v: boolean): void {
    this.touched.set(true);
    this.showPlatformBranding.set(v);
  }

  save(): void {
    if (this.saving() || !this.name().trim()) return;
    this.planAdmin.update(
      this.plan().id,
      {
        name: this.name().trim(),
        maxProducts: parseLimit(this.maxProducts()),
        maxAdminUsers: parseLimit(this.maxAdminUsers()),
        enabledModules: [...this.enabledModules()],
        showPlatformBranding: this.showPlatformBranding(),
      },
      () => {
        this.touched.set(false);
        this.toast.success('Plan actualizado.');
      }
    );
  }
}

/**
 * Campo vacío = sin límite (null); si no, un entero >= 0. `raw` en la
 * práctica puede llegar como `number` (un `<input type="number">` con
 * `ngModelChange` manda el valor ya convertido, no el string del input).
 */
function parseLimit(raw: string | number): number | null {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}
