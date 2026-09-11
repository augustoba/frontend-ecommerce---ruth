/** Permisos ("objetos") que se le asignan a un rol. Espejo del enum del backend. */
export type Permission =
  | 'PRODUCTS_VIEW'
  | 'PRODUCTS_MANAGE'
  | 'ORDERS_VIEW'
  | 'ORDERS_MANAGE'
  | 'POS_USE'
  | 'EXCHANGES_USE'
  | 'CASH_REGISTER_VIEW'
  | 'PARAMS_MANAGE'
  | 'SIZE_SCALES_MANAGE'
  | 'SUPPLIERS_MANAGE'
  | 'DISCOUNTS_MANAGE'
  | 'COUPONS_MANAGE'
  | 'METRICS_VIEW'
  | 'CAROUSEL_MANAGE'
  | 'SETTINGS_MANAGE'
  | 'USERS_MANAGE';

/** Info de un permiso para armar los checkboxes (viene de `/api/admin/permissions`). */
export interface PermissionInfo {
  key: Permission;
  label: string;
}

export interface Role {
  id: string;
  name: string;
  system: boolean;
  permissions: Permission[];
  userCount: number;
}

export interface RoleInput {
  name: string;
  permissions: Permission[];
}

export interface AdminUser {
  id: string;
  /** DNI para cuentas nuevas (ver AdminUser.java); las viejas pueden tener otro texto. */
  username: string;
  roleId: string | null;
  roleName: string | null;
  systemAdmin: boolean;
  enabled: boolean;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface CreateUserInput {
  /** DNI del usuario: es lo que va a usar para loguearse. */
  username: string;
  password: string;
  roleId: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateUserInput {
  roleId?: string;
  enabled?: boolean;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}
