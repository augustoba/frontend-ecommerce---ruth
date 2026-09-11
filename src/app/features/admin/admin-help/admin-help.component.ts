import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Edita el contenido de la página pública "Cómo comprar" y las Preguntas
 * frecuentes. Ambos son texto libre; el FAQ se separa en bloques por línea en
 * blanco (la primera línea de cada bloque es la pregunta).
 */
@Component({
  selector: 'app-admin-help',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-help.component.html',
})
export class AdminHelpComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  readonly status = this.settingsService.status;
  readonly saving = this.settingsService.saving;
  readonly reload = () => this.settingsService.reload();

  readonly helpText = signal('');
  readonly faqText = signal('');
  private touched = false;

  readonly dirty = computed(() => {
    const s = this.settingsService.settings();
    return this.helpText() !== (s.helpText ?? '') || this.faqText() !== (s.faqText ?? '');
  });

  constructor() {
    this.settingsService.ensureLoaded();
    effect(() => {
      const s = this.settingsService.settings();
      if (!this.touched) {
        this.helpText.set(s.helpText ?? '');
        this.faqText.set(s.faqText ?? '');
      }
    });
  }

  edit(which: 'help' | 'faq', value: string): void {
    this.touched = true;
    if (which === 'help') this.helpText.set(value);
    else this.faqText.set(value);
  }

  save(): void {
    if (this.saving()) return;
    this.settingsService
      .updatePlatform({
        helpText: this.helpText().trim() || null,
        faqText: this.faqText().trim() || null,
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          this.touched = false;
          this.toast.success('Contenido de ayuda guardado.');
        } else {
          this.toast.error('No se pudo guardar. Probá de nuevo.');
        }
      });
  }
}
