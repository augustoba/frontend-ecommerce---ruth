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
  {
    id: 'boutique',
    label: 'Boutique',
    blurb:
      'Casa de moda: mucho aire, tipografía serif, filetes finos y dorado apenas, sin una sola caja de color.',
    previewColor: '#b08d57',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap',
  },
  {
    id: 'feria',
    label: 'Feria',
    blurb:
      'Puesto de feria: toldo rayado, carteles de cartón con cinta adhesiva, tipografía de sello y papel kraft.',
    previewColor: '#c2571d',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'periodico',
    label: 'Periódico',
    blurb:
      'Primera plana: cabecera de diario, doble filete, columnas y el catálogo como ranking numerado en vez de grilla.',
    previewColor: '#26221c',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'retro',
    label: 'Retro 90',
    blurb:
      'Memphis noventoso: violeta eléctrico, figuras geométricas que flotan, calcomanías con sombra dura y cinta que corre.',
    previewColor: '#7c3aed',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Rammetto+One&family=DM+Sans:wght@400;500;700&display=swap',
  },
  {
    id: 'suizo',
    label: 'Suizo',
    blurb:
      'Grilla suiza estricta: números de sección, tipografía grotesca, rojo de acento y cero adornos.',
    previewColor: '#d92b1e',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap',
  },
  {
    id: 'cancha',
    label: 'Cancha',
    blurb:
      'Club de barrio: tablero de LED con el conteo real, pizarra de vestuario, red de arco y chips con número de camiseta.',
    previewColor: '#1e7f3c',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Russo+One&family=Titillium+Web:wght@300;400;600;700&display=swap',
  },
  {
    id: 'cine',
    label: 'Cine',
    blurb:
      'Función de tarde: marquesina con foquitos que persiguen, cortina de terciopelo, estrellas de la crítica y letras de afiche.',
    previewColor: '#8c1030',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'playa',
    label: 'Playa',
    blurb:
      'Verano: degradé de mar, sol que flota, olas que cortan las secciones, promos color coral y fotos con marco blanco.',
    previewColor: '#0ea5a0',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Pacifico&family=Outfit:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'pasarela',
    label: 'Pasarela',
    blurb:
      'Lo más vendido desfila: al bajar, la página se clava y las prendas pasan de costado como en una pasarela, con una barra que marca el avance.',
    previewColor: '#f2543d',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Figtree:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'baraja',
    label: 'Baraja',
    blurb:
      'Un mazo de cartas: lo más vendido se pasa arrastrando la carta de arriba, las categorías se abren en abanico y cada sección tapa a la anterior.',
    previewColor: '#0b7355',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800&display=swap',
  },
  {
    id: 'liquido',
    label: 'Líquido',
    blurb:
      'Nada tiene esquinas: manchas que se deforman solas, fotos dentro de gotas que cambian de forma, olas que corren y botones que se llenan como un vaso.',
    previewColor: '#1f7ae0',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Gabarito:wght@500;600;700;800;900&family=Mulish:wght@400;500;600;700;800&display=swap',
  },
  {
    id: 'kinetico',
    label: 'Kinético',
    blurb:
      'La tipografía es la que se mueve: el nombre se arma letra por letra y se afina al bajar, una palabra gigante deja ver una foto por dentro y dos cintas de texto se cruzan.',
    previewColor: '#111110',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Space+Grotesk:wght@400;500;600;700&display=swap',
  },
  {
    id: 'orbita',
    label: 'Órbita',
    blurb:
      'Las prendas giran: un anillo 3D que da vueltas solo, se arrastra con el dedo y agranda la prenda que queda de frente, con categorías que flotan como planetas.',
    previewColor: '#127385',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700;800&family=Onest:wght@400;500;600;700&display=swap',
  },
  {
    id: 'estela',
    label: 'Estela',
    blurb:
      'El puntero deja rastro: en el índice de categorías la foto persigue al mouse con su estela, los botones son magnéticos y todo va en serif enorme.',
    previewColor: '#5c612f',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap',
  },
  {
    id: 'origami',
    label: 'Origami',
    blurb:
      'Papel doblado: las secciones se despliegan desde arriba, las piezas se dan vuelta como hojas, las esquinas vienen dobladas y cada prenda abre una solapa con sus talles.',
    previewColor: '#c23664',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Young+Serif&family=Albert+Sans:wght@400;500;600;700&display=swap',
  },
  {
    id: 'historias',
    label: 'Historias',
    blurb:
      'Pensado para el celular: el hero es un visor de historias con barritas de progreso, las categorías son círculos con aro, y los filtros salen en una hoja desde abajo.',
    previewColor: '#8b3dff',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap',
  },
  {
    id: 'portal',
    label: 'Portal',
    blurb:
      'Se entra atravesando una foto: una ventana en arco crece al bajar hasta ocupar toda la pantalla, y al tocar una prenda su foto viaja hasta la ficha del producto.',
    previewColor: '#7f512b',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Marcellus&family=Hanken+Grotesk:wght@400;500;600;700&display=swap',
  },
  {
    id: 'cascada',
    label: 'Cascada',
    blurb:
      'Profundidad: las prendas destacadas van en columnas que se mueven a distinta velocidad al bajar, y la foto del hero se corre más lento que la página.',
    previewColor: '#3a6c4f',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&display=swap',
  },
  {
    id: 'acordeon',
    label: 'Acordeón',
    blurb:
      'Las categorías son franjas angostas que se abren: la que se señala o se toca se ensancha y muestra su foto, su nombre y cuántas prendas tiene.',
    previewColor: '#e4572e',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    id: 'persiana',
    label: 'Persiana',
    blurb:
      'Las fotos se descubren en tablillas: cada una arranca tapada por franjas que se recogen una atrás de la otra, como una persiana que se levanta.',
    previewColor: '#435b75',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Franklin:wght@400;500;600;700&display=swap',
  },
  {
    id: 'collage',
    label: 'Collage',
    blurb:
      'Fotos tiradas sobre la mesa: el hero es una pila de fotos de prendas, torcidas y pegadas con cinta, que se pueden agarrar y mover con el dedo.',
    previewColor: '#2b50d6',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Shantell+Sans:wght@400;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&display=swap',
  },
  {
    id: 'foco',
    label: 'Foco',
    blurb:
      'Diseño oscuro: la foto está en penumbra y un reflector que sigue al puntero le devuelve el color; las prendas se encienden al señalarlas.',
    previewColor: '#ffb703',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700;6..96,800&family=Manrope:wght@400;500;600;700;800&display=swap',
  },
  {
    id: 'cinta',
    label: 'Cinta',
    blurb:
      'Las prendas pasan solas en una cinta transportadora que no para, con otra de promos corriendo para el otro lado; se frenan cuando te acercás.',
    previewColor: '#1f66ff',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Saira:wght@400;500;600;700&display=swap',
  },
  {
    id: 'ruleta',
    label: 'Ruleta',
    blurb:
      'Una rueda de categorías: tocás una y la rueda gira hasta dejarla arriba, bajo el marcador, y al costado aparece en grande con su foto.',
    previewColor: '#a4133c',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Chango&family=Rubik:wght@400;500;600;700&display=swap',
  },
  {
    id: 'cubo',
    label: 'Cubo',
    blurb:
      'Un cubo 3D en el hero: sus caras muestran las fotos del carrusel y las promos vigentes, y rota solo cada pocos segundos o con las flechas.',
    previewColor: '#cf8410',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Sarabun:wght@400;500;600;700&display=swap',
  },
  {
    id: 'espejo',
    label: 'Espejo',
    blurb:
      'Pantalla partida: la página se clava y dos columnas de prendas corren en sentidos opuestos, una sube y la otra baja, con el título fijo en el medio.',
    previewColor: '#7a5cff',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    id: 'teletipo',
    label: 'Teletipo',
    blurb:
      'Los títulos se escriben solos: el nombre de la tienda y cada sección aparecen letra por letra, con el cursor parpadeando, en letra de máquina sobre papel.',
    previewColor: '#b3261e',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap',
  },
  {
    id: 'glitch',
    label: 'Glitch',
    blurb:
      'La señal está rota: títulos con eco rojo y cian que saltan, fotos en tres capas que se desfasan y botones que tiemblan. Oscuro sólo en la home.',
    previewColor: '#ff2a6d',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Oxanium:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
  },
  {
    id: 'vortice',
    label: 'Vórtice',
    blurb:
      'Todo gira: un sello de texto que da vueltas alrededor de la foto, categorías que rotan con el scroll, botones con borde que gira y tarjetas que se tuercen.',
    previewColor: '#7c4dff',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Outfit:wght@400;500;600;700&display=swap',
  },
  {
    id: 'holograma',
    label: 'Holograma',
    blurb:
      'Tornasol: las tarjetas y las fotos se inclinan con el puntero y una lámina iridiscente cambia de color según por dónde pasa; los botones llevan un degradé que corre.',
    previewColor: '#7868c2',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Krona+One&family=Outfit:wght@400;500;600;700&display=swap',
  },
  {
    id: 'pixel',
    label: 'Pixel',
    blurb:
      'Un videojuego de 8 bits: las fotos se cargan renglón por renglón, la cinta de promos avanza a los tirones, los botones bajan un escalón y todo se mueve a saltos.',
    previewColor: '#1f6fe0',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;500;600;700&display=swap',
  },
  {
    id: 'tinta',
    label: 'Tinta',
    blurb:
      'Manchas de tinta: la foto aparece desde una gota que crece, los botones se llenan desde donde entra el puntero y las categorías se tiñen de color al tocarlas.',
    previewColor: '#d43d24',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap',
  },
  {
    id: 'tajo',
    label: 'Tajo',
    blurb:
      'Todo está cortado: la foto del hero son cinco tiras que llegan desfasadas y encajan, las categorías se vuelven a cortar al señalarlas y los botones se llenan en diagonal.',
    previewColor: '#ff5a1f',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Narrow:wght@400;500;600;700&display=swap',
  },
  {
    id: 'cifrado',
    label: 'Cifrado',
    blurb:
      'Los textos se descifran: el nombre, los títulos, las promos y los botones arrancan como letras al azar y se acomodan; las fotos se enfocan al mirarlas.',
    previewColor: '#6b8a1f',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Red+Hat+Mono:wght@400;500;700&family=Red+Hat+Display:wght@400;500;700;800&display=swap',
  },
  {
    id: 'confeti',
    label: 'Confeti',
    blurb:
      'Una fiesta: cada botón y cada categoría que tocás suelta una ráfaga de papelitos, caen papelitos en el hero, hay guirnalda de banderines y todo rebota.',
    previewColor: '#ff4d8d',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Lilita+One&family=Mali:wght@400;500;600;700&display=swap',
  },
  {
    id: 'tablero',
    label: 'Tablero',
    blurb:
      'Un cartel de aeropuerto: las promos se arman en un tablero de paletas que giran letra por letra, y los botones y las etiquetas dan su vuelta al señalarlos.',
    previewColor: '#c97a0a',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap',
  },
  {
    id: 'negativo',
    label: 'Negativo',
    blurb:
      'Blanco y negro que se da vuelta: un círculo que sigue al puntero invierte lo que tiene debajo, las fotos pasan a negativo al señalarlas y los botones intercambian colores.',
    previewColor: '#000000',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bowlby+One&family=Lexend+Deca:wght@400;500;600;700&display=swap',
  },
  {
    id: 'historieta',
    label: 'Historieta',
    blurb:
      'Una página de cómic: viñetas torcidas con trama de puntos, la línea de compra en un globo, promos con estallidos que laten y botones con un POW por detrás.',
    previewColor: '#e8262d',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap',
  },
  {
    id: 'fragmento',
    label: 'Fragmento',
    blurb:
      'Todo se arma con pedazos: cada foto son cuatro triángulos que llegan volando y encajan, se rajan al señalarlas, y los botones se parten en dos por la diagonal.',
    previewColor: '#4470cf',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Michroma&family=Mulish:wght@400;500;600;700;800&display=swap',
  },
  {
    id: 'soga',
    label: 'Soga',
    blurb:
      'Ropa tendida: el cartel con el nombre cuelga de dos hilos, las promos y las categorías son etiquetas con broche que se hamacan, y las tarjetas se mecen al señalarlas.',
    previewColor: '#3a8de0',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Itim&family=Sen:wght@400;500;600;700&display=swap',
  },
  {
    id: 'eco',
    label: 'Eco',
    blurb:
      'Todo deja copias: el nombre con tres contornos que se abren en diagonal, títulos con eco, marcos repetidos detrás de fotos y botones, y una cinta de letras huecas.',
    previewColor: '#7a3cf0',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Titan+One&family=DM+Sans:wght@400;500;700&display=swap',
  },
  {
    id: 'radar',
    label: 'Radar',
    blurb:
      'Una pantalla de radar: un haz gira y las categorías son señales que laten y se tocan para filtrar; los botones emiten ondas y un haz barre las fotos. Oscuro sólo en la home.',
    previewColor: '#1f8f66',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@400;500;600;700&display=swap',
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
