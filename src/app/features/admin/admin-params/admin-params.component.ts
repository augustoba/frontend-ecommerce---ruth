import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParamService } from '../../../core/services/param.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-admin-params',
  imports: [FormsModule],
  templateUrl: './admin-params.component.html',
  styleUrl: './admin-params.component.css',
})
export class AdminParamsComponent {
  private readonly paramService = inject(ParamService);
  private readonly confirm = inject(ConfirmService);

  readonly groups = this.paramService.groups;
  readonly status = this.paramService.status;
  readonly saving = this.paramService.saving;
  readonly reload = () => this.paramService.reload();

  constructor() {
    this.paramService.ensureLoaded();
  }

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

  async removeGroup(id: string, name: string): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Eliminar parametría',
      message: `¿Eliminar la parametría "${name}" y todas sus opciones?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (ok) this.paramService.removeGroup(id);
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

  async removeOption(groupId: string, optionId: string, label: string): Promise<void> {
    const ok = await this.confirm.confirm({
      message: `¿Eliminar la opción "${label}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (ok) this.paramService.removeOption(groupId, optionId);
  }
}
