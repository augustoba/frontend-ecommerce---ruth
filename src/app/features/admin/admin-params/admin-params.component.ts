import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParamService } from '../../../core/services/param.service';

@Component({
  selector: 'app-admin-params',
  imports: [FormsModule],
  templateUrl: './admin-params.component.html',
  styleUrl: './admin-params.component.css',
})
export class AdminParamsComponent {
  private readonly paramService = inject(ParamService);

  readonly groups = this.paramService.groups;

  /** Texto del nuevo valor por cada grupo (id del grupo → texto tipeado) */
  readonly newOptionLabel = signal<Record<string, string>>({});

  readonly newGroupName = signal('');
  readonly newGroupMultiple = signal(false);
  readonly newGroupShowInCatalog = signal(true);
  readonly error = signal<string | null>(null);

  // --- Grupos ---

  renameGroup(id: string, name: string): void {
    if (name.trim()) this.paramService.updateGroup(id, { name });
  }

  toggleMultiple(id: string, value: boolean): void {
    this.paramService.updateGroup(id, { multiple: value });
  }

  toggleShowInCatalog(id: string, value: boolean): void {
    this.paramService.updateGroup(id, { showInCatalog: value });
  }

  removeGroup(id: string, name: string): void {
    if (window.confirm(`¿Eliminar la parametría "${name}" y todas sus opciones?`)) {
      this.paramService.removeGroup(id);
    }
  }

  addGroup(): void {
    this.error.set(null);
    const name = this.newGroupName().trim();
    if (name.length < 2) {
      this.error.set('Poné un nombre de al menos 2 caracteres.');
      return;
    }
    this.paramService.addGroup(name, {
      multiple: this.newGroupMultiple(),
      showInCatalog: this.newGroupShowInCatalog(),
    });
    this.newGroupName.set('');
    this.newGroupMultiple.set(false);
    this.newGroupShowInCatalog.set(true);
  }

  // --- Opciones ---

  optionDraft(groupId: string): string {
    return this.newOptionLabel()[groupId] ?? '';
  }

  setOptionDraft(groupId: string, value: string): void {
    this.newOptionLabel.update((current) => ({ ...current, [groupId]: value }));
  }

  addOption(groupId: string): void {
    const label = this.optionDraft(groupId).trim();
    if (!label) return;
    this.paramService.addOption(groupId, label);
    this.setOptionDraft(groupId, '');
  }

  renameOption(groupId: string, optionId: string, label: string): void {
    this.paramService.updateOption(groupId, optionId, label);
  }

  removeOption(groupId: string, optionId: string, label: string): void {
    if (window.confirm(`¿Eliminar la opción "${label}"?`)) {
      this.paramService.removeOption(groupId, optionId);
    }
  }

  resetDefaults(): void {
    if (window.confirm('¿Restaurar las parametrías de ejemplo? Se pierden los cambios.')) {
      this.paramService.resetToDefaults();
    }
  }
}
