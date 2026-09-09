import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { apiUrl } from '../config/site-config';
import {
  AdminUser,
  CreateUserInput,
  PermissionInfo,
  Role,
  RoleInput,
  UpdateUserInput,
} from '../models/permission.model';

/** Gestión de usuarios y roles del panel (requiere el permiso USERS_MANAGE). */
@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly http = inject(HttpClient);

  readonly users = signal<AdminUser[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly permissions = signal<PermissionInfo[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal(false);

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    Promise.all([
      firstValueFrom(this.http.get<AdminUser[]>(apiUrl('/admin/users'))),
      firstValueFrom(this.http.get<Role[]>(apiUrl('/admin/roles'))),
      firstValueFrom(this.http.get<PermissionInfo[]>(apiUrl('/admin/permissions'))),
    ])
      .then(([users, roles, perms]) => {
        this.users.set(users ?? []);
        this.roles.set(roles ?? []);
        this.permissions.set(perms ?? []);
        this.loading.set(false);
      })
      .catch(() => {
        this.loading.set(false);
        this.error.set(true);
      });
  }

  private run(obs: Observable<unknown>, onDone?: () => void): void {
    this.saving.set(true);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
        onDone?.();
      },
      error: () => this.saving.set(false),
    });
  }

  createRole(input: RoleInput, onDone?: () => void): void {
    this.run(this.http.post(apiUrl('/admin/roles'), input), onDone);
  }
  updateRole(id: string, input: RoleInput, onDone?: () => void): void {
    this.run(this.http.put(apiUrl(`/admin/roles/${id}`), input), onDone);
  }
  deleteRole(id: string): void {
    this.run(this.http.delete(apiUrl(`/admin/roles/${id}`)));
  }

  createUser(input: CreateUserInput, onDone?: () => void): void {
    this.run(this.http.post(apiUrl('/admin/users'), input), onDone);
  }
  updateUser(id: string, input: UpdateUserInput, onDone?: () => void): void {
    this.run(this.http.put(apiUrl(`/admin/users/${id}`), input), onDone);
  }
  deleteUser(id: string): void {
    this.run(this.http.delete(apiUrl(`/admin/users/${id}`)));
  }
}
