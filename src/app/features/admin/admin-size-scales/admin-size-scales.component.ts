import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SizeScaleService } from '../../../core/services/size-scale.service';

@Component({
  selector: 'app-admin-size-scales',
  imports: [FormsModule],
  templateUrl: './admin-size-scales.component.html',
  styleUrl: './admin-size-scales.component.css',
})
export class AdminSizeScalesComponent {
  private readonly sizeScaleService = inject(SizeScaleService);

  readonly scales = this.sizeScaleService.scales;
  readonly status = this.sizeScaleService.status;
  readonly saving = this.sizeScaleService.saving;
  readonly reload = () => this.sizeScaleService.reload();

  constructor() {
    this.sizeScaleService.ensureLoaded();
  }

  /** Texto del nuevo talle por cada escala (id de la escala → texto tipeado) */
  readonly newValue = signal<Record<string, string>>({});

  readonly newScaleName = signal('');
  readonly error = signal<string | null>(null);

  renameScale(id: string, name: string): void {
    if (name.trim()) this.sizeScaleService.updateName(id, name);
  }

  removeScale(id: string, name: string): void {
    if (window.confirm(`¿Eliminar la escala "${name}"?`)) {
      this.sizeScaleService.remove(id);
    }
  }

  addScale(): void {
    this.error.set(null);
    const name = this.newScaleName().trim();
    if (name.length < 2) {
      this.error.set('Poné un nombre de al menos 2 caracteres.');
      return;
    }
    this.sizeScaleService.add(name);
    this.newScaleName.set('');
  }

  valueDraft(scaleId: string): string {
    return this.newValue()[scaleId] ?? '';
  }

  setValueDraft(scaleId: string, value: string): void {
    this.newValue.update((current) => ({ ...current, [scaleId]: value }));
  }

  addValue(scaleId: string): void {
    const value = this.valueDraft(scaleId).trim();
    if (!value) return;
    this.sizeScaleService.addValue(scaleId, value);
    this.setValueDraft(scaleId, '');
  }

  renameValue(scaleId: string, oldValue: string, newValue: string): void {
    this.sizeScaleService.renameValue(scaleId, oldValue, newValue);
  }

  removeValue(scaleId: string, value: string): void {
    this.sizeScaleService.removeValue(scaleId, value);
  }
}
