/** Permisos ("objetos") que se le asignan a un rol. Espejo del enum del backend. */
export type Permission =
  | 'PRODUCTS_VIEW'
  | 'PRODUCTS_MANAGE'
  | 'ORDERS_VIEW'
  | 'ORDERS_MANAGE'
  | 'POS_USE'
  | 'EXCHANGES_USE'
  | 'CASH_REGISTER_VIEW'
  | 'SHIFTS_MANAGE'
  | 'PARAMS_MANAGE'
  | 'SIZE_SCALES_MANAGE'
  | 'SUPPLIERS_MANAGE'
  | 'DISCOUNTS_MANAGE'
  | 'COUPONS_MANAGE'
  | 'MARKETING_MANAGE'
  | 'METRICS_VIEW'
  | 'CAROUSEL_MANAGE'
  | 'PAYMENTS_MANAGE'
  | 'PLATFORM_SETTINGS_MANAGE'
  | 'USERS_MANAGE'
  | 'STOCK_MOVEMENTS_VIEW'
  | 'EXPENSES_MANAGE'
  | 'FINANCE_VIEW';

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
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  roleId: string | null;
  roleName: string | null;
  systemAdmin: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  roleId: string;
  enabled?: boolean;
}

export interface UpdateUserInput {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  roleId?: string;
  enabled?: boolean;
  password?: string;
}
