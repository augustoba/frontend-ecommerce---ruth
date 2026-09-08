/**
 * Proveedor al que el admin le compra prendas. Es info **interna del panel**:
 * nunca se muestra en la tienda, la ficha pública, el carrito ni el mensaje
 * de WhatsApp. Se da de alta una vez en /admin/proveedores y se reusa en
 * muchos productos.
 */
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

/** Datos con los que se crea/edita un proveedor */
export type SupplierInput = Omit<Supplier, 'id'>;
