/**
 * Escala de talle: un conjunto de talles con nombre (ej: "Ropa niños",
 * "Calzado adultos"). Editable desde /admin/talles. Cada producto elige una
 * escala y sus talles salen de ahí.
 */
export interface SizeScale {
  /** Id estable (ej: 'escala-ninos') */
  id: string;
  name: string;
  /** Talles de la escala, en orden (ej: ['1','2','3','4','6','8',...]) */
  values: string[];
  /** true = escala de sistema: no se puede eliminar (sí editar sus valores) */
  system: boolean;
}
