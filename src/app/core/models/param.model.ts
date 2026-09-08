/**
 * Parametrías: grupos de clasificación editables desde el panel de admin
 * (ej: "Público", "Tipo de prenda", "Estación"), en vez de tener las
 * categorías escritas a mano en el código. Cada producto elige una o varias
 * opciones de cada grupo, y los descuentos pueden apuntar a una opción
 * puntual (ej: "todo lo de bebé 15% off").
 */

export interface ParamOption {
  /** Id estable (ej: 'publico-bebe') — se guarda en el producto y en los descuentos */
  id: string;
  label: string;
}

export interface ParamGroup {
  /** Id estable (ej: 'grp-publico') */
  id: string;
  name: string;
  /** true = el producto puede tener varias opciones de este grupo (ej: Estación) */
  multiple: boolean;
  /** true = aparece como filtro en el catálogo público */
  showInCatalog: boolean;
  /** true = grupo de sistema: no se puede eliminar (sí editar sus opciones) */
  system: boolean;
  options: ParamOption[];
}

/** Opciones elegidas por un producto: { [groupId]: optionId[] } */
export type ProductParams = Record<string, string[]>;
