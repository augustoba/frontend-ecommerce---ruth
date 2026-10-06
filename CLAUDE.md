# CLAUDE.md — Estilos Pequeños (frontend)

> Este archivo lo lee Claude Code automáticamente al iniciar cada sesión.
> Es el punto de entrada al contexto del proyecto: si clonás el repo en
> otra PC, Claude arranca sabiendo todo esto sin que se lo expliques.

## Fuente de verdad

**Leé `PROYECTO.md` (en esta misma carpeta) antes de empezar a trabajar.**
Es el documento vivo con el alcance completo, el stack y las decisiones
tomadas, la configuración clave (`src/app/core/config/site-config.ts`),
la estructura del código, cómo funciona el checkout por WhatsApp, el panel
de administración, los pendientes conocidos y el historial cronológico de
cambios. Cuando cambie algo importante, actualizá `PROYECTO.md` (y avisá
si conviene tocar también este archivo o el `README.md`).

## Resumen rápido

- Ecommerce de indumentaria infantil real ("Estilos Pequeños", Argentina).
- **Checkout con dos caminos, según lo que tenga configurado el dueño:**
  - **Mercado Pago Checkout Pro** (desde 2026-09-17): el carrito muestra
    "Pagar con Mercado Pago" y redirige al checkout de MP; el pedido se
    confirma solo cuando MP avisa por webhook que el pago se acreditó.
  - **Por WhatsApp** (el flujo original): el carrito arma un mensaje con el
    pedido y lo manda al número del dueño/a, que coordina el pago a mano
    (alias o link).
  Son **excluyentes**: con Mercado Pago activo no se ofrecen transferencia/QR/
  efectivo para la venta online. Ver `PROYECTO.md` §2 y el `PROYECTO.md` del
  backend (#27 y #29).
- **Frontend:** Angular 19 (standalone components + signals) + Tailwind
  CSS v4. Repo actual (`frontend/`), ya desarrollado.
- **Backend:** Java 21 + Spring Boot 3 + MySQL 8 + JWT, en la carpeta hermana
  `../backend/` (repo git propio; en GitHub se llama `backend-ecommer-ruth`).
  Package-by-layer. Ver `../backend/README.md`.
- Correr en local: backend (`cd ../backend && ./mvnw spring-boot:run`)
  **y** frontend (`npm start` → `http://localhost:4200`). El carrito y el token
  son lo único que sigue en `localStorage`.

## Cómo trabaja el cliente (importante)

- Escribe en español rioplatense, informal, sin tildes ni mayúsculas en
  el chat. Es estilo de escritura rápido, **no** indica nivel técnico bajo.
- Pide cambios **de a uno, iterativos y concretos** ("agregá imágenes",
  "necesito que el stock sea por talle"), no specs grandes de una vez.
- **Corta el scope explícitamente cuando algo se adelanta.** Trabajar de a
  un cambio a la vez y no meter cosas que no pidió.
- **Frontend + backend conectados** (2026-09-08): los services usan `HttpClient`
  contra `/api/*` (proxy `ng serve` → `../backend/` en `:8080`). Para correr
  hace falta **levantar los dos** (ver PROYECTO.md sección 3). Login por **DNI**
  (no username, desde 2026-09-11): admin normal (Ruth) `11111111` / `ruth123`;
  superadmin (Augusto) `33756194` / `augusto123` (ve además la config de
  plataforma y el servicio de mail, ver PROYECTO.md #45-46). Recuperar
  contraseña es por mail (no hay frase de recuperación). Solo el carrito y el
  token quedan en `localStorage`.

## Detalles que no están en el código y conviene recordar

- **La home tiene 55 diseños intercambiables** (Ruth / Editorial / Pop desde
  2026-09-30; + Vidriera / Ofertas / Fichero / Mosaico / Nova / Neón / Caramelo /
  Cohete / Jungla / Crayón desde 2026-10-01; + Boutique / Feria / Periódico /
  Retro 90 / Suizo / Cancha / Cine / Playa desde 2026-10-02; + los nueve "de
  movimiento" Pasarela / Baraja / Líquido / Kinético / Órbita / Estela /
  Origami / Historias / Portal y, en una segunda tanda del mismo día, Cascada /
  Acordeón / Persiana / Collage / Foco / Cinta / Ruleta / Cubo / Espejo /
  Teletipo, desde 2026-10-06):
  `CatalogPageComponent` es un **contenedor** que carga los datos
  y los pasa como un único `CatalogView` (`features/catalog/catalog-view.ts`) a
  la plantilla elegida (`@switch (layout())` sobre
  `features/catalog/templates/`). **Cada plantilla es dueña de TODO su markup**
  (hero, filtros, grilla, vacíos) a propósito: en el intento anterior del SaaS
  las plantillas salían todas iguales porque compartían grilla/header/footer y
  sólo variaba el hero. No "unificar" ese markup. Registro en
  `core/layouts.ts`, tokens por diseño en `styles.css`
  (`[data-layout="x"], .tpl-x`), elección desde `/admin/config/diseno` y
  guardado en `site_settings.layout`. Al agregar uno hay que tocar también la
  variante de `ProductCard` y el `@Pattern` de `AppearanceRequest` en el backend.
  El movimiento vive en cuatro directivas compartidas (`appReveal` con las
  variantes up/mask/bounce/blur/left/right/zoom, `appTilt`, `appScrollProgress` y
  `appAutoMore`) + keyframes en `styles.css`; **Nova** es la que más las usa.
  **Neón** (arcade), **Cohete** (espacial) y **Cine** (marquesina) son los tres
  diseños oscuros: la oscuridad sale de invertir la rampa `brand-*` (el `body`
  usa `brand-50` como fondo) más reglas acotadas en `styles.css` para el header
  y el footer compartidos (`[data-layout="neon"] app-header header {…}` y lo
  mismo para Cohete y Cine), que es lo único que ningún otro diseño toca. Los
  últimos cuatro "para chicos" (Caramelo, Cohete, Jungla y Crayón) tienen
  movimiento propio cada uno.
  Los nueve **de movimiento** (2026-10-06) se definen por cómo se mueven, no
  por un tema, y heredan de `MotionTemplateBase` (sólo helpers; el markup sigue
  siendo de cada una). Sumaron cinco directivas: `appScrollScene` (escribe `--s`
  0..1 según el scroll: Pasarela, Portal, Kinético), `appOrbit` (anillo 3D),
  `appCursorTrail` + `appMagnetic` (Estela) y `appSwipe` (mazo de Baraja), más
  las variantes `fold`/`flip` de `appReveal`. Reglas: sólo `transform`,
  `opacity` y `clip-path`; hover detrás de `(hover: hover) and (pointer: fine)`
  con versión táctil; todo se apaga en el bloque final de
  `prefers-reduced-motion`. Los gestos de arrastre frenan el clic **en
  captura** (si no, `routerLink` abre la prenda). `app.config.ts` usa
  `withViewTransitions` para el viaje de la foto de Portal; el resto de los
  diseños lo tiene anulado por CSS — no "limpiar" esa regla. Ver PROYECTO.md
  §7bis y #65.
  La **segunda tanda** (diez más, #66) sumó `appDrag` (Collage), `appSpotlight`
  (Foco), `appTypewriter` (Teletipo) y la variante `slats` de `appReveal`
  (Persiana). **Foco es oscuro sólo en la home**: su rampa invertida vive en
  `.tpl-foco` y NO en `[data-layout="foco"]`, porque las demás páginas públicas
  tienen `text-stone-800`/`bg-white` fijos y con fondo oscuro global quedan
  ilegibles — que es justo lo que les pasa hoy a Neón, Cohete y Cine en la
  ficha de producto (pendiente, PROYECTO.md §10). Un diseño oscuro nuevo tiene
  que seguir el camino de Foco, no el de esos tres.
  La **tercera tanda** (quince, #67: de Glitch a Radar) anima todo —botones,
  fotos, banner, títulos— y sumó `appScramble` y `appConfetti`. Dos cosas a
  respetar: (1) el **banner de promos que rota** vive en `MotionTemplateBase`
  (`promoActual`/`promoSiguiente`/`promoPar`) y lo avanza la animación CSS de
  `.promo-timer`, no un `setInterval`; (2) para **volver a disparar una
  animación** se alterna la clase `is-b` (cada keyframe está dos veces en
  `styles.css`, `x` y `x-b`) — no recrear el nodo con `@for (k of [x]; track
  k)`, que hace saltar el aviso NG0956 en cada cambio. Glitch y Radar son
  oscuros sólo en la home, igual que Foco.
- **Vocabulario de tienda en las etiquetas funcionales** (2026-10-02, commit
  `39f1740`): los diseños se diferencian **sólo por lo visual**. Títulos de
  sección ("Lo más vendido", "El catálogo", "Promos"), conteos, buscador
  ("Buscar producto..."), vacíos ("Sin resultados") y CTAs ("Ver todo el
  catálogo") usan siempre las palabras de Ruth aunque el tema sea cine, cancha
  o selva; la jerga queda sólo en textos decorativos (kickers del hero,
  epígrafes, frases de cierre, chistes de error con aclaración simple debajo).
  No volver a "traducir" etiquetas funcionales a la jerga del tema.
- **Vista `/promos`** (2026-10-02): muestra las prendas marcadas a mano con
  "Mostrar en promos" (`featuredInPromos` en el form de producto) o, si no hay
  ninguna, las de descuento vigente por parametría —mismo % que aplica el
  carrito vía `DiscountService.percentForProduct`—. Es el destino del link del
  banner promocional y de los links del diseño Neón. La página elige la
  variante de tarjeta con un `VARIANT_BY_LAYOUT` propio (vive fuera del
  `CatalogView`). Ver PROYECTO.md §7ter.
- **Título de pestaña dinámico** (2026-10-02): `StoreTitleStrategy`
  (`core/store-title.strategy.ts`) arma `<página> | <storeName>` en las
  páginas públicas con el nombre real de `/api/settings` (en `/admin` queda
  `X | Admin`). Ojo con el ciclo de DI que tuvo: `SettingsService` se resuelve
  **diferido** (`Injector.get` en la primera navegación + `effect` con guarda),
  nunca con `inject()` en el constructor — si no, el request de
  `/api/settings` muere en silencio (NG0200). Ver PROYECTO.md §9sexies y #63.
  Ver PROYECTO.md §7bis, §7ter, §9sexies, #56–#64.
- El logo real del comercio (sombrilla + corazones, paleta pastel
  rosa/celeste/durazno) está en `public/logo.jpeg` — lo pasó el cliente,
  coincide con su marca real de WhatsApp/redes. Es el **fallback**: desde
  `/admin/config/identidad` se puede subir otro (se sube a Cloudinary y la URL
  queda en `site_settings.logo_url`); todo lee de `SettingsService.logoSrc`.
- Las imágenes de productos y del carrusel de la home eran **íconos SVG
  generados por código** (backend `DataSeeder` / `clothing-icons.ts`), no
  fotos reales. Cada producto tiene **galería** (`images[]`, la 1ra es portada)
  + un link de video de YouTube opcional, editables desde el form de producto;
  el carrusel desde `/admin/carrusel`. Las subidas de fotos del panel (producto,
  carrusel, logo, QRs de pago) van a **Cloudinary** (unsigned upload; config en
  `site-config.ts` → `SITE_CONFIG.cloudinary`). Ver PROYECTO.md §44.
- La paleta de colores del sitio (naranja/celeste/menta, en `src/styles.css`)
  quedó como **posible ajuste pendiente** para acercarla a los tonos
  exactos del logo — ofrecido, no confirmado.
- El nombre de la tienda, el número de WhatsApp, el "sobre nosotros" y las
  redes se editan desde **`/admin/config`** (hub con sub-páginas + preview en
  vivo; `/admin/ajustes` redirige ahí). Tabla `site_settings` del backend,
  `GET /api/settings` público. Ya NO están en `site-config.ts`, que quedó sólo
  con `apiBaseUrl`. El número actual (`5491122334455`) sigue siendo un
  **placeholder** — cargarlo real desde el panel antes de publicar.
  Fallback si el backend no responde: `settings.service.ts` → `DEFAULTS`.
- Redes del footer: Instagram `@estilospequenos_` y Facebook (links reales
  confirmados, hoy en `site_settings`), con íconos de marca SVG propios (no
  emoji — el cliente lo pidió explícitamente).
