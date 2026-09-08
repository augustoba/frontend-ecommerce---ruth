/**
 * Escala de talle: un conjunto de talles con nombre (ej: "Ropa niños",
 * "Calzado adultos"). Editable desde /admin/talles. Cada producto elige una
 * escala y sus talles salen de ahí — la ropa de bebé se mide por edad, la de
 * niños por número, el calzado por otro número, etc.
 */
export interface SizeScale {
  /** Id estable (ej: 'escala-ninos') */
  id: string;
  name: string;
  /** Talles de la escala, en orden (ej: ['1','2','3','4','6','8',...]) */
  values: string[];
  /** true = escala de sistema: no se puede eliminar (sí editar sus valores) */
  system: boolean;
  createdAt: string;
}

/** Escalas por defecto. IDs fijos para que la migración sea determinista. */
export function defaultSizeScales(): SizeScale[] {
  const now = new Date().toISOString();
  const mk = (id: string, name: string, values: string[]): SizeScale => ({
    id,
    name,
    values,
    system: true,
    createdAt: now,
  });
  return [
    mk('escala-bebe', 'Ropa bebé (por edad)', [
      'RN', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '24M',
    ]),
    mk('escala-ninos', 'Ropa niños', ['1', '2', '3', '4', '6', '8', '10', '12', '14', '16']),
    mk('escala-adultos', 'Ropa adultos', ['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    mk(
      'escala-calzado-ninos',
      'Calzado niños',
      range(17, 34).map(String)
    ),
    mk(
      'escala-calzado-adultos',
      'Calzado adultos',
      range(34, 46).map(String)
    ),
  ];
}

function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let n = from; n <= to; n++) out.push(n);
  return out;
}

/**
 * Devuelve el id de la escala por defecto más "ajustada" que contiene todos los
 * talles dados (para migrar productos viejos que no tienen `sizeScaleId`).
 * null si ninguna escala los contiene a todos.
 */
export function inferSizeScaleId(sizes: string[]): string | undefined {
  if (!sizes.length) return undefined;
  const candidates = defaultSizeScales()
    .filter((scale) => sizes.every((s) => scale.values.includes(s)))
    .sort((a, b) => a.values.length - b.values.length);
  return candidates[0]?.id;
}
