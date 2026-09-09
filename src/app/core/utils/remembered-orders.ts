const STORAGE_KEY = 'pp_my_orders';

export interface RememberedOrder {
  code: string;
  name: string;
}

/** Lee la lista de "mis pedidos" guardada en este navegador. */
export function loadRememberedOrders(): RememberedOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Guarda un pedido en la lista de "mis pedidos" (se llama tras crear el pedido en el carrito). */
export function rememberOrder(code: string, name: string): void {
  if (!code || !name.trim()) return;
  try {
    const list = loadRememberedOrders();
    if (!list.some((o) => o.code === code)) {
      list.unshift({ code, name: name.trim() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
    }
  } catch {
    /* ignore */
  }
}

/** Saca un pedido de la lista. */
export function forgetRememberedOrder(code: string): RememberedOrder[] {
  try {
    const list = loadRememberedOrders().filter((o) => o.code !== code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch {
    return loadRememberedOrders();
  }
}
