import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Permission, Role } from '../../../core/models/permission.model';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent {
  private readonly svc = inject(UserAdminService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly users = this.svc.users;
  readonly roles = this.svc.roles;
  readonly permissions = this.svc.permissions;
  readonly loading = this.svc.loading;
  readonly saving = this.svc.saving;
  readonly error = this.svc.error;

  readonly myUsername = computed(() => this.auth.me()?.username ?? '');

  readonly tab = signal<'usuarios' | 'roles'>('usuarios');

  // --- alta de usuario ---
  readonly newUsername = signal('');
  readonly newPassword = signal('');
  readonly newRoleId = signal('');
  readonly userFormOpen = signal(false);

  // --- edición / alta de rol ---
  readonly roleFormOpen = signal(false);
  readonly editingRole = signal<Role | null>(null);
  readonly roleName = signal('');
  readonly rolePerms = signal<Set<Permission>>(new Set());

  constructor() {
    this.svc.load();
  }

  reload(): void {
    this.svc.load();
  }

  roleName_(id: string | null): string {
    return this.roles().find((r) => r.id === id)?.name ?? '—';
  }

  // --- usuarios ---
  createUser(): void {
    const username = this.newUsername().trim();
    const password = this.newPassword();
    const roleId = this.newRoleId();
    if (username.length < 3 || password.length < 4 || !roleId) {
      this.toast.error('Completá usuario (3+), contraseña (4+) y rol.');
      return;
    }
    this.svc.createUser({ username, password, roleId }, () => {
      this.toast.success('Usuario creado.');
      this.newUsername.set('');
      this.newPassword.set('');
      this.newRoleId.set('');
      this.userFormOpen.set(false);
    });
  }

  changeUserRole(id: string, roleId: string): void {
    this.svc.updateUser(id, { roleId }, () => this.toast.success('Rol actualizado.'));
  }

  toggleUserEnabled(id: string, enabled: boolean): void {
    this.svc.updateUser(id, { enabled: !enabled });
  }

  async resetPassword(id: string, username: string): Promise<void> {
    const pass = await this.confirm.prompt({
      title: `Cambiar contraseña de ${username}`,
      message: 'Ingresá la contraseña nueva (mínimo 4 caracteres).',
      confirmLabel: 'Cambiar',
      input: { label: 'Contraseña nueva', type: 'password', placeholder: '••••' },
    });
    if (pass === null) return;
    if (pass.length >= 4) {
      this.svc.updateUser(id, { password: pass }, () => this.toast.success('Contraseña cambiada.'));
    } else {
      this.toast.error('La contraseña tiene que tener al menos 4 caracteres.');
    }
  }

  async deleteUser(id: string, username: string): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Borrar usuario',
      message: `¿Borrar el usuario "${username}"?`,
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (ok) this.svc.deleteUser(id);
  }

  // --- roles ---
  openNewRole(): void {
    this.editingRole.set(null);
    this.roleName.set('');
    this.rolePerms.set(new Set());
    this.roleFormOpen.set(true);
  }

  openEditRole(role: Role): void {
    this.editingRole.set(role);
    this.roleName.set(role.name);
    this.rolePerms.set(new Set(role.permissions));
    this.roleFormOpen.set(true);
  }

  togglePerm(p: Permission): void {
    this.rolePerms.update((set) => {
      const next = new Set(set);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  hasPerm(p: Permission): boolean {
    return this.rolePerms().has(p);
  }

  saveRole(): void {
    const name = this.roleName().trim();
    if (!name) {
      this.toast.error('Poné un nombre para el rol.');
      return;
    }
    const input = { name, permissions: [...this.rolePerms()] };
    const done = () => {
      this.toast.success('Rol guardado.');
      this.roleFormOpen.set(false);
    };
    const editing = this.editingRole();
    if (editing) this.svc.updateRole(editing.id, input, done);
    else this.svc.createRole(input, done);
  }

  async deleteRole(role: Role): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Borrar rol',
      message: `¿Borrar el rol "${role.name}"?`,
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (ok) this.svc.deleteRole(role.id);
  }
}
