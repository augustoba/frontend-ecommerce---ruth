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
  {
    id: 'vidriera',
    label: 'Vidriera',
    blurb:
      'La home como catálogo por categorías: un riel que se desliza por cada público (bebé, nena, nene) y el catálogo completo al final.',
    previewColor: '#d99a2b',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Karla:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'ofertas',
    label: 'Ofertas',
    blurb:
      'Sin hero: arriba la barra con las promos que cargaste en el panel, filtros en columna y grilla apretada de 4 con el precio grande.',
    previewColor: '#e11d2e',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&display=swap',
  },
  {
    id: 'fichero',
    label: 'Fichero',
    blurb:
      'Ficha técnica: una prenda destacada en grande con su descripción y sus talles, y el catálogo en filas en vez de grilla.',
    previewColor: '#1e3a8a',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'mosaico',
    label: 'Mosaico',
    blurb:
      'Un tablero de piezas de distinto tamaño: carrusel, foto del local, tu "sobre nosotros" y una categoría, con la grilla abajo.',
    previewColor: '#4f46e5',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'nova',
    label: 'Nova',
    blurb:
      'El más de ahora: hero a pantalla completa con la foto en movimiento, vidrio, tarjetas que se inclinan con el mouse y el catálogo que sigue cargando solo.',
    previewColor: '#f0288f',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  },
  {
    id: 'neon',
    label: 'Neón',
    blurb:
      'El disruptivo: fondo oscuro con grilla luminosa, tipografía arcade, banners de promo que giran y brillan, y las prendas que se dan vuelta al pasar el mouse.',
    previewColor: '#22d3ee',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rubik:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'caramelo',
    label: 'Caramelo',
    blurb:
      'Para los más chicos: rayos que giran detrás del logo, manchas pastel que flotan, ondas que corren y tarjetas que se aplastan como un caramelo.',
    previewColor: '#22c39f',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Grandstander:wght@400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap',
  },
  {
    id: 'cohete',
    label: 'Cohete',
    blurb:
      'Un viaje espacial: cielo estrellado que titila, órbitas que giran, una nave que cruza la pantalla y estrellas fugaces.',
    previewColor: '#6366f1',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Bungee&family=Varela+Round&display=swap',
  },
  {
    id: 'jungla',
    label: 'Jungla',
    blurb:
      'Aventura en la selva: hojas que se mecen como si hubiera viento, un camino de huellas que marcha solo y tarjetas que se balancean.',
    previewColor: '#4aa32b',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Comic+Neue:wght@400;700&display=swap',
  },
  {
    id: 'crayon',
    label: 'Crayón',
    blurb:
      'Dibujado a mano sobre papel: los garabatos se trazan solos al bajar, bordes tembleques, cintas adhesivas y letra de chico.',
    previewColor: '#f59e0b',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Comfortaa:wght@400;500;600;700&display=swap',
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
