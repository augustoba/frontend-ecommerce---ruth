/**
 * Diseños de tienda disponibles. Cada id tiene un componente de plantilla en
 * `features/catalog/templates/` y, si necesita CSS propio, un bloque
 * `[data-layout="id"]` en `styles.css`.
 *
 * Para agregar un diseño nuevo: (1) sumar la entrada acá, (2) crear el
 * componente de plantilla y su `@case` en `catalog-page.component.html`,
 * (3) sumar el id al `@Pattern` de `SiteSettingsDtos.AppearanceRequest` en el
 * backend — si no está ahí, el PUT devuelve 400 aunque el frontend lo ofrezca.
 */
export interface LayoutOption {
  id: string;
  label: string;
  /** En qué se diferencia de los otros. Se muestra en la pantalla de Diseño. */
  blurb: string;
  /** Color de acento de la miniatura, fijo para que se distingan entre sí. */
  previewColor: string;
  /**
   * Tipografías del diseño, como `<link>` de Google Fonts. Se inyectan con
   * `ensureLayoutFonts` y no están en `index.html`: el que viene ahí (Baloo 2 +
   * Nunito) es el de Ruth, así la tienda no baja fuentes que no usa.
   */
  fontsHref?: string;
}

export const DEFAULT_LAYOUT = 'ruth';

export const LAYOUTS: LayoutOption[] = [
  {
    id: 'ruth',
    label: 'Ruth',
    blurb: 'El diseño original: cálido, centrado, con el logo redondo arriba y la grilla pareja.',
    previewColor: '#f97316',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    blurb: 'Tipo revista: título enorme a la izquierda, foto a sangre y grilla asimétrica sin marcos.',
    previewColor: '#1c1917',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500&family=Inter:wght@300;400;500;600&display=swap',
  },
  {
    id: 'pop',
    label: 'Pop',
    blurb: 'Bien infantil y ruidoso: bordes gruesos, sombras duras, calcomanías rotadas y marquesina.',
    previewColor: '#3957ff',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap',
  },
];

export function isKnownLayout(id: string | null | undefined): boolean {
  return !!id && LAYOUTS.some((l) => l.id === id);
}

export function layoutById(id: string | null | undefined): LayoutOption | undefined {
  return LAYOUTS.find((l) => l.id === id);
}

/**
 * Carga las Google Fonts del diseño una sola vez por id.
 *
 * La llama `AppComponent` con el diseño activo, y la pantalla de Diseño del
 * admin con los tres: en `/admin` el `data-layout` global está sacado a
 * propósito, así que sin esto las miniaturas se verían con la tipografía del
 * sistema en vez de la real de cada diseño.
 */
export function ensureLayoutFonts(layoutId: string): void {
  const href = layoutById(layoutId)?.fontsHref;
  if (!href || document.querySelector(`link[data-layout-fonts="${layoutId}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-layout-fonts', layoutId);
  document.head.appendChild(link);
}
