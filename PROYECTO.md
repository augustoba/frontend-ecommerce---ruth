# Estilos Pequeños — Documento de alcance y referencia

> Documento vivo del proyecto (overview general + detalle del frontend).
> El detalle del backend (entidades, endpoints, auth) está en
> `../backend/PROYECTO.md` (esa es la carpeta real en esta máquina; el repo en
> GitHub se llama `backend-ecommer-ruth`).
>
> **Última actualización: 2026-10-06** (30 diseños de tienda: se sumaron los
> nueve "de movimiento" —Pasarela / Baraja / Líquido / Kinético / Órbita /
> Estela / Origami / Historias / Portal—, §7bis e historial #65).
> Antes, el 2026-10-02 (21 diseños de tienda — los 8 nuevos
> Boutique / Feria / Periódico / Retro 90 / Suizo / Cancha / Cine / Playa —,
> vista `/promos`, título de pestaña dinámico y **vocabulario de tienda en las
> etiquetas funcionales** de las plantillas temáticas; historial #61–#64).
> El 2026-09-20 se puso al día este
> documento, que había quedado del **2026-09-08** y describía un proyecto de 12
> días antes: decía que no había pasarela de pago (Mercado Pago Checkout Pro
> está implementado desde el 2026-09-17), que el login era `admin`/`ruth123`
> (es por DNI desde el 2026-09-11), y listaba como pendientes varias cosas ya
> hechas. Se corrigieron las secciones 2, 3, 3bis, 5 y 12. **Las demás secciones
> (6 a 11) siguen con la redacción del 2026-09-08** y pueden tener detalles
> atrasados — para lo del backend, la fuente de verdad es
> `../backend/PROYECTO.md`.
> El 2026-09-30 se aggiornaron 2, 5, 6, 7, 8, 9sexies y 12 por las **plantillas
> de diseño intercambiables** (nueva sección 7bis, historial #56).
> El 2026-10-02 quedaron documentados también los 10 diseños de la tanda larga
> (historial #57–#60) y las novedades de esa fecha: la **tanda de ocho diseños**
> (ya son **21**, secciones 2, 6 y 7bis), la **vista `/promos`** con el marcado
> manual "Mostrar en promos" (nueva sección 7ter) y el **título de pestaña
> dinámico** (secciones 7ter y 9sexies) — historial #61–#63. La última pasada
> devolvió las **etiquetas funcionales** de las plantillas temáticas al
> vocabulario de tienda (regla en §7bis, historial #64).

## 1. Qué es esto

Ecommerce de indumentaria infantil ("Estilos Pequeños", Argentina).
**Checkout sin pasarela de pago:** el cliente arma el carrito y al tocar
"Comprar" se abre WhatsApp con el pedido ya redactado, dirigido al número
del dueño/a. El dueño/a responde por WhatsApp con el alias o link de
Mercado Pago para coordinar el pago manualmente.

- **Frontend:** Angular — repo actual (`frontend-ecommerce---ruth/`).
  **Conectado al backend (2026-09-08)**: todos los services usan `HttpClient`
  contra `/api/*` (proxy del dev-server → `localhost:8080`). Solo el carrito
  y el token JWT quedan en `localStorage`.
- **Backend:** Java 21 + Spring Boot 3.3 + MySQL 8, carpeta hermana
  `../backend/` (repo git propio). CRUD completo del admin + catálogo público
  + login/recuperación por JWT. **Detalle completo en `../backend/PROYECTO.md`**
  (y resumen en la sección 12 de acá).

## 2. Stack técnico y decisiones tomadas

| Decisión | Elegido | Alternativas descartadas |
|---|---|---|
| Framework front | Angular 19 (standalone components + signals) | — |
| Estilos | Tailwind CSS v4 | Angular Material, Bootstrap, CSS plano |
| Datos de productos (front) | Todos vía `HttpClient` contra `/api/*` (conectado al backend desde 2026-09-08) | — |
| Backend | Java 21 + Spring Boot 3.3 + MySQL 8 + JWT (Maven) | Node/Nest, Quarkus, Gradle, Postgres/H2 |
| Alcance v1 | Catálogo+filtros, carrito+checkout WhatsApp, panel admin, API backend | — |
| Pasarela de pago | **Mercado Pago Checkout Pro** (desde 2026-09-17), además del checkout por WhatsApp con alias/link manual | — |
| Diseño de la tienda | **21 plantillas intercambiables** — Ruth / Editorial / Pop (2026-09-30) + Vidriera / Ofertas / Fichero / Mosaico / Nova / Neón + Caramelo / Cohete / Jungla / Crayón (2026-10-01) + Boutique / Feria / Periódico / Retro 90 / Suizo / Cancha / Cine / Playa (2026-10-02) — elegibles desde el panel (sección 7bis) | Un solo diseño fijo en código; temas sólo de colores |

**Ojo:** la pasarela de pago **sí** existe. El sitio arrancó sin ninguna (checkout
por WhatsApp + alias manual), pero desde el 2026-09-17 tiene **Mercado Pago
Checkout Pro** implementado end-to-end (backend `PROYECTO.md` #27 y #29): si el
dueño activa Mercado Pago en el panel, el carrito muestra "Pagar con Mercado
Pago" y redirige al checkout de MP, y el pedido se confirma solo cuando MP avisa
por webhook que el pago se acreditó. Si no está activado, sigue el flujo de
WhatsApp de siempre. **Son excluyentes:** con MP activo, transferencia/QR/efectivo
no se ofrecen para la venta online.

## 3. Cómo correr el proyecto en local

**Necesitás los dos: backend + frontend, y MySQL corriendo.** Rutas reales en
esta máquina: backend en `../backend/` (el repo en GitHub se llama
`backend-ecommer-ruth`; la carpeta local es `backend`), frontend en esta
carpeta (`frontend-ecommerce---ruth`).

```bash
# 0) (sólo la primera vez) config local del backend — gitignored, no se sube
cd "C:\Users\august0\Desktop\proyectos\ecommerce ruth\backend"
copy src\main\resources\application-local.yml.example src\main\resources\application-local.yml
# Editá application-local.yml: usuario/contraseña de tu MySQL, un JWT secret
# largo, y (opcional pero recomendado) tu cuenta superadmin — ver más abajo.

# 1) backend (con MySQL corriendo)
cd "C:\Users\august0\Desktop\proyectos\ecommerce ruth\backend"
./mvnw spring-boot:run -Dspring-boot.run.profiles=local     # http://localhost:8080

# 2) frontend
cd "C:\Users\august0\Desktop\proyectos\ecommerce ruth\frontend-ecommerce---ruth"
npm start                                                    # http://localhost:4200
```

El frontend llama a `/api/*` y el dev-server lo redirige al backend
(`proxy.conf.json` — se toma solo, sin flags). Si el backend está caído,
la tienda muestra "no se pudo conectar" y estados de error con "reintentar".

**Logins del panel** (`http://localhost:4200/admin`) — **se entra por DNI**, no
por usuario (cambió el 2026-09-11, ver ítem 46):
- Cuenta de la tienda (Ruth): **DNI `11111111` / `ruth123`** — rol Administrador,
  ve todo lo de la tienda (productos, pedidos, POS, config del sitio, etc.)
  pero **no** ve el menú "🔒 Superadmin".
- Cuenta superadmin (Augusto): DNI **`33756194`** / `augusto123` por defecto;
  se puede sembrar con otra cosa con las env vars **`SUPERADMIN_DNI`**,
  `SUPERADMIN_PASSWORD`, `SUPERADMIN_NOMBRE`, `SUPERADMIN_APELLIDO`,
  `SUPERADMIN_EMAIL` (los nombres viejos `SUPERADMIN_USER`/
  `SUPERADMIN_FIRST_NAME`/`SUPERADMIN_LAST_NAME` **ya no existen**: se
  renombraron en el ítem 46). Igual que `ADMIN_DNI`/`ADMIN_PASSWORD`/
  `ADMIN_NOMBRE`/`ADMIN_APELLIDO`/`ADMIN_EMAIL` para la cuenta de la tienda.
  El seeder de la app las crea al arrancar si no hay un usuario con ese DNI.

Build de producción del frontend: `npm run build` → `dist/ecommerce-ninos/`.
En prod, poné la URL del backend en `apiBaseUrl` (`site-config.ts`) si va en
otro dominio, y las env vars de arriba (`ADMIN_*`, `SUPERADMIN_*`, `DB_*`,
`JWT_SECRET`, `CORS_ORIGINS`) en el servidor donde corra el backend.

## 3bis. Levantar un sitio NUEVO con esta misma base (checklist)

Pensado para cuando este mismo código sirva de plantilla para otro comercio:
la idea es que armar un sitio nuevo sea **configurar, no programar**.

1. Cloná los dos repos, cambiá el nombre/branding que sí vive en código
   (`public/logo.jpeg` como fallback, paleta en `src/styles.css`, nombre del
   paquete Java si aplica) — esto es lo único que todavía requiere tocar código.
2. Base de datos nueva. Dos caminos:
   - **Recomendado:** correr `mysql < database/setup.sql` y arrancar el backend
     con `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`. El script está verificado
     contra las entidades (2026-09-20, backend `PROYECTO.md` #36) y `validate`
     te canta si algo no coincide.
   - O dejar `ddl-auto=update` y que Hibernate cree el esquema solo.
3. Arrancá el backend una vez para que siembre las tablas y las cuentas
   iniciales. Las variables (en `application-local.yml` o env vars del server):
   - Cuenta de la tienda: **`ADMIN_DNI`**, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`,
     `ADMIN_APELLIDO`, `ADMIN_EMAIL` — **cambialas del default
     `11111111`/`ruth123`**.
   - Cuenta superadmin: **`SUPERADMIN_DNI`**, `SUPERADMIN_PASSWORD`,
     `SUPERADMIN_NOMBRE`, `SUPERADMIN_APELLIDO`, `SUPERADMIN_EMAIL`.
   - *(Los nombres viejos `ADMIN_USER`/`SUPERADMIN_USER`/`SUPERADMIN_FIRST_NAME`/
     `SUPERADMIN_LAST_NAME` ya no existen — se renombraron en el ítem 46.)*
4. Entrá como superadmin y cargá, **sin tocar código**:
   - `/admin/superadmin/cloudinary` — cuenta de Cloudinary de ESE sitio (ver
     pasos en la sección siguiente). Sin esto, subir fotos queda deshabilitado
     (se puede seguir cargando por URL mientras tanto).
   - **`/admin/config/servicios`** — SMTP de ESE sitio (Brevo u otro). **Esta es
     la config que manda mail de verdad** (`PlatformMailSettings`): la usan el
     reset de contraseña, el comprobante de pedido, las campañas y las alertas
     de stock.
     > ⚠️ **Ojo:** existe además `/admin/superadmin/mail`, que guarda otras
     > credenciales SMTP en `site_settings` — pero **no manda nada**: es un
     > scaffolding muerto que quedó de un merge (backend `PROYECTO.md` #51).
     > Cargar el mail ahí no tiene ningún efecto. Usá `/admin/config/servicios`.
5. Entrá como el admin de la tienda (o creá uno nuevo desde `/admin/usuarios`
   con nombre/apellido/DNI) y cargá desde `/admin/config`: nombre de la
   tienda, WhatsApp, dirección, redes, medios de pago, "sobre nosotros",
   mensaje de WhatsApp, carrusel.
6. Si querés datos de ejemplo para ver las pantallas con volumen (métricas,
   balance, campañas), hay un seed de demo: ver `../backend/database/README.md`.

## 4. Configurar servicios externos (Cloudinary, mail)

### Cloudinary (fotos del panel: productos, carrusel, logo, QRs)

Cuenta actual del sitio: cloud `jitutkbc` — ya cargada en `site_settings`
desde `/admin/superadmin/cloudinary`. Para esa misma cuenta o una nueva:

1. Entrá a **https://cloudinary.com** → "Sign up free" (o el login si ya
   tenés cuenta — la actual la armó el cliente).
2. En el **Dashboard** (primera pantalla al loguearte) copiá el **Cloud name**.
3. Andá a **Settings → Upload → Upload presets → Add upload preset**.
   - **Signing Mode: Unsigned** (obligatorio — es lo que permite subir desde
     el navegador sin exponer el API secret).
   - Opcional pero recomendable: carpeta por defecto, formatos permitidos
     (jpg, png, webp), límite de tamaño.
   - Guardá y copiá el **nombre del preset**.
4. En el panel: **`/admin/superadmin/cloudinary`** → pegá Cloud name + preset
   → Guardar. Ya queda disponible para subir fotos en todo el panel (no hace
   falta redesplegar nada).

### Mail / SMTP (recuperar cuenta por mail — Brevo)

Elegido por volumen bajo (recuperación de cuenta de un puñado de usuarios
internos, no mailing masivo): **300 mails/día gratis para siempre, sin
tarjeta**. Alternativas si hiciera falta más volumen o dominio propio: Resend
(3000/mes gratis) o Gmail con "contraseña de aplicación" (más frágil, no
recomendado para producción).

1. Entrá a **https://www.brevo.com** → "Sign up free" (cuenta nueva,
   independiente por cada sitio si querés separarlos — o la misma cuenta con
   remitentes distintos por sitio).
2. Verificá un remitente: menú **Senders, Domains & Dedicated IPs → Senders**
   → agregá el mail (o el dominio propio, si lo tenés, para mejor entrega) →
   confirmá el mail de verificación que te llega.
3. Andá a **SMTP & API** (menú izquierdo) → pestaña **SMTP** → ahí están el
   **SMTP server** (host), el **Port**, el **Login** y podés generar una
   **SMTP key** (es la "contraseña" — Brevo la muestra sólo una vez al
   generarla, copiala en el momento).
4. En el panel: **`/admin/superadmin/mail`** → cargá host, puerto, login,
   SMTP key, y el mail/nombre de remitente → Guardar. La SMTP key no se
   vuelve a mostrar después de guardada (por seguridad) — si la perdés, generás
   una nueva en Brevo y la volvés a pegar.
5. **Nota:** cargar esto no activa el envío todavía — falta conectar el
   `MailService` del backend a `/api/auth/recover` (pendiente, ver sección 12
   / historial ítem 46). Una vez conectado, este paso no cambia: es el mismo
   lugar donde se cargan las credenciales.

### Ex-`SITE_CONFIG.cloudinary` (histórico)

Hasta el ítem 45 (2026-09-11) Cloudinary estaba hardcodeado en
`src/app/core/config/site-config.ts`. Ese archivo ahora sólo tiene
`apiBaseUrl` (no puede venir del backend: hace falta para saber a dónde
llamar) y `apiUrl(path)`. Todo lo demás —nombre de la tienda, WhatsApp,
"sobre nosotros", redes, Cloudinary, mail— vive en `site_settings` y se
edita desde el panel (`/admin/config` o `/admin/superadmin/*`). Fallback si
el backend no responde: `src/app/core/services/settings.service.ts` →
`DEFAULTS`.

## 5. Panel de administración

- URL: `http://localhost:4200/admin`. Login por **DNI** (ej. `11111111` /
  `ruth123`) — valida contra el backend (`POST /api/auth/login`) y guarda el JWT
  en `localStorage`.
  Un interceptor lo manda en `/api/admin/**`; si expira o falta, vuelve al login.
- **Menú lateral agrupado** (sección 9octies): Inicio suelto arriba + tres grupos
  colapsables (Ventas, Catálogo, **Configuración del sitio**) + Mi cuenta y "Ver
  tienda" abajo. En mobile es un drawer con botón hamburguesa. El estado abierto
  de cada grupo se recuerda en `localStorage` (`ep_admin_menu_open`).
- `/admin/recuperar` — si el admin se olvidó la contraseña: sólo pide el **DNI**;
  si existe, le llega un mail con una contraseña nueva (desde 2026-09-11, ver
  PROYECTO.md #46 — antes era con una "frase de recuperación", se sacó).
- `/admin/cuenta` — cambiar la contraseña (pide la actual).
- `/admin/config` ("🎨 Configuración del sitio") — hub con sub-páginas:
  **diseño de la tienda** (`/config/diseno`: elegir entre Ruth, Editorial, Pop,
  Vidriera, Ofertas, Fichero, Mosaico, Nova, Neón, Caramelo, Cohete, Jungla y
  Crayón
  con miniaturas vivas, secciones 7bis y 9sexies), identidad
  y contacto (nombre + WhatsApp), redes sociales, "sobre nosotros" y carrusel.
  Cada una con **previsualización en vivo** de cómo queda en la tienda. Sin
  redesplegar nada (sección 9sexies). `/admin/ajustes` redirige acá.
- `/admin/metricas` ("📊 Métricas") — ventas por período: facturación, unidades
  y pedidos, facturación por mes, productos más/menos vendidos y desglose por
  parametría (sección 9septies).
- Permite: crear/editar/ocultar/eliminar productos, con **stock por talle** y
  **clasificación por parametrías** (ver sección 9ter), + proveedores,
  descuentos, escalas de talle, carrusel y gestión de pedidos.
- Todos los datos vienen del backend (MySQL). Si el backend está caído, cada
  sección muestra un estado de error con botón "reintentar".

## 6. Identidad visual

- **Logo real** del comercio en `public/logo.jpeg` (el mismo que usan en
  WhatsApp/redes: sombrilla + corazones, paleta rosa/celeste/durazno).
  Usado como favicon, en el header, footer, login y sidebar del admin, y
  en grande en el hero de la home.
- Paleta de colores del sitio definida en `src/styles.css` (`brand-*`
  naranja, `accent-*` celeste, `mint-*` verde) — **pendiente evaluar si
  se ajusta** a los tonos pastel reales del logo (rosa/celeste/durazno),
  quedó abierto como posible ajuste futuro.
- Fuentes: **dependen del diseño elegido** (sección 7bis). Las de `index.html`
  son Baloo 2 (títulos) + Nunito (texto) — las del diseño original "Ruth".
  Cada otro diseño carga las suyas por JS cuando se activan
  (`ensureLayoutFonts`), así la tienda no baja tipografías que no usa:
  Editorial (Playfair Display + Inter), Pop (Archivo Black + Space Grotesk),
  Vidriera (Fredoka + Karla), Ofertas (Barlow Condensed + Barlow),
  Fichero (IBM Plex Mono + IBM Plex Sans), Mosaico (Sora + Manrope),
  Nova (Bricolage Grotesque + Plus Jakarta Sans), Neón (Orbitron + Rubik),
  Caramelo (Grandstander + Quicksand), Cohete (Bungee + Varela Round),
  Jungla (Luckiest Guy + Comic Neue), Crayón (Patrick Hand + Comfortaa),
  Boutique (Cormorant Garamond + Jost), Feria (Alfa Slab One + Work Sans),
  Periódico (UnifrakturMaguntia + Old Standard TT + Libre Franklin), Retro 90
  (Rammetto One + DM Sans), Suizo (Archivo + Space Mono), Cancha (Russo One +
  Titillium Web), Cine (Bebas Neue + Poppins) y Playa (Pacifico + Outfit).

## 7. Página de inicio (`/`, `CatalogPageComponent`)

**Desde el 2026-09-30 la home es un contenedor**: `CatalogPageComponent` carga
los datos (productos, carrusel, parametrías, talles, filtros, orden, paginado)
y se los pasa a **una plantilla de diseño**, que es dueña de TODO el markup
(sección 7bis). Lo de acá abajo describe el diseño **Ruth** — el default, el
que la tienda tuvo siempre; las otras plantillas muestran los mismos datos con
otra estructura visual.

- Hero grande arriba: carrusel automático de imágenes (cada 4.5s, con
  flechas y puntos de navegación) + logo grande superpuesto + nombre +
  bajada + botón "Ver catálogo" que baja con scroll suave.
- **Imágenes de productos y del carrusel:** las del catálogo de ejemplo son
  ilustraciones generadas por el backend (SVG con emoji de la prenda sobre
  círculo de color — el frontend tiene equivalentes en
  `src/app/core/assets/clothing-icons.ts`), **no son fotos reales**.
  - Cada producto tiene una **galería** (`images[]`, la primera es la portada).
    Se administra desde el form de producto (`/admin/productos/:id/editar`):
    agregar por URL o subir del celu (se redimensiona y va a **Cloudinary**,
    sección 44), reordenar, quitar. La ficha muestra la galería con miniaturas
    y, si el producto tiene `videoUrl` (link de YouTube, opcional), el video
    embebido debajo de las fotos.
  - El carrusel de la home se administra desde `/admin/carrusel`.
- Debajo: buscador + filtros dinámicos generados desde las parametrías
  marcadas como "filtro en la tienda" (Público como botones, el resto como
  selectores) + filtro por talle + **orden** (novedades / precio ascendente /
  precio descendente), y la grilla de productos.

## 7bis. Diseños de tienda intercambiables (plantillas)

- **Qué es:** el dueño puede elegir el **diseño de la tienda** desde
  `/admin/config/diseno` (sección 9sexies), sin tocar código ni redesplegar.
  Hoy hay **treinta** (los nueve últimos, "de movimiento", tienen su propio
  bullet más abajo). Los primeros veintiuno: **Ruth** (el original), **Editorial**, **Pop**,
  **Vidriera**, **Ofertas**, **Fichero**, **Mosaico**, **Nova**, **Neón**,
  **Caramelo**, **Cohete**, **Jungla**, **Crayón**, **Boutique**, **Feria**,
  **Periódico**, **Retro 90**, **Suizo**, **Cancha**, **Cine** y **Playa**.
  La elección queda guardada en `site_settings.layout` y la tienda la levanta
  al cargar.
- **Por qué esta arquitectura:** en el intento anterior (el SaaS) todas las
  plantillas salían iguales porque sólo variaba el hero y el resto —grilla,
  header, footer, fichas— era compartido. Acá **cada plantilla es dueña de su
  markup completo** (hero, filtros, grilla y estados vacíos) y sólo comparte
  los datos. No hay componentes de diseño intermedios que las igualen.
- **Cómo está armado:**
  - `core/layouts.ts` — el registro: `LAYOUTS` (id, nombre, descripción, color
    de la miniatura y `fontsHref` de Google Fonts), `DEFAULT_LAYOUT = 'ruth'`,
    `isKnownLayout`/`layoutById` y `ensureLayoutFonts(id)` (inyecta el `<link>`
    de fuentes una sola vez por id; la pantalla de Diseño lo llama con los tres,
    porque en `/admin` el `data-layout` global está sacado a propósito).
  - `features/catalog/catalog-view.ts` — el **contrato** `CatalogView`: todo lo
    que una plantilla puede pedirle al contenedor (productos y filtros, orden,
    paginado, estado de carga/error, los datos del local en `settings`, las
    promos vigentes en `promos` y el `discountPercentFor` de cada prenda). Cada
    plantilla recibe un único `view = input.required<CatalogView>()`.
  - `features/catalog/catalog-page/` — el contenedor: carga los datos, expone
    `vm: CatalogView = this` y hace `@switch (layout())` sobre las **21
    plantillas**. Acepta `layoutOverride` (forzar un diseño ignorando el elegido)
    y `preview` (4 productos, sin "más vendidos" ni "ver más") — los usa la
    pantalla de Diseño para las miniaturas vivas.
  - `features/catalog/templates/template-{id}.component.*` — una plantilla por
    diseño (21 archivos). La de Ruth es el markup viejo **portado literal**, así
    el diseño original quedó píxel por píxel igual al de siempre.
  - `shared/components/product-card` — veinte variantes (`classic | editorial |
    pop | vidriera | oferta | mosaico | nova | neon | caramelo | cohete | jungla
    | crayon | boutique | feria | periodico | retro | suizo | cancha | cine |
    playa`; Fichero, que usa filas, va con `classic`)
    (un `Record<ProductCardVariant, CardClasses>` con las clases de cada parte
    de la tarjeta). Es lo único que se comparte: la tarjeta, no la página.
  - `styles.css` — tokens por diseño (`[data-layout="editorial"], .tpl-editorial
    {…}`, y lo mismo para `pop`) + helpers `.ed-*` / `.pop-*`. Va en el CSS
    global porque el presupuesto de `anyComponentStyle` es 4 kB por componente.
    Los selectores van **dobles** (atributo en `<html>` y clase en el host de la
    plantilla) para que una miniatura del admin se vea correcta aunque el diseño
    activo de la tienda sea otro.
  - `AppComponent` — es el único que escribe `data-layout` en `<html>`, y lo
    **quita** en las rutas `/admin` (para que el panel no herede las fuentes ni
    el aire de la tienda); también llama a `ensureLayoutFonts`.
- **Los diseños:**
  - **Ruth** (default): cálido y centrado — carrusel arriba, logo redondo
    superpuesto, grilla pareja de tarjetas con marco suave. Baloo 2 + Nunito.
  - **Editorial**: tipo revista de moda. Papel hueso, hero con título enorme
    **a la izquierda** (serif) + foto a sangre, CTA negro, grilla **asimétrica
    sin marcos**, mucho aire. Playfair Display + Inter.
  - **Pop**: neo-brutalista y bien infantil. Fondo amarillo, **marquesina** negra
    en movimiento, bordes gruesos con sombras duras, calcomanías rotadas en
    magenta, filtros tipo chip. Archivo Black + Space Grotesk.
  - **Vidriera** (2026-10-01): la home como **catálogo por categorías** — un riel
    horizontal que se desliza por cada opción real del grupo "Público" (bebé,
    nena, nene), y el catálogo completo con sus filtros al final. Es la única que
    ordena por categoría en vez de por una grilla única. Fredoka + Karla.
  - **Ofertas** (2026-10-01): la única **comercial**. Sin hero: arriba la barra
    con los descuentos vigentes que devuelve `/api/discounts` (endpoint público,
    lo mismo que calcula el carrito), filtros en columna al costado y grilla
    apretada de 4 con el precio grande y el `-X%` real en las prendas alcanzadas
    por un descuento por parametría. Barlow Condensed + Barlow.
  - **Fichero** (2026-10-01): **ficha técnica**. Una prenda destacada en grande
    (la primera de "más vendidos") con su descripción y sus talles con stock, y
    el catálogo como **lista de filas** en vez de grilla. Es la única que muestra
    la descripción y los talles en la home. IBM Plex Mono + IBM Plex Sans.
  - **Mosaico** (2026-10-01): un **tablero tipo bento** de piezas de distinto
    tamaño — carrusel, foto del local (`storePhotoUrl`), un recorte del "sobre
    nosotros", una categoría real que filtra al tocarla y dos prendas — con la
    grilla del catálogo abajo. Es lo único que usa la foto del local y el "sobre
    nosotros" fuera del footer. Sora + Manrope.
  - **Nova** (2026-10-01): la más "de ahora" y la que más se mueve. **Hero
    cinematográfico** a pantalla completa (carrusel administrable de fondo con
    Ken Burns lento + gradiente vivo animado + oscurecido), **banda kinética**
    con las promos o las categorías reales, **categorías en piezas que se
    inclinan con el mouse** (tilt 3D + brillo que sigue al puntero), **barra de
    progreso** de lectura bajo el header, tarjetas `variant="nova"` y catálogo
    que **sigue cargando solo** al bajar (scroll infinito de verdad con
    `showMore()`, con "Ver más" de respaldo). Cierra con una franja oscura con
    los datos reales del local y el botón de WhatsApp. Bricolage Grotesque +
    Plus Jakarta Sans.
  - **Neón** (2026-10-01): el disruptivo, y uno de los **tres diseños oscuros**
    (Cohete y Cine son los otros). Fondo casi negro con una **grilla luminosa que
    se mueve sola**,
    tipografía arcade (Orbitron) y cian eléctrico + amarillo ácido. El nombre del
    hero entra **letra por letra**, hay **doble marquesina** cruzando en
    direcciones opuestas, **banners de promoción animados** (anillo de luz que
    gira alrededor de cada banner, reflejo que lo cruza, disco con el % real y
    "hasta el DD/MM"), una **cinta diagonal** con las promos pasando, una sección
    de **"se están agotando"** armada con el stock bajo real, y el catálogo con
    **prendas que se dan vuelta** (flip 3D): del otro lado muestran la
    descripción y los talles con stock. En táctil —o con `prefers-reduced-motion`
    — el flip no gira y esa misma info se ve abajo, siempre visible.
    - **Cómo se logra el fondo oscuro sin tocar los componentes compartidos:** el
      `body` usa `--color-brand-50` como color de página, así que la rampa
      `brand-*` de Neón está **invertida** (50 = casi negro, 500 = cian) y con
      eso se oscurece toda la tienda. El header y el footer sí tienen superficies
      claras escritas a mano, así que llevan reglas acotadas en `styles.css`
      (`[data-layout="neon"] app-header header {…}` y lo mismo para `app-footer`)
      que le ganan en especificidad a las utilidades de Tailwind. **Fue el primer
      diseño que tocó el chrome compartido** (hoy también lo hacen Cohete y
      Cine), siempre aislado por el atributo del diseño: ningún otro lo hereda.
  - **Caramelo** (2026-10-01): pastel y para los más chicos. **Rayos que giran**
    detrás del logo (`.candy-sun`), **manchas que flotan** con delays distintos
    (`.candy-blob`), ondas de nube que corren como separador (`.candy-scallop`) y
    piezas que **se aplastan como un caramelo** al pasar el mouse (`.jelly-hover`).
    Suma una sección de **"recién llegados"** ordenada por `createdAt`, que ningún
    otro diseño usa. Grandstander + Quicksand.
  - **Cohete** (2026-10-01): viaje espacial, el segundo de los **tres diseños
    oscuros** (con Neón y Cine). **Cielo estrellado que titila**, **órbitas
    punteadas que giran**, una **nave que cruza la pantalla** y **estrellas
    fugaces**. Comparte con Neón las reglas acotadas del chrome compartido.
    Bungee + Varela Round.
  - **Jungla** (2026-10-01): aventura en la selva. **Arboleda que se mece** arriba
    y abajo (`.jungla-top` / `.jungla-bottom`), **huellas que marchan solas** como
    separador, **hojas** hechas sólo con `border-radius` y piezas que **se
    balancean** al pasar el mouse. Luckiest Guy + Comic Neue.
  - **Crayón** (2026-10-01): cuaderno dibujado a mano. Es el único con **bordes
    tembleques** (`border-radius` irregular), **cintas adhesivas**, y sobre todo
    **garabatos SVG que se dibujan solos** al entrar en pantalla
    (`stroke-dashoffset` animado: cada forma lleva `pathLength="1"`). Patrick Hand
    + Comfortaa.
  - **Boutique** (2026-10-02): casa de moda en marfil, negro y dorado. La más
    silenciosa: mucho aire, tipografía serif, filetes finos y **ni una sola caja
    de color**. Cormorant Garamond + Jost.
  - **Feria** (2026-10-02): puesto de feria. **Toldo rayado** (`.feria-awning`),
    **carteles de cartón pegados con cinta adhesiva** (`.feria-board` +
    `.feria-tape`), tipografía de sello y papel kraft. Alfa Slab One + Work Sans.
  - **Periódico** (2026-10-02): primera plana. **Cabecera de diario** con doble
    filete (`.per-double-rule`), columnas y el catálogo como **ranking numerado**
    (`.per-rank`) en vez de grilla — es la única con esa estructura de lista.
    UnifrakturMaguntia + Old Standard TT + Libre Franklin.
  - **Retro 90** (2026-10-02): Memphis noventoso. Violeta eléctrico, **figuras
    geométricas que flotan**, calcomanías con sombra dura y **cinta que corre**.
    Rammetto One + DM Sans.
  - **Suizo** (2026-10-02): grilla suiza estricta. **Números de sección**,
    tipografía grotesca (Archivo + Space Mono), rojo de acento y cero adornos —
    con las **fotos en gris que se colorean** al pasar el mouse, único diseño que
    desatura las fotos del catálogo.
  - **Cancha** (2026-10-02): club de barrio. **Tablero de LED** (`.cancha-board`)
    con el **conteo real** de prendas del catálogo filtrado, **pizarra de
    vestuario**, **red de arco** y **chips con número de camiseta**. Russo One +
    Titillium Web.
  - **Cine** (2026-10-02): función de tarde, **el tercer diseño oscuro**.
    **Marquesina con foquitos que persiguen** (keyframes `cine-chase` y
    `cine-twinkle`), cortina de terciopelo, estrellas decorativas (`aria-hidden`)
    y letras de afiche, con el **conteo real** de prendas del catálogo filtrado.
    Lleva las mismas reglas acotadas de header/footer que Neón y Cohete.
    Bebas Neue + Poppins.
  - **Playa** (2026-10-02): verano. Degradé de mar (`.playa-sky`), **sol que
    flota**, **olas que cortan las secciones** (`.playa-wave`), promos vigentes
    en banda **coral** (`.playa-promos`, de `/api/discounts`) y fotos con **marco
    blanco** (`.playa-frame`). Pacifico + Outfit.
  - **Ninguno de los diseños nuevos inventa datos:** cada bloque sale de algo que
    el backend ya tenía (parametrías del grupo "Público", `/api/discounts`,
    `storePhotoUrl`, `aboutText`, `sizeStocks`, `description`, `bestSellers`,
    `featuredInPromos`). Por eso quedaron afuera testimonios, reseñas, cuotas sin
    interés, favoritos, newsletter y "cupones" anunciados: no hay tabla ni
    endpoint que los respalde —de los cupones sólo existe la validación por
    código que tipea el cliente—.
- **Vocabulario estándar en las etiquetas funcionales (2026-10-02):** los
  diseños se diferencian **sólo por lo visual**; todo texto que cumple una
  función de tienda usa las palabras de Ruth. Títulos de sección ("Lo más
  vendido", "El catálogo", "Promos", "Promos vigentes"), conteos ("N prendas"),
  kickers de filtros ("Elegí tu categoría:"), buscador ("Buscar producto..."),
  vacíos ("Sin resultados") y CTAs ("Ver todo el catálogo") **no se traducen a
  la jerga del tema**: "Función continuada", "Plantel completo" o "en cartel"
  no significan nada para quien entra a comprar. La personalidad queda en lo
  decorativo (kickers del hero, epígrafes de sección, frases de cierre y los
  chistes de los estados de error, siempre con la aclaración en castellano
  simple debajo). Se admiten variantes ya en llano con el mismo significado
  ("Los más elegidos" en Jungla, "Lo que más sale" en Crayón, "Recién
  llegados" en Caramelo, "Se están agotando" en Neón y Cohete). Al agregar un
  diseño nuevo, no volver a "traducir" las etiquetas funcionales.
- **Movimiento** (sin dependencias nuevas: CSS + cuatro directivas):
  - `shared/directives/reveal.directive.ts` (`appReveal`): IntersectionObserver
    que agrega la clase de entrada cuando el elemento aparece en pantalla;
    variantes `up` / `mask` / `bounce` / `blur` / `left` / `right` / `zoom` y
    delay escalonado (`transition-delay`) para que la grilla entre en cascada.
    Corre dentro de `zone.run()` porque la app usa zone.js (no es zoneless).
  - `shared/directives/tilt.directive.ts` (`appTilt`): inclinación 3D que sigue
    al puntero, con el brillo que la recorre (`.tilt-3d`, `.tilt-shine`). Escribe
    `--rx`/`--ry`/`--mx`/`--my` en el host: sin bindings ni change detection. Se
    apaga solo en pantallas táctiles y con `prefers-reduced-motion`.
  - `shared/directives/scroll-progress.directive.ts` (`appScrollProgress`):
    escribe `--p` (0 a 1) en el host según el scroll de la página, agrupado en un
    `requestAnimationFrame` y fuera de Angular; la barra la dibuja el CSS
    (`transform: scaleX(var(--p))`).
  - `shared/directives/auto-more.directive.ts` (`appAutoMore`): centinela de
    scroll infinito — emite cuando entra en pantalla y la plantilla llama a
    `showMore()`. El centinela sólo existe mientras `hasMore()`, así que el ciclo
    se corta solo.
  - Keyframes en `styles.css`: `fade-up`, `marquee`, `marquee-reverse`, `wobble`,
    `pop-in`, `ken-burns`, `float-y`, `sheen`, `blur-in`, `aurora-drift`,
    `glow-pulse`, `grid-slide`, `neon-ring-spin`, `neon-pulse` y `shimmer-x`,
    más utilidades `.anim-*` y `.wobble-on-hover`.
  - El anillo que gira de Neón usa `@property --neon-angle` (propiedad tipada
    registrada) para poder interpolar el ángulo del `conic-gradient`; donde el
    navegador no la soporte, el degradado queda quieto pero se ve igual. El flip
    de las prendas (`.flip`, `.flip-inner`, `.flip-face`, `.flip-back`,
    `.flip-extra`) es CSS puro: `preserve-3d` + `rotateY`, con respaldo para
    táctil y para `prefers-reduced-motion`.
  - **`prefers-reduced-motion`** apaga todas las animaciones, el tilt y el
    gradiente vivo, y deja los elementos visibles (sin el estado inicial oculto
    del reveal).
- **Para agregar un diseño nuevo:** (1) entrada en `LAYOUTS`, (2) componente de
  plantilla + su `@case` en `catalog-page.component.html`, (3) bloque de tokens
  en `styles.css` si hace falta, (4) una variante nueva en `ProductCardVariant`
  (`shared/components/product-card`) si la tarjeta tiene que verse distinto —casi
  todos los diseños la necesitan— y (5) **sumar el id al `@Pattern` de
  `AppearanceRequest`** en el backend — si no está ahí, el `PUT` devuelve 400
  aunque el frontend lo ofrezca.
  Si el diseño necesita un dato que el contenedor todavía no expone, se agrega al
  contrato `CatalogView` (así se sumaron `settings`, `promos` y
  `discountPercentFor` en la tanda de octubre): la plantilla nunca busca datos
  por su cuenta ni inyecta servicios.
- **Verificado en navegador (2026-09-30):** ciclo completo
  ruth → editorial → pop → ruth; cada cambio persiste y se ve en la tienda con
  sólo recargar, consola limpia. La tienda quedó en **Ruth** (el del cliente).
- **Verificado con las tandas de octubre (2026-10-01/02):** los 21 diseños se
  ven en las miniaturas vivas de `/admin/config/diseno`, el cambio de diseño
  se probó de punta a punta contra el backend real (`PUT apariencia` → 200 y el
  `GET /api/settings` lo refleja) y en el navegador. La tienda quedó en **Pop**
  (el elegido para probar; el default sigue siendo Ruth).

- **Los nueve diseños de movimiento (2026-10-06):** **Pasarela**, **Baraja**,
  **Líquido**, **Kinético**, **Órbita**, **Estela**, **Origami**,
  **Historias** y **Portal**. A diferencia de los 21 anteriores no se definen
  por un tema (cine, selva, feria) sino por **cómo se mueven**:
  - **Pasarela** — al bajar, la página se clava (`position: sticky`) y el
    scroll vertical corre un riel horizontal de prendas, con barra de avance.
  - **Baraja** — un mazo que se pasa arrastrando la carta de arriba (o con las
    flechas), categorías en abanico y secciones que tapan a la anterior.
  - **Líquido** — todo CSS: manchas que se deforman, la foto dentro de una
    gota, olas que corren y botones que se llenan de abajo hacia arriba.
  - **Kinético** — fuente variable (Anybody): el nombre se arma letra por
    letra y se afina con el scroll; una palabra gigante deja ver una foto por
    dentro; dos cintas de texto cruzadas.
  - **Órbita** — anillo 3D de prendas que gira solo, se arrastra con inercia y
    agranda la que queda de frente.
  - **Estela** — en el índice de categorías la foto persigue al puntero con
    tres copias a distinto ritmo; botones magnéticos. En táctil cada renglón
    muestra su miniatura.
  - **Origami** — secciones que se despliegan (`appReveal` `fold`/`flip`),
    esquinas dobladas y una solapa por prenda con los talles en stock (abierta
    siempre en táctil).
  - **Historias** — visor tipo historias (fotos del carrusel + promos reales,
    barritas de progreso, tocar para avanzar, mantener para pausar), carrete
    que encastra y filtros en una hoja inferior (`<dialog>` nativo, se
    arrastra para cerrar).
  - **Portal** — hero clavado con una ventana en arco que crece hasta ocupar
    la pantalla (`clip-path`), y la foto de la prenda "viaja" a la ficha con
    una View Transition del router.

  **Piezas compartidas nuevas** (`shared/directives/`): `appScrollScene`
  (escribe `--s` 0..1 según el scroll; modos `pin`/`view`/`exit`), `appOrbit`,
  `appCursorTrail`, `appMagnetic` y `appSwipe`; `appReveal` sumó las variantes
  `fold` y `flip`. Sin librerías nuevas. Los nueve heredan de
  `MotionTemplateBase` (`templates/motion-template.base.ts`), que sólo junta
  helpers de presentación —el markup sigue siendo de cada plantilla—.
  `destacadas()` de esa base resuelve qué muestra la pieza con movimiento
  (desfile, mazo, anillo): "Lo más vendido" si hay 4 o más, y si no las
  primeras del catálogo tituladas "Novedades" —nunca se llama "más vendido" a
  algo que no lo es—.

  **Reglas de movimiento de la tanda:** sólo se animan `transform`, `opacity`
  y `clip-path` (la excepción documentada es el `font-variation-settings` del
  título de Kinético); todo efecto de mouse va detrás de
  `(hover: hover) and (pointer: fine)` y tiene versión táctil; con
  `prefers-reduced-motion` las escenas clavadas se desarman (Pasarela queda
  como riel, Portal como arco quieto), el anillo queda plano y las historias no
  avanzan solas. Los gestos de arrastre frenan el clic en fase de captura para
  no abrir la prenda por error.

  **View Transitions:** `app.config.ts` ahora usa `withViewTransitions`. Sólo
  Portal las muestra; para el resto de los diseños y `/admin`, `styles.css`
  les saca la animación (`html:not([data-layout="portal"])::view-transition-*`).

## 7ter. Vista de promociones (`/promos`) y marcado "Mostrar en promos"

- **Qué es:** página pública que muestra las prendas en promoción. Es el destino
  natural del **banner promocional** (sección 9sexies: el campo link admite
  `/promos`, `/producto/xxxxx` o una URL) y de los links del diseño **Neón**
  (chip "Ver promos" en el hero + "Ver las prendas en promo →" en la sección de
  ofertas).
- **Qué muestra, por prioridad** (2026-10-02):
  1. Las prendas **marcadas a mano** con el checkbox **"Mostrar en promos"** del
     form de producto (`featuredInPromos`).
  2. Si no hay ninguna marcada, **fallback automático**: las prendas con
     **descuento por parametría vigente** —las mismas que devuelve
     `/api/discounts` y que aplica el carrito—, ordenadas de mayor a menor %.
  El chip "-N%" sale de `DiscountService.percentForProduct` (mismo cálculo que el
  carrito: nada se descuenta dos veces ni se anuncia un % que no se aplique).
- **Tarjeta por diseño:** la página vive **fuera** del `CatalogView`, así que no
  recibe `vm`; elige la variante de `ProductCard` con un mapa propio
  (`VARIANT_BY_LAYOUT`, duplicado a propósito) para no desentonar con el diseño
  activo. Fichero no tiene variante propia (usa filas) → `classic`.
- **Backend:** columna `featured_in_promos` (boolean, default `false`) en
  `product` —la crea sola `ddl-auto: update`—; los 4 DTOs de producto la llevan,
  `ProductService.apply()` la setea y el formulario del panel la edita.
- **Verificado en navegador + API (2026-10-02):** con y sin prendas marcadas
  (fallback), y con el banner apuntando a `/promos`. Hoy no hay ninguna marcada
  a mano: la vista muestra el fallback (las prendas con descuento vigente).

## 8. Estructura del código

```
src/app/
  core/
    config/site-config.ts       # sólo apiBaseUrl + helper apiUrl(); el resto de los datos del local viven en el backend (SettingsService)
    layouts.ts                  # registro de los 21 diseños de tienda (LAYOUTS) + ensureLayoutFonts()
    store-title.strategy.ts     # título de pestaña "<página> | <tienda>" con el storeName real (sección 9sexies)
    http/                       # auth.interceptor (Bearer en /api/admin/**), error.interceptor (401→login, toasts)
    state/collection-store.ts   # store genérico: items + status(loading/error) + saving + reload; lo componen los services
    utils/image-resize.ts       # redimensiona fotos del carrusel antes de subirlas
    models/                     # Product, CartItem, Order (status MAYÚSCULA), ParamGroup, Discount (kind MAYÚSCULA), Supplier, SizeScale
    services/                   # TODOS via HttpClient contra /api/*  (proxy → :8080)
      product.service.ts        # 2 stores: /api/products (público, activos) y /api/admin/products (todos)
      param.service.ts          # /api/param-groups (público) + /api/admin/param-groups/** (CRUD)
      size-scale.service.ts     # /api/size-scales + /api/admin/size-scales/**
      supplier.service.ts       # /api/admin/suppliers/**  (todo admin)
      discount.service.ts       # /api/discounts (público, para el preview) + /api/admin/discounts/** ; computeCartDiscount client-side
      order.service.ts          # /api/admin/orders + POST /api/orders (checkout público)
      hero-slides.service.ts    # /api/hero-slides + /api/admin/hero-slides/**
      cart.service.ts           # carrito: SOLO localStorage; items = computed(entradas ⋈ productos del catálogo)
      whatsapp.service.ts       # arma el mensaje y el link wa.me del pedido
      auth.service.ts           # POST /api/auth/login → JWT en localStorage; isAuthenticated()
      toast.service.ts          # cola de toasts (éxito/error)
    guards/admin.guard.ts       # protege /admin/* (isAuthenticated)
  shared/components/            # header, footer, product-card (20 variantes: classic/editorial/pop/vidriera/oferta/mosaico/nova/neon/caramelo/cohete/jungla/crayon/boutique/feria/periodico/retro/suizo/cancha/cine/playa), quantity-stepper, hero-carousel, toast, skeleton, site-preview
  shared/directives/            # appReveal / appTilt / appScrollProgress / appAutoMore — el movimiento (sección 7bis)
  features/
    catalog/catalog-page/       # home = CONTENEDOR: carga los datos y elige plantilla (@switch sobre layout)
    catalog/catalog-view.ts     # contrato CatalogView: lo que el contenedor le pasa a cada plantilla
    catalog/templates/          # template-ruth / editorial / pop / vidriera / ofertas / fichero / mosaico / nova / neon / caramelo / cohete / jungla / crayon / boutique / feria / periodico / retro / suizo / cancha / cine / playa — markup completo de cada diseño (21)
    promos/promos-page/         # vista /promos: prendas marcadas "Mostrar en promos" o, si no hay, las de descuento vigente (sección 7ter)
    product-detail/             # ficha de producto (talle con stock, cantidad, agregar al carrito)
    cart/cart-page/             # carrito + entrega (retiro/envío) + pago + "Comprar por WhatsApp"
    admin/                      # login, layout, productos, pedidos, carrusel, admin-config/ (hub + secciones + Diseño) — ver 9bis y 9sexies
  core/services/geocoding.service.ts     # autocompletado de direcciones (Nominatim/OSM), sesgado a Tucumán
  shared/components/address-picker/      # busca dirección + mapa Leaflet con pin arrastrable
```

## 9. Cómo funciona el checkout por WhatsApp

1. Cliente agrega prendas al carrito eligiendo talle y cantidad (limitado
   al stock de ESE talle puntual). El carrito vive en `localStorage`.
2. En `/carrito` carga su nombre, elige **entrega** (retiro en el local /
   envío a domicilio) y **medio de pago**, y toca **"Comprar por WhatsApp"**:
   - **Envío:** un autocompletado de direcciones (`GeocodingService` contra
     **Nominatim / OpenStreetMap** — gratis, sin key; se cambió de georef-ar
     porque no tenía coordenadas de las calles de San Miguel de Tucumán) + un
     **mapa Leaflet** con pin arrastrable para marcar la puerta exacta
     (`<app-address-picker>`) + un campo de referencia. El costo del envío
     **no** se cotiza acá: se coordina por WhatsApp.
   - **Pago:** el cliente elige entre los medios que el dueño habilitó en
     `/admin/config/pagos` (transferencia por alias, QR de transferencia, QR/link
     de tarjeta, efectivo). Si no hay ninguno cargado, se coordina por WhatsApp.
   Ahí el frontend hace `POST /api/orders` → el **backend** crea el pedido con
   código correlativo (`PED-0001`…), calcula los descuentos y el total, y lo
   guarda con la entrega y el pago. Con el pedido devuelto se abre
   `wa.me/<número>` con el mensaje ya armado (incluye entrega, dirección + link
   de mapa, y el medio de pago — con el alias si aplica).
3. El dueño/a recibe el pedido por WhatsApp con todo el detalle y sólo tiene que
   pasar el QR si el cliente eligió pagar con QR (el alias y los links ya van en
   el mensaje), y coordinar el costo del envío si corresponde.
4. El dueño/a entra a `/admin/pedidos`, busca el pedido por su código,
   **tilda/destilda cada prenda** según si la va a entregar y toca
   **"Confirmar y descontar stock"** — el backend descuenta el stock de cada
   talle confirmado. También puede cancelar el pedido completo sin tocar stock.

## 9bis. Panel de administración — módulos

- `/admin` — **Inicio**: resumen (pedidos pendientes, facturación del mes,
  conteo de productos, últimos pedidos) + **lista de productos por reponer**
  (talles con stock ≤ umbral). El menú lateral muestra un badge rojo con la
  cantidad de talles en alerta (como el de pedidos pendientes).
- `/admin/pedidos` — listado de pedidos **paginado** (20 por página) con
  **filtros** (server-side): buscar por código o nombre del cliente, estado
  (pendientes / confirmados / cancelados), y rango de fechas. Contador de
  pendientes en el menú (de `/api/admin/orders/pending-count`).
- `/admin/pedidos/:id` — detalle: **entrega** (retiro / envío con dirección,
  referencia y link al mapa) + **medio de pago** en dos tarjetas arriba;
  tildar/destildar ítems, confirmar (descuenta stock) o cancelar el pedido
  completo. **No deja confirmar** si algún ítem tildado no tiene stock suficiente
  (muestra qué falta y el backend también lo rechaza). Usa un *resolver*
  (`orderResolver`) — no depende de que el pedido esté en la página cargada.
- `/admin/productos` — listado **paginado** (20 por página). `nuevo` / `:id/editar`
  — CRUD con stock por talle, **galería de fotos** (agregar por URL o subir del
  celu → Cloudinary, reordenar, quitar; la primera es la portada), **link de
  video** de YouTube (opcional) y **umbral de stock bajo** propio (vacío =
  default global 3). El form de edición usa un *resolver*.
- `/admin/carrusel` — fotos del carrusel de la home: subir foto (se redimensiona
  sola y va a **Cloudinary**, sección 44), editar descripción, reordenar,
  eliminar.
- `/admin/parametrias` — grupos de clasificación de prendas (ver sección 9ter).
- `/admin/talles` — escalas de talle editables (ver sección 9quinquies).
- `/admin/proveedores` — proveedores del local (ver sección 9quater).
- `/admin/promociones` — descuentos automáticos (solo carrito), 4 tipos: por
  **monto de compra**, por **parametría** ("todo lo de bebé 15% off"), por
  **medio de pago** (efectivo, transferencia, QR, tarjeta — se aplica según lo
  que elige el cliente al comprar) y **envío gratis por monto** (informativo, no
  descuenta plata: muestra "envío gratis" + un detalle configurable). Cada
  descuento tiene un tilde **acumulable** (si hay uno no acumulable en juego, se
  aplica solo el que más ahorra; si todos son acumulables, se combinan en
  cascada) + un texto de **detalle** ("letra chica") + **fechas de vigencia**.
  Ya no hay "modo de combinación" global.
- `/admin/cuenta` — cambiar contraseña.
- `/admin/recuperar` — recuperar la cuenta por DNI, te manda una contraseña
  nueva por mail (ruta pública, fuera del layout del admin).
- `/admin/config` (+ `/config/identidad`, `/config/redes`, `/config/nosotros`) —
  configuración del sitio con previsualización en vivo (ver sección 9sexies).
- `/admin/metricas` — métricas de ventas por período (ver sección 9septies).

## 9ter. Parametrías (clasificación de prendas)

- **Qué son:** grupos editables desde `/admin/parametrias` para clasificar
  las prendas sin tocar código. Por defecto vienen tres:
  - **Público** (`grp-publico`, de sistema, no se puede borrar): Bebé, Nena,
    Nene, Unisex. Reemplaza a la vieja categoría fija del producto.
  - **Tipo de prenda** (`grp-tipo`): Remera, Buzo/Campera, Pantalón, Jean,
    Vestido/Pollera, Body/Enterito, Conjunto, Calzado, Accesorio.
  - **Estación** (`grp-estacion`, admite varias opciones por prenda):
    Primavera, Verano, Otoño, Invierno, Todo el año.
- Cada grupo tiene dos flags: "varias opciones" (multi-select por prenda) y
  "filtro en la tienda" (aparece como filtro en la home).
- El producto guarda `params: { [groupId]: optionId[] }`. Al cargar/editar un
  producto aparecen los selectores generados desde estos grupos; los grupos de
  sistema son obligatorios.
- **Migración:** los productos viejos en `localStorage` que tenían
  `category: 'bebe'|...` se convierten solos a `params['grp-publico']` al
  cargar (`ProductService.migrateProduct`).
- Los IDs de grupos/opciones por defecto son fijos (no aleatorios) para que
  la migración y los productos de ejemplo sean deterministas.

## 9quater. Proveedores (info interna del admin)

- **Qué es:** `/admin/proveedores` — alta/edición de proveedores (nombre,
  teléfono, dirección, notas). `Supplier` + `SupplierService` (localStorage
  `pp_suppliers`, arranca vacío).
- El producto tiene dos campos **opcionales**: `supplierId` y `costPrice`
  (precio de compra). Se cargan en la sección "Compra / proveedor" del form de
  producto, que muestra la **ganancia** estimada (`margin()` en
  `product.model.ts`: venta − costo, y % de markup sobre el costo).
- **Calculadora de precio de venta:** en esa misma sección hay un campo
  "% que le querés ganar (sobre el costo)". Al cargarlo (con el costo puesto),
  escribe automáticamente el "Precio (ARS)" = costo × (1 + %/100). El % no se
  guarda en el producto — es solo calculadora; el precio queda editable a mano.
  Al editar un producto que ya tiene costo y precio, el campo arranca con el %
  implícito.
- El listado `/admin/productos` tiene una columna "Compra" con proveedor,
  costo y margen (verde/rojo).
- La ficha del proveedor (entrar a editarlo) lista las prendas que le
  compraste, con su margen y link a editarlas.
- **Nada de esto se muestra al público**: ni en la ficha, ni el catálogo, ni
  el carrito, ni el mensaje de WhatsApp, ni en el pedido (`OrderLine` solo
  guarda el precio de venta). Al borrar un proveedor, las prendas quedan sin
  proveedor pero conservan el `costPrice`.

## 9quinquies. Escalas de talle

- **Qué son:** `/admin/talles` — conjuntos de talles con nombre (`SizeScale` +
  `SizeScaleService`, localStorage `pp_size_scales`). Vienen 5 de ejemplo con
  IDs fijos: `escala-bebe` (RN, 0-3M…24M), `escala-ninos` (1-16),
  `escala-adultos` (XS-XXL), `escala-calzado-ninos` (17-34),
  `escala-calzado-adultos` (34-46). Los seed no se pueden borrar (sí editar
  sus valores); se pueden crear escalas nuevas.
- `ProductSize` dejó de ser un tipo fijo → es `string`. El producto guarda
  `sizeScaleId` y su `sizeStocks[].size` sale de esa escala.
- **Alta de producto:** primero se elige la escala (obligatorio), y la grilla
  de talles se arma con los valores de esa escala. Al cambiar de escala se
  descartan los talles que no existen en la nueva.
- **Migración:** productos sin `sizeScaleId` (mocks y datos viejos de
  localStorage) → se infiere con `inferSizeScaleId()` (la escala seed más chica
  que contiene todos sus talles). Los pedidos/carrito guardan el talle como
  string → no hay migración ahí.
- **Catálogo:** el filtro de talle lista sólo los talles presentes en el
  catálogo, ordenados según el orden de las escalas.

## 9sexies. Configuración del sitio (configurable sin desplegar)

- **Qué es:** `/admin/config` — un **hub** con tarjetas hacia sub-páginas
  (`admin-config/`, componente único `AdminConfigSectionComponent` por
  `data.section`): **identidad y contacto** (`/config/identidad`: nombre + **logo**
  + WhatsApp + **dirección del local** para el retiro), **mensaje de WhatsApp**
  (`/config/whatsapp`), **medios de pago** (`/config/pagos`: transferencia por
  alias, QR de transferencia, QR/link de tarjeta, efectivo — cada uno con un
  **tilde de activar/desactivar** aparte del dato; aparece en el checkout si está
  tildado *y* tiene su dato), **redes sociales** (`/config/redes`), **sobre
  nosotros** (`/config/nosotros`) y **carrusel** (`/admin/carrusel`).
  Los cambios se aplican al instante para todos, sin redesplegar. `/admin/ajustes`
  redirige a `/admin/config`.
- **Diseño de la tienda (`/admin/config/diseno`, desde 2026-09-30):** es la
  primera tarjeta del hub. Va en un componente aparte (`AdminDesignComponent`),
  no como `data.section` de `AdminConfigSectionComponent`, porque no edita
  campos: muestra las **21 plantillas** (sección 7bis) como **miniaturas vivas** —
  la home real renderizada a `w-[1440px]` y escalada a 0.32, con
  `pointer-events-none` y `[preview]="true"`. O sea: los productos, las fotos y
  los textos **de ese sitio** dibujados por cada diseño, no una ilustración.
  "Usar este diseño" → `SettingsService.updateAppearance(id)` →
  `PUT /api/admin/settings/apariencia`; la tarjeta activa queda marcada con un
  anillo y la leyenda "EN USO", y el cambio se ve en la tienda con sólo
  recargar. Ruta con `permissionGuard` + `PLATFORM_SETTINGS_MANAGE`.
  **Ojo con los permisos:** la cuenta de Ruth (`11111111`) **no tiene**
  `PLATFORM_SETTINGS_MANAGE` (ver #46), así que hoy el diseño lo cambia sólo
  la cuenta superadmin (`33756194`); si Ruth tiene que elegir el diseño hay
  que darle el permiso editando su rol en `/admin/usuarios` (o darle un rol
  que lo tenga). A la tienda el cambio le llega igual: `GET /api/settings`
  no pide permiso.
  **Pendiente:** sumarla al menú lateral (grupo "Configuración del sitio"); hoy
  se entra por el hub.
- **Previsualización en vivo:** cada sub-página muestra al costado un
  `<app-site-preview>` (`shared/components/site-preview/`) — una maqueta del
  encabezado + pie + mensaje de WhatsApp que se actualiza mientras se tipea
  (todavía sin guardar), con la sección relevante destacada y el resto atenuado.
  No monta los componentes reales del storefront (sería acoplar el signal global).
- **Sub-página** = `AdminConfigSectionComponent`, parametrizado por `data.section`
  en la ruta. Edita sólo su parte de `SiteSettings`, y al guardar la mezcla con
  el resto (el `PUT /api/admin/settings` pide el objeto completo). El botón
  "Guardar" se deshabilita si no hay cambios (`dirty`).
- **Logo y QRs de pago:** se suben del disco → `resizeImageFile(...)` → **Cloudinary**
  (sección 44, carpetas `estilos-pequenos/logo` y `.../pagos`) → la URL queda en
  `site_settings.logo_url` / `payment_qr_*` (`MEDIUMTEXT`; los data-URI viejos
  siguen funcionando). Logo null = `logo.jpeg`, el archivo estático.
  `SettingsService.logoSrc` lo resuelve; lo usan header, footer, home, login,
  recuperar, layout del admin y el `<app-site-preview>`. También actualiza el
  **favicon** en vivo (`SettingsService.applyFavicon`).
- **Mensaje de WhatsApp:** `whatsappIntro` (saludo) y `whatsappClosing` (cierre,
  ej: cómo pagar) — texto libre con tokens `{tienda}` y `{codigo}` (ver
  `applyWhatsappTokens` en `whatsapp.service.ts`). El detalle del pedido y los
  totales quedan fijos. null = usar `WHATSAPP_INTRO_DEFAULT` / `WHATSAPP_CLOSING_DEFAULT`.
- **Backend:** tabla `site_settings` (una sola fila, id fijo `config`) — sumó
  `logo_url`, `whatsapp_intro`, `whatsapp_closing` y (2026-09-30) **`layout`**
  con el id del diseño de la tienda. `GET /api/settings` (público),
  `GET`/`PUT /api/admin/settings` (con token) y
  `PUT /api/admin/settings/apariencia` (sólo el diseño, para no mandar el
  objeto completo). El mensaje de pedido se arma en el frontend
  (`WhatsappService`), el backend sólo guarda los textos.
- **Frontend:** `SettingsService` (signal-based, `providedIn: 'root'`) carga
  `/api/settings` al arrancar la app y expone `settings()`, `logoSrc()`,
  `whatsappUrl()`, `instagramUrl()`. Si el backend no responde, usa `DEFAULTS`.
- **Título de pestaña dinámico (2026-10-02):** `StoreTitleStrategy`
  (`core/store-title.strategy.ts`, registrada como `TitleStrategy` en
  `app.config.ts`) arma `<página> | <nombre de la tienda>` en las páginas
  públicas, con el `storeName` real de `/api/settings`: cambiar la marca no
  obliga a tocar rutas ni redeployar. En el panel (`/admin`) el título queda
  como lo define cada ruta (`X | Admin`), sin el nombre de la tienda.
  `SettingsService` se resuelve **diferido** (primera navegación + `effect` con
  guarda `inAdmin`): construir el servicio en el constructor de la estrategia
  dispara el request de `/api/settings`, cuyo interceptor vuelve a pedir el
  Router → ciclo de DI que rompía el fetch en silencio (ver historial #63).
- **Banner promocional (popup, sección "Sobre nosotros"):** `promoBannerEnabled`
  + imagen (**Cloudinary**, carpeta `estilos-pequenos/marketing`) + link
  opcional. `PromoBannerComponent` (`shared/components/promo-banner/`, montado
  en `AppComponent`) lo muestra **una vez por pestaña** al entrar al sitio
  (`sessionStorage: promoBannerDismissed`), se cierra con la X o tocando afuera,
  y sólo aparece si está activado *y* tiene imagen. El link admite `/promos`
  (lleva a la vista de promociones, sección 7ter), `/producto/xxxxx` o una URL.
- **Validación** del número: solo dígitos, 8 a 15 (sin `+`, espacios ni `15`).
  Mismo `@Pattern` en el DTO del backend y en el form; el preview marca en rojo
  el link `wa.me` si el número no valida.
- Sigue **pendiente** cargar el número de WhatsApp real (hoy `5491122334455`).

## 9octies. Menú del panel (agrupado + drawer mobile)

- **`AdminLayoutComponent`:** el menú lateral pasó de 13 items planos a **Inicio**
  suelto + tres grupos colapsables (acordeón): **Ventas** (Pedidos, Descuentos,
  Métricas), **Catálogo** (Productos, Parametrías, Talles, Proveedores) y
  **Configuración del sitio** (Vista general, Identidad y contacto, Mensaje de
  WhatsApp, Medios de pago, Redes sociales, Sobre nosotros, Carrusel) + **Mi
  cuenta** y **Ver tienda** abajo.
- El grupo de la ruta activa se abre solo; el resto recuerda su estado en
  `localStorage` (`ep_admin_menu_open`). Grupo colapsado con badge = suma de
  pendientes de sus items (hoy: pedidos pendientes).
- **Mobile:** la barra dejó de ser un scroll horizontal — ahora es un **drawer**
  que se abre con un botón hamburguesa en una barra superior fija, con backdrop,
  y se cierra al navegar. "Nuevo producto" salió del menú (queda el botón en
  `/admin/productos`).

## 9septies. Métricas de ventas

- **Qué es:** `/admin/metricas` — tablero de ventas leyendo del backend
  (`GET /api/admin/metrics`). Cuenta sólo los **pedidos procesados**
  (confirmados), por la fecha de confirmación; la facturación es a **precio de
  lista** (no aplica el descuento del pedido).
- **Filtros:** presets de rango (este mes / últimos 3 / este año / últimos 12
  meses) + fechas desde-hasta a mano, y un selector "desglosar por" con los
  grupos de parametría (por defecto "Tipo de prenda").
- **Muestra:** 3 totales (facturación, prendas, pedidos); barras de facturación
  por mes (serie continua); "más vendidos" (top 10 por unidades) y "menos
  vendidos" (incluye productos activos con 0 ventas); y el desglose por el
  grupo elegido (unidades + facturación por opción).
- **Comparativas** (bloque aparte, siempre del año en curso, no depende del
  filtro de arriba): "este mes vs. meses anteriores" (facturación total mes a
  mes) y "semana en curso vs. meses anteriores" (mismo tramo de días —bloques
  de 7, cortados en hoy— mes a mes). El mes actual va resaltado.
  `GET /api/admin/metrics/comparison`.
- **Front:** `MetricsService` (signals: `metrics`/`status` para el tablero,
  `comparison`/`comparisonStatus` para las comparativas), `AdminMetricsComponent`.
  Barras con CSS (sin librería de charts).
- **Pendiente:** desglose por talle y por proveedor (el backend hoy sólo hace
  por grupo de parametría).

## 10. Pendientes / próximos pasos conocidos

> ⚠️ **Esta sección es del 2026-09-08 y está bastante atrasada**: varios de los
> ítems de abajo se hicieron en las tandas del 2026-09-09 al 2026-09-18 (rate
> limiting del login, multi-admin con roles, cupones, export CSV, "mis pedidos",
> imágenes a Cloudinary, cambios de prenda, caja, turnos, POS, métricas por
> talle y proveedor…). Está sin limpiar a propósito: lo que sigue siendo cierto
> son los ítems de la lista de arriba sin marcar referidos a **publicar**
> (WhatsApp real, contraseñas, remitente de Brevo, fotos reales, dominio). Si
> algo de acá te confunde, mirá el historial (sección 11 y 12) antes que la
> lista.

- [ ] Cargar el número de WhatsApp real desde `/admin/ajustes` antes de publicar
      (hoy hay un placeholder, `5491122334455`).
- [ ] Cambiar la contraseña de Ruth (`ruth123`) y de Augusto (`augusto123`)
      antes de publicar — desde `/admin/cuenta`, o pedir una nueva por mail
      desde `/admin/recuperar` (ya no hay frase de recuperación).
- [ ] Verificar un remitente propio en Brevo (dominio del negocio, no un Gmail)
      para que los mails de campaña no caigan en spam — cargarlo en
      `/admin/config/servicios`.
- [ ] En prod: definir `JWT_SECRET` (≥32 chars) y `apiBaseUrl` si el backend
      va en otro dominio.
- [ ] Sumar fotos reales de los productos y del carrusel (hoy son íconos SVG).
- [ ] Definir si se ajusta la paleta de colores del sitio a los tonos del logo.
- [ ] Deploy/hosting: front (estático) + backend (Java + MySQL). Ver
      `../backend/PROYECTO.md` §9 y §11.
- [ ] Métricas (`/admin/metricas`, sección 9septies): sumar el desglose por
      **talle** y por **proveedor** (hoy hace totales, por mes, top/bottom
      productos y por parametría).
- [ ] (Backend) Flyway, perfil `prod`, proyecciones DTO — ver `../backend/PROYECTO.md` §11.

### Roadmap de mejoras (análisis 2026-09-08 — 5 puntos hechos, resto pendiente)

> **2026-09-28:** esta lista tiene muchas cosas ya hechas sin tildar
> (duplicar, archivar, cupones, editar pedido pendiente, ajuste masivo,
> "mis pedidos", "cómo comprar" + FAQ, CSV, compras a proveedor, "lo más
> vendido", modal propio, rate-limiting, multi-admin, métricas por
> talle/proveedor, devoluciones/cambios). La lista **al día** de lo que falta,
> verificada contra el código, está en `../backend/PROYECTO.md`
> §11bis.

Hechos: galería de fotos por producto · dashboard `/admin` + stock bajo ·
paginación del panel · orden del catálogo por precio · filtros de pedidos ·
fix de sobreventa · vigencia por fechas en descuentos.

Pendientes, por prioridad:
- [ ] **Open Graph / meta tags dinámicos** (compartir productos en WhatsApp con
      preview). Pausado: depende del hosting (los bots no ejecutan JS → SSR/
      prerender o endpoint de meta por User-Agent). Junto con SSR.
- [x] **Imágenes a storage externo** — Cloudinary (unsigned upload desde el
      front, sección 44): productos, carrusel, logo y QRs de pago. Config en
      `site-config.ts`. Migración de los data-URI existentes:
      `frontend/scripts/migrate-images-to-cloudinary.mjs`.
- [x] **Entrega (retiro/envío) + medio de pago** en el checkout (hecho 2026-09-08,
      sección 9 y 36). Pendiente: **cotizar el envío** (hoy es "a coordinar"; a
      futuro zonas con precio). El geocoder ya es Nominatim/OSM (georef-ar no
      cubría San Miguel de Tucumán); para volumen alto habría que auto-hospedar
      Nominatim o pasar a LocationIQ/Geoapify (free tier, compatibles).
- [ ] **Estados de pedido más finos** ("pago recibido", "entregado") + notas internas.
- [ ] Variantes de **color** (stock por talle+color) · **SSR/prerender** ·
      **multi-admin con roles** · métricas por talle/proveedor + export CSV.
- [ ] Técnico: rate-limiting en login · tests del frontend · PWA · página 404 real ·
      analytics · backups · encoding UTF-8 al compilar `DataSeeder.java`.

Propuestas de la 2ª revisión (2026-09-08):
- [ ] Quick wins: nombre editable en descuentos (`label`) · "últimas X unidades"
      en la tienda · validar cantidad vs stock en el carrito + `@Max` en el pedido ·
      duplicar producto · buscador/filtros en `/admin/productos` · soft-delete de
      productos · copiar/re-enviar el resumen del pedido desde el admin.
- [ ] Medianos: editar un pedido pendiente (cantidades / agregar-quitar líneas) ·
      registrar el pago en el pedido · guía de talles (cm por escala) ·
      confirmaciones con modal propio · limpiar pedidos pendientes viejos.
- [ ] Técnicos: `/actuator/health` · `decrementStock` que lance en vez de clampear ·
      sincronizar el carrito entre pestañas.

Propuestas de la 3ª revisión (2026-09-08):
- [ ] Vender más: cupones/códigos de descuento · "lo más vendido" en la home ·
      productos relacionados en la ficha · colecciones curadas a mano.
- [ ] Operación: registro de ingreso de mercadería (suma stock + historial de
      compras por proveedor) · ajuste de precios masivo · hoja de armado del
      pedido (imprimible) · exportar pedidos/productos a CSV.
- [ ] UX cliente: zoom en la foto · "mis pedidos" (estado por código) · filtro por
      rango de precio · recordar el nombre en el checkout · página "cómo comprar"
      + FAQ editable.
- [ ] Confianza: sellos configurables en checkout/footer.
- [ ] Técnico/seguridad: invalidar el JWT al cambiar la contraseña (`tokenVersion`)
      + logout global · headers de seguridad (CSP/HSTS/X-Frame-Options) ·
      `<img onerror>` placeholder · toast con "deshacer" en borrados ·
      auditoría de acciones del admin.

Propuestas de la 4ª revisión (2026-09-08, más de nicho):
- [ ] Rubro: lista de nacimiento/baby shower · combos/packs · buscador de talle
      por edad/peso · reserva/seña · precio mayorista.
- [ ] Stock/operación: **stock reservado al crear el pedido** (hoy sólo baja al
      confirmar → se puede sobre-vender la última unidad) · devoluciones/cambios ·
      modo "tienda cerrada".
- [ ] Analítica: contador de vistas por producto (vistos vs vendidos) · ranking de
      clientes · tasa de conversión de pedidos · mes vs mismo mes del año pasado.
- [ ] Ficha: descripción con bullets · cuidados de la prenda · video corto.
- [ ] Marketing: cuenta regresiva de oferta (usa `endsAt`) · recordatorio de
      carrito abandonado (banner) · programa de referidos.

## 11. Historial de pedidos/decisiones relevantes (cronológico)

1. Pedido inicial: frontend Angular + backend Java, sin pasarela de
   pago, checkout por WhatsApp con alias/link de Mercado Pago.
2. Se armó el proyecto Angular 19 + Tailwind v4 desde cero, con catálogo,
   carrito, checkout WhatsApp y panel admin (alcance elegido por el
   cliente entre varias opciones).
3. Se agregó stock por talle (antes era un stock único por producto).
4. Se renombró la tienda de "Pequeños Pasos" (nombre provisorio inicial)
   a **"Estilos Pequeños"** (nombre real del comercio).
5. Se incorporó el logo real del comercio (favicon, header, footer,
   admin).
6. Se agregó hero grande con logo + carrusel de imágenes en la home
   (pedido porque el logo "no se veía" en el header chico).
7. Se agregaron imágenes a productos y carrusel (íconos SVG de ejemplo,
   ver sección 7) — pendiente reemplazar por fotos reales.
8. Se agregó "Sobre nosotros" + redes sociales (Instagram, Facebook) al
   pie de página (configurables en `site-config.ts`, sección `redes`).
9. Se agregó sistema de pedidos con código (`PED-XXXX`): el checkout por
   WhatsApp ahora crea un pedido rastreable, y el admin puede
   tildar/destildar ítems y confirmar para descontar stock automático (o
   cancelar el pedido completo). Ver sección 9bis.
10. Se agregó panel `/admin/carrusel` para subir/reordenar/sacar las
    fotos del carrusel de la home sin tocar código.
11. En los links de redes del footer se reemplazaron los emoji (💬📷👍)
    por íconos de marca reales (SVG propio: WhatsApp verde, Instagram
    degradé, Facebook "f" azul) — pedido explícito del cliente.
12. Se rehizo el layout de la home: el carrusel de fotos tapaba el logo y
    el texto (estaban superpuestos). Ahora el logo/nombre/bajada van en
    una franja arriba, y el carrusel queda debajo, en su propia franja,
    bien visible sin nada encima.
13. Se agregaron **promociones por monto de compra**: `/admin/promociones`
    permite crear/editar/habilitar/deshabilitar escalones tipo "compra
    mayor a $100.000 → 20% off" (vienen dos cargados de ejemplo: $100.000
    → 20%, $200.000 → 25%). El descuento se aplica **solo en el
    carrito** (no toca los precios del catálogo/ficha de producto): se
    usa el escalón habilitado de mayor descuento que el subtotal alcance,
    se muestra un banner ("te faltan $X para Y% off" o "descuento
    aplicado"), y el pedido que se crea (código, WhatsApp, panel de
    admin) ya queda con subtotal/descuento/total.
14. Se agregaron **parametrías** (`/admin/parametrias`, sección 9ter): grupos
    editables (Público, Tipo de prenda, Estación) para clasificar las prendas
    sin hardcodear. La vieja categoría fija (bebé/nena/nene/unisex) pasó a ser
    la parametría "Público" (con migración automática de datos viejos). Los
    filtros del catálogo ahora se generan solos desde las parametrías. El alta
    de producto usa selectores dinámicos.
15. Los **descuentos** ahora también pueden ser **por parametría** (ej: "todo
    lo de bebé 15% off", "todo lo de verano 20% off"), además de por monto.
    Los de parametría se aplican por prenda del carrito que tenga esa opción.
    Hay un **modo de combinación** configurable: "aplicar el mayor" (no
    acumula) o "combinar". `PromoService` → `DiscountService`, `PromoTier` →
    `Discount`. El carrito muestra el detalle de cada descuento aplicado.
16. Se agregó, en el carrito, un link "← Seguir comprando" (antes desde mobile
    no había forma visible de volver al catálogo). Ajustes de responsive en
    parametrías/descuentos y el nav del admin (scrollea horizontal en mobile).
17. Se agregaron **proveedores** (`/admin/proveedores`, sección 9quater): alta
    de proveedores con datos de contacto + campos opcionales `supplierId` y
    `costPrice` en el producto, con cálculo de ganancia. Todo info interna del
    admin, no se muestra al público.
18. Calculadora de precio de venta en el form de producto: se pone el costo y
    el "% que le querés ganar" y el precio de venta se completa solo
    (costo × (1 + %/100)). El % no se persiste, el precio queda editable.
19. **Escalas de talle** (`/admin/talles`, sección 9quinquies): los talles
    dejaron de estar fijos en el código. `ProductSize` pasó a ser `string`, el
    producto tiene `sizeScaleId`, y en el alta se elige la escala (ropa bebé,
    niños, adultos, calzado…). El filtro de talle del catálogo se volvió
    dinámico. Se dejó anotado un pendiente de pantalla de métricas.
20. **Se arrancó el backend** (`../backend/`, sección 12): Spring Boot 3.3 +
    Java 21 + MySQL 8 + JWT. CRUD completo del admin, catálogo público, y
    creación de pedidos con cálculo de descuentos server-side.
21. **Se conectó el frontend al backend** (2026-09-08): los ~8 services pasaron
    de `localStorage` a `HttpClient` contra `/api/*` (proxy del dev-server →
    `:8080`). Auth por JWT (`admin`/`ruth123`), interceptor que lo manda en
    `/api/admin/**` y que en 401 vuelve al login. Manejo de carga/error
    "completo": `CollectionStore` genérico, skeletons, estados de error con
    "reintentar", y toasts. El carrito sigue siendo local. El backend sumó
    `GET /api/discounts` (público) para el preview del descuento en el carrito.
22. **Recuperación de contraseña + gestión de cuenta** (2026-09-08): pantalla
    `/admin/recuperar` (usuario + **frase de recuperación** + contraseña nueva,
    sin email) y `/admin/cuenta` (cambiar contraseña y frase). Backend: campo
    `recoveryHash` en `AdminUser`, `POST /api/auth/recover`,
    `PUT /api/admin/account/password` y `/recovery`. Frase inicial
    `frase-de-recuperacion-cambiar`.
23. **Datos del local configurables** (2026-09-08, sección 9sexies): el nombre
    de la tienda, el número de WhatsApp, el "sobre nosotros" y las redes salieron
    de `site-config.ts` y se editan desde `/admin/ajustes`. Backend: tabla
    `site_settings` (fila única), `GET /api/settings` (público) +
    `GET`/`PUT /api/admin/settings`. Frontend: `SettingsService` con fallback a
    `DEFAULTS`. `site-config.ts` quedó sólo con `apiBaseUrl`.
24. **Métricas de ventas** (2026-09-08, sección 9septies): `/admin/metricas` —
    tablero con facturación / unidades / pedidos por período, facturación por
    mes, productos más y menos vendidos, y desglose por parametría (por defecto
    "Tipo de prenda"). Backend: `GET /api/admin/metrics` (`MetricsService`),
    sobre los pedidos PROCESADO. Barras en CSS, sin librería de charts.
    Se sumó el bloque **Comparativas** (`/metrics/comparison`): este mes vs. los
    meses anteriores del año, y la semana en curso vs. el mismo tramo de días de
    los meses anteriores.
25. **Galería de fotos por producto** (2026-09-08): el producto pasó de una sola
    `imageUrl` a `images[]` (la primera es la portada). El form de producto tiene
    un administrador de fotos (agregar por URL o subir del disco → data URI,
    reordenar, quitar) y la ficha muestra la galería con miniaturas. Backend:
    `Product.images` (tabla `product_image`); la respuesta mantiene `imageUrl`
    (portada) para las tarjetas y el carrito.
26. **Inicio del panel + alertas de stock bajo** (2026-09-08): `/admin` dejó de
    redirigir a productos y ahora es un dashboard (`AdminDashboardComponent`):
    pedidos pendientes, facturación del mes, conteo de productos, últimos
    pedidos y **lista de productos por reponer** (talles con stock ≤ umbral).
    Badge rojo en el menú. El producto tiene un `lowStockThreshold` propio
    (vacío = default 3). Backend: `GET /api/admin/dashboard` + `/low-stock`.
27. **Ordenar el catálogo por precio** (2026-09-08): selector en la home
    (novedades / precio ↑ / precio ↓). Client-side, sobre `filteredProducts`.
28. **Paginación de los listados del panel** (2026-09-08): `/admin/productos` y
    `/admin/pedidos` traen 20 por página (`CollectionStore` sumó `loadPage` /
    `page` / `totalPages`; `<app-pagination>` reusable). El detalle de pedido
    pasó a `orderResolver` + señal local (las mutaciones devuelven el pedido
    nuevo); `OrderService.pendingCount` sale de `/pending-count`. El catálogo
    público NO se pagina (sigue client-side para no romper filtros/orden).
29. **Confirmación de pedido estricta** (2026-09-08): el detalle no deja
    confirmar si algún ítem tildado no tiene stock (recuadro rojo con el detalle,
    botón deshabilitado); el backend además lo rechaza con 400. El detalle
    ahora trae el stock real de los productos del pedido (`fetchOne` por línea).
30. **Vigencia por fechas en descuentos** (2026-09-08): cada descuento tiene
    `startsAt` / `endsAt` opcionales. Fuera del rango no se aplica (el backend
    filtra por `activeNow()` y expone `status`; el front usa `status` para el
    cálculo del carrito). En `/admin/promociones`: dos date inputs por fila +
    en los "agregar", y un pill de estado (Programado / Vencido / Vigente).
31. **Filtros en el listado de pedidos** (2026-09-08): `/admin/pedidos` tiene una
    barra de filtros (buscar por código/nombre, estado, rango de fechas) que se
    resuelve **server-side** (`GET /api/admin/orders?search&status&from&to`).
    `CollectionStore` sumó `setQuery()` para llevar query params en el paginado.
32. **Badge de "por reponer" como notificaciones no leídas** (2026-09-08): el
    contador rojo del menú (y la tarjeta "Por reponer" del inicio) ahora cuenta
    sólo los talles en alerta que el admin **no revisó todavía**. Al abrir un
    talle desde la lista "Productos por reponer" queda marcado como visto y baja
    el contador, aunque no se haya repuesto (fila atenuada con ✓). Las marcas
    viven en `localStorage` (`ep_low_stock_seen`, por dispositivo) y se limpian
    solas cuando el talle sale de la lista: si se repone y vuelve a bajar, alerta
    de nuevo. Todo en `DashboardService` (`markLowStockSeen`, `lowStockCount`
    filtra por vistos). Sin cambios en el backend.
33. **Marcar un producto "no reponer"** (2026-09-08): para que un producto que ya
    no se va a reponer no quede para siempre en "Productos por reponer". El
    producto tiene un flag `discontinued`: sigue publicado y se vende mientras
    tenga stock, pero no aparece en las alertas de stock bajo ni suma al badge.
    Se marca con el botón "no reponer" en cada fila de la lista del inicio, o con
    el checkbox "No reponer" en el form del producto; se revierte editando el
    producto. `/admin/productos` muestra "No se repone" en la columna Estado.
    Backend: `Product.discontinued`, `PATCH /api/admin/products/{id}/discontinued`,
    `DashboardService.lowStock()` lo excluye. Front: `ProductService.setDiscontinued`,
    `DashboardService.removeProductFromLowStock` (quita optimista de la lista).
34. **Menú del panel agrupado + "Configuración del sitio" con previsualización**
    (2026-09-08, secciones 9sexies y 9octies): el menú lateral (13 items planos)
    pasó a Inicio + 3 grupos colapsables (Ventas / Catálogo / Configuración del
    sitio) + Mi cuenta / Ver tienda, con drawer hamburguesa en mobile (antes era
    scroll horizontal). "Datos del local" (`/admin/ajustes`, componente
    `admin-settings`, un form con todo junto) → **hub `/admin/config`** con
    sub-páginas (`admin-config/`, componente único `AdminConfigSectionComponent`
    por `data.section`): identidad y contacto, redes, sobre nosotros, + link al
    carrusel. Cada una con **`<app-site-preview>`** (`shared/components/site-preview/`):
    maqueta en vivo de header + footer + mensaje de WhatsApp que se actualiza al
    tipear, con la sección relevante destacada. `/admin/ajustes` → redirect a
    `/admin/config`. Sin cambios en el backend. Se sacó "Nuevo producto" del menú.
35. **Logo y mensaje de WhatsApp configurables** (2026-09-08, sección 9sexies):
    `site_settings` sumó `logo_url` (data URI, `MEDIUMTEXT`), `whatsapp_intro` y
    `whatsapp_closing` (texto libre con tokens `{tienda}`/`{codigo}`). En
    `/admin/config/identidad` se sube el logo (se redimensiona a 512px, conserva
    PNG transparente) → lo usan header, footer, home, login, layout del admin,
    el `<app-site-preview>` y el **favicon** (todos via `SettingsService.logoSrc`
    / `applyFavicon`, con fallback a `logo.jpeg`). Nueva sub-página
    `/admin/config/whatsapp` para el saludo y el cierre del mensaje de pedido
    (el detalle y los totales siguen fijos; `applyWhatsappTokens` en
    `whatsapp.service.ts`). Backend: `SiteSettings` + DTOs + `schema.sql`/`setup.sql`.
36. **Entrega (retiro/envío) + medio de pago en el checkout** (2026-09-08): en
    `/carrito`, antes de comprar, el cliente elige **retiro en el local** o
    **envío a domicilio** y **cómo paga**.
    - **Dirección:** `GeocodingService` (fetch a **Nominatim/OSM**, sesgado a la
      bbox de Tucumán, filtra `address.state === 'Tucumán'`; se probó georef-ar
      primero pero no tiene coordenadas de las calles de la capital) +
      `<app-address-picker>` (dep nueva **leaflet**; CSS importado en `styles.css`,
      no en `angular.json`,
      para que el dev-server lo tome sin reiniciar) con mapa y pin arrastrable.
      El envío **no se cotiza** en la web ("a coordinar por WhatsApp").
    - **Pago:** el cliente elige entre los medios cargados en `/admin/config/pagos`
      (`SettingsService.availablePaymentMethods`). Nueva sección `pagos` en
      `AdminConfigSectionComponent` (alias, 2 uploads de QR, link de tarjeta,
      tilde de efectivo). `storeAddress` se agregó a la sección `identity`.
    - **`Order`** sumó `deliveryMethod`, `shippingAddress/Reference/Lat/Lng`,
      `paymentMethod` (enums nuevos back+front). `WhatsappService` agrega al
      mensaje la entrega (con link de Google Maps al pin) y el pago (con el alias
      si aplica). `/admin/pedidos/:id` muestra dos tarjetas (Entrega / Pago).
    - Backend: `Order` + `SiteSettings` + DTOs + `OrderService.create` valida que
      envío traiga dirección. `schema.sql`/`setup.sql` actualizados; **sin
      migración** (`ddl-auto=update`).
37. **Bugs** (2026-09-08): "Ver catálogo" de la home rebotaba (el `href="#..."`
    peleaba con el scroll del router) → botón con `scrollIntoView`. El
    `<app-site-preview>` mostraba todas las secciones atenuadas → ahora **oculta**
    las que no son de la sección editada (la de "Mensaje de WhatsApp" muestra sólo
    el mensaje).
38b. **Toggle por medio de pago** (2026-09-08): cada medio de `/admin/config/pagos`
    (transferencia, QR transf., QR/link tarjeta) tiene ahora su propio
    `payment*Enabled` en `SiteSettings`, aparte del dato — así se puede apagar
    "tarjeta" sin borrar el QR. `availablePaymentMethods` = habilitado **y** con
    dato. (Efectivo ya era un booleano.)
38. **Descuentos: nuevos tipos + acumulable + detalle** (2026-09-08): al motor
    de descuentos se le sumaron los tipos **PAGO** (por medio de pago elegido en
    el carrito) y **ENVIO_GRATIS** (informativo — muestra "envío gratis" + detalle
    cuando el subtotal supera un monto y el cliente eligió envío). Cada descuento
    tiene ahora `stackable` (acumulable) y `detail` (letra chica). **Se eliminó el
    `combineMode` global** (`DiscountConfig`, endpoints `/discounts/config`): la
    regla es "si hay al menos uno no acumulable → gana el que más ahorra; si todos
    son acumulables → se combinan en cascada". `DiscountService.computeCartDiscount`
    reescrito (port del backend), recibe `{ paymentMethod, deliveryMethod }`. El
    carrito muestra el detalle bajo cada descuento y el cartel de envío gratis;
    `Order` sumó `freeShippingNote` y `discountNote`, que van al mensaje de
    WhatsApp y al detalle del pedido en el admin. `/admin/promociones` rehecho
    con 4 tablas + toggle acumulable + input de detalle por fila.
39. **Geocoder → Nominatim/OSM** (2026-09-08): el autocompletado de direcciones
    del checkout pasó de **georef-ar** a **Nominatim** porque georef tiene los
    nombres de las calles de San Miguel de Tucumán pero no las coordenadas ni las
    alturas ("San Juan 354" → 0 resultados). Nominatim las ubica exactas.
    `GeocodingService` sesga por bbox de Tucumán y filtra `address.state`; el
    debounce del address-picker subió a 600ms (límite ~1 req/s de Nominatim).
    Hace **dos búsquedas** (con altura → dirección exacta; sólo calle → la misma
    calle en Yerba Buena, Tafí Viejo, Concepción…). Al **arrastrar el pin** en el
    mapa, `reverse()` re-resuelve la dirección y actualiza el texto de arriba.
    Si el mapa no encuentra la dirección hay un botón "Cargarla igual" (pin en el
    centro de San Miguel, se ajusta a mano). Cuando la dirección es **aproximada**
    (no se ubicó la puerta), el campo **"entre qué calles está" pasa a ser
    obligatorio** en el carrito (`referenceRequired` bloquea el botón de comprar).
    Sólo frontend, sin cambios de modelo.
40. **Carrito: caja "Promos disponibles"** (2026-09-08): además del descuento ya
    aplicado, el carrito muestra las promos que el cliente todavía podría
    aprovechar (`promoHints`): próximo escalón por monto ("comprá $X más y llegás
    a Y%"), descuentos por medio de pago que no eligió ("pagando con transferencia
    10% off") y envío gratis ("comprá $X más" / "tu compra ya tiene envío gratis —
    elegí envío"). `DiscountService` sumó `activePaymentDiscounts` y
    `bestFreeShippingFor`. El agregar-descuento del panel ganó el tilde
    "acumulable" (antes sólo se toggleaba después de crear).
41. **Tanda de mejoras 2026-09-09** (sesión larga; front + back, todo commiteado
    sin pushear). Detalle en la memoria `mejoras-roadmap.md`:
    - **Rate limiting del login** (`LoginAttemptService`, 429 + `Retry-After`,
      cuenta regresiva en el form; config `app.login-throttle.*`).
    - **Quick wins:** "últimas X unidades" en tarjeta/ficha · validar stock en el
      carrito (+ `@Max(999)`; NO se valida al crear el pedido, sí al confirmar) ·
      duplicar producto (`POST /api/admin/products/{id}/duplicate`) · filtros
      server-side en `/admin/productos` (`ProductRepository.search`) · soft-delete
      de productos (`Product.deleted`, "Archivar" + sección "Productos archivados")
      · "Abrir WhatsApp / Copiar resumen" desde `/admin/pedidos/:id`.
    - **UX cliente:** filtro por precio en el catálogo · recordar el nombre en el
      checkout · zoom (lightbox) en la ficha · `/como-comprar` + FAQ (editable en
      `/admin/config/ayuda`; `help_text`/`faq_text` en `site_settings`) ·
      `/mis-pedidos` (consulta por código + nombre, `GET /api/orders/lookup`,
      `localStorage` `pp_my_orders`). Links en el footer.
    - **Cupones** (`/admin/cupones`): entidad `Coupon`, códigos que el cliente
      escribe en el carrito/POS (% o monto, mínimo, tope de usos, vencimiento,
      "combinable con promos"). `GET /api/coupons/{code}` valida sin consumir;
      se consume al crear el pedido. `Order` sumó `couponCode`/`couponDiscount`.
    - **Roles y permisos (RBAC por objetos):** `Permission` (14) + `Role`
      (personalizable; "Administrador" system = todos) + `AdminUser.role`.
      `@PreAuthorize` por endpoint, `permissionGuard` por ruta, menú filtrado,
      `GET /api/auth/me`. `/admin/usuarios` (ABM de usuarios y roles). Seed:
      rol "Vendedor". Login admin sigue siendo `admin`/`ruth123` (rol
      Administrador).
    - **Venta en el local (POS):** `/admin/ventas/nueva` (permiso `POS_USE`) —
      buscador de productos, líneas, pago, cupón, descuentos; `POST
      /api/admin/orders/pos` crea + confirma en el acto. `Order.channel`
      (WEB/LOCAL); suma a métricas.
    - **Recibo imprimible:** `/admin/recibo/:id` (logo, fecha, detalle, totales,
      pago) con `window.print()` + CSS `@media print`. Link desde el detalle del
      pedido y tras registrar una venta en el local.
42. **Ajustes post-tanda (2026-09-09):**
    - Fix: `authInterceptor` no mandaba el Bearer a `/api/auth/me` → menú del
      panel vacío y login que rebotaba. Ahora sí.
    - Fix: `site_settings.help_text/faq_text` como MEDIUMTEXT (VARCHAR grande no
      entraba en el row-size de MySQL).
    - `AuthService.has()` fail-open si `/api/auth/me` no responde (backend viejo/
      caído) — el backend igual valida con `@PreAuthorize`.
    - **POS:** grilla de productos (foto + precio + talles) además del buscador.
    - **Métricas por canal:** bloque "Ventas online" vs "Ventas en el local"
      (`MetricsResponse.byChannel`, calculado desde `Order.channel`).
    - **Paginación client-side** del catálogo y de las grillas del POS/cambios
      (de a 12, botón "Ver más").
    - **Cambios de prenda** (`/admin/cambios`, permiso `EXCHANGES_USE`): entidad
      `Exchange` + `ExchangeLine` (DEVUELTA/LLEVADA). Lo devuelto vuelve al
      stock, lo que se lleva se descuenta (estricto), `difference` = takenTotal −
      returnedTotal a precio de lista; si es positiva se cobra (con medio de
      pago). Código `CAM-0001`. Pantalla con toggle "devuelve / se lleva" +
      listado + recibo imprimible (`/admin/recibo-cambio/:id`).
43. **Tanda 3 (2026-09-09):**
    - **Modal de confirmación propio** (`ConfirmService` + `<app-confirm-dialog>`
      en el root): reemplaza los 13 `window.confirm` y el `window.prompt` del panel.
    - **Caja** (`/admin/caja`, permiso `CASH_REGISTER_VIEW`): cierre del día por
      medio de pago, abierto por origen (local / cambios / online). `GET
      /api/admin/cash-register?date=`. Botón Imprimir.
    - **Permisos nuevos:** `EXCHANGES_USE`, `CASH_REGISTER_VIEW` (antes iban bajo
      `POS_USE`). Rol seed "Vendedor" los incluye.
    - **Métricas:** desglose **por talle** y **por proveedor**; la diferencia
      cobrada en los cambios suma a la facturación (canal local). Export **CSV**
      (botón en Métricas, Productos, Pedidos, Cambios — backend `/api/admin/
      export/*.csv`, salvo Métricas que se arma en el front).
    - **"Lo más vendido"** en la home: `GET /api/products/best-sellers` (público,
      top por unidades de los últimos 90 días); fila horizontal arriba de la grilla.
    - **Paginación** client-side del catálogo y las grillas del POS/cambios.
44. **Fotos a Cloudinary + video de YouTube por producto (2026-09-10):**
    - **Subida a Cloudinary:** todas las subidas de imágenes del panel dejaron de
      guardar data-URI. Redimensionan en el navegador (`resizeImageFile`) y suben
      a Cloudinary con un **unsigned upload preset**, guardando la URL del CDN.
      Cada lugar tiene su carpeta (via param `folder` en la subida):
      - Form de producto (`/admin/productos/:id/editar`) → `estilos-pequenos/productos`,
        nombre `<slug-del-nombre>-<n>` (n = posición al subir; reordenar no renombra).
        Sin recorte (la ficha las muestra 4:5 con `object-cover`).
      - Carrusel (`/admin/carrusel`) → `estilos-pequenos/carrusel`, `carrusel-<n>`.
        Se **recortan al subir** a 21:9 centrado (`resizeImageFile(..., aspectRatio)`),
        y la franja de la home pasó a `aspect-[16/10] sm:aspect-[21/9] max-h-[440px]`.
      - Config del sitio (`/admin/config/identidad` y `/config/pagos`) → logo en
        `estilos-pequenos/logo` (`logo`), QRs en `estilos-pequenos/pagos`
        (`qr-transferencia` / `qr-tarjeta`).
      Config pública en `site-config.ts` → `SITE_CONFIG.cloudinary`
      (`cloudName` + `uploadPreset`); si está vacía, esos botones quedan
      deshabilitados (en el form de producto se puede seguir agregando fotos por
      URL). Cuenta actual: cloud `jitutkbc`, preset `estilospequenos` (unsigned,
      carpeta `estilos-pequenos/productos`). Nuevos:
      `core/services/cloudinary.service.ts` (`upload(file, {folder, publicId})`),
      `core/utils/slugify.ts`. Como la subida es unsigned no se puede sobrescribir
      ni pasar transformaciones: si el `publicId` ya existe, Cloudinary le agrega
      un sufijo random; el recorte del carrusel se hace client-side antes de subir.
    - **Validación de archivo:** `image-resize.ts` sumó `validateImageFile()`
      (solo JPG/PNG/WebP, máx. 15 MB, imagen decodificable) — se llama en los 3
      lugares antes de procesar, y `resizeImageFile` también valida. Los `accept`
      de los inputs pasaron a `image/jpeg,image/png,image/webp`.
    - **Entrega optimizada:** `shared/pipes/cld-image.pipe.ts` (`| cldImg: <ancho>`)
      inserta `f_auto,q_auto[,w_<n>,c_limit]` en la URL de Cloudinary al mostrarla
      — sirve WebP/AVIF al ancho justo (tarjetas 400, ficha 900, hero 1920, logos
      64-300, miniaturas 96-300). Las URLs que no son de Cloudinary (data URI,
      `logo.jpeg`, URL pegada a mano) pasan sin tocar. Aplicado en product-card,
      ficha, carrito, hero, header/footer/site-preview y las pantallas del panel
      que muestran fotos. Baja el tráfico ~5-10× → clave para no pasar los 25
      créditos/mes del plan free.
    - **Migración de los data-URI existentes:**
      `frontend/scripts/migrate-images-to-cloudinary.mjs` (Node, sin tocar el
      backend: se loguea por la API REST, sube cada data-URI a Cloudinary y hace
      el `PUT` correspondiente). Cubre productos, carrusel y settings
      (logo + QRs). Idempotente, tiene `--dry-run`.
    - **Video:** el producto sumó `videoUrl` (opcional). Se carga como link de
      YouTube en el form; la ficha (`product-detail`) lo muestra embebido
      (`youtube-nocookie.com/embed/...`, debajo de las fotos). El video **no** va
      a Cloudinary (el plan free quema créditos con video). Nuevo:
      `core/utils/youtube.ts`. Backend: `Product.videoUrl` (`VARCHAR(500)`),
      `ProductRequest`/`ProductResponse`, `schema.sql`/`setup.sql`; sin migración
      (`ddl-auto=update`).
45. **Campañas de marketing por email (2026-09-11):** captura de email del
    cliente (opcional, no bloquea la venta) en el checkout web y en el POS
    (`Order.customerEmail`). Nueva pantalla `/admin/campanias` (permiso
    `MARKETING_MANAGE`) para configurar y correr campañas automáticas de cupón
    de descuento:
    - **Segmentos:** "inactivos" (sin comprar hace más de N días, configurable)
      y "VIP" (gasto acumulado en pedidos procesados por encima de un monto,
      configurable) — calculados agregando `orders` por `customerEmail`
      (`OrderRepository.findInactiveCustomers`/`findHighSpendCustomers`), sin
      entidad `Customer` separada.
    - **Tope diario configurable** (default 250) para no saturar el mail
      gratuito, más un **cooldown** (default 30 días) para no repetirle
      campaña al mismo cliente todos los días. Vista previa ("¿quién
      calificaría hoy?") antes de mandar nada, botón "mandar ahora", e
      historial con export CSV (`MarketingSend`, `/api/admin/export/
      marketing.csv`).
    - El cupón que se manda es un `Coupon` normal (de un solo uso, generado
      por `CouponService`), nada nuevo ahí.
    - **Mail:** `spring-boot-starter-mail` contra **Brevo** (SMTP), config en
      `spring.mail.*` (`application.yml`) — placeholders por env var, igual
      que el WhatsApp. Job diario (`@Scheduled`, 06:00) + botón manual, ambos
      llaman a `MarketingCampaignService.runNow()`. `MarketingConfig.enabled`
      arranca en `false` (no-op seguro) hasta cargar credenciales reales.
    - **Actualizado (ver #46):** la cuenta de Brevo ya se creó y las
      credenciales se migraron a `PlatformMailSettings` (editable desde
      `/admin/config/servicios`, sólo superadmin). El rol "Administrador" ya
      incluye `MARKETING_MANAGE` de fábrica. Falta activar el toggle "Campaña
      activa" en `/admin/campanias` cuando se quiera empezar a mandar de verdad.
46. **Rol Superadmin + login por DNI + config de plataforma separada
    (2026-09-11):** pensado para reutilizar este código en otros ecommerce.
    - **Usuarios:** `AdminUser` pasa de `username` a `nombre`/`apellido`/
      `dni`/`email` — **el login ahora es por DNI**, no por username. Cuenta
      de Ruth (admin normal): DNI `11111111` / `ruth123` (la contraseña no
      cambió). Cuenta nueva de Augusto (superadmin): DNI `33756194` /
      `augusto123`.
    - **Roles:** el rol de sistema (`system=true`, todos los permisos
      siempre) pasa a llamarse **"Superadmin"** (antes era "Administrador").
      "Administrador" ahora es un rol normal (editable, como "Vendedor") con
      todos los permisos **excepto** `PLATFORM_SETTINGS_MANAGE` y
      `CAROUSEL_MANAGE`. Guardia en `AdminUserService`: sólo un superadmin
      puede asignarle el rol Superadmin a alguien (por API directa también,
      no sólo en el combo del frontend).
    - **Permisos nuevos:** `PLATFORM_SETTINGS_MANAGE` (identidad+logo,
      WhatsApp, redes, sobre nosotros, dirección, ayuda/FAQ, carrusel,
      servicio de mail — todo sólo-superadmin) y `PAYMENTS_MANAGE` (medios de
      pago, se lo queda el admin normal). Reemplazan a `SETTINGS_MANAGE`, que
      se sacó.
    - **`/api/admin/settings`** se partió en `PUT .../settings/platform` y
      `PUT .../settings/payments` (antes un solo PUT con todos los campos).
    - **Servicio de mail configurable:** nueva entidad `PlatformMailSettings`
      (fila única, como `SiteSettings`), editable desde
      `/admin/config/servicios` (sólo superadmin). `MarketingMailService` ya
      no usa el `JavaMailSender` autoconfigurado por Spring — arma uno al
      vuelo con lo que esté guardado en la base. Las variables de entorno
      `BREVO_SMTP_*`/`MARKETING_FROM_EMAIL` sólo sirven como semilla inicial.
    - **"Quién está logueado":** al principio se mostraba nombre + rol abajo
      en el sidebar del admin — pasó muy desapercibido, se rehizo como cartel
      global (ver #47).
    - **Pendiente:** se necesitó resetear la base local (`admin_user` cambió
      de forma — columna `username` fuera, `dni`/`nombre`/`apellido`/`email`
      nuevas y NOT NULL). `database/schema.sql`/`seed.sql` actualizados;
      `database/setup.sql` sigue con drift previo sin resolver (preexistente).
    - **Reportado en esta tanda, resuelto en #47:** la dirección del local no
      se veía en el footer de la tienda.
47. **Cartel de sesión global + contenido del mail editable + recuperar
    contraseña por mail + dirección en el footer (2026-09-11, misma sesión
    que #46, pasadas siguientes):**
    - **Cartel "conectado como"**: se sacó de abajo del sidebar del admin
      (pasaba desapercibido) y se movió a un componente nuevo,
      `shared/components/session-banner`, montado en `AppComponent` — se ve
      como una franja arriba de **toda** la página (panel y tienda pública),
      con link a "Ir al panel" y "Salir". Se ve incluso navegando la tienda
      logueado.
    - **Contenido del mail de campaña editable** (`/admin/campanias`): nueva
      sección "Contenido del mail" — asunto, mensaje e imagen opcional (mismo
      mecanismo de subida que el logo/QR de `/admin/config`, `resizeImageFile`),
      con los tokens `{tienda}`/`{codigo}`/`{porcentaje}`/`{vencimiento}`.
      `MarketingConfig` (modelo/servicio) sumó `emailSubject`/`emailBody`/
      `emailImageUrl`. El mail pasó a HTML con la imagen embebida.
    - **Vista previa de campaña**: nuevo cartel "Quedan para después" — aclara
      que a los que no entran por el tope diario no se los pierde (vuelven a
      aparecer al otro día si siguen calificando; ver detalle en el backend
      PROYECTO.md #23). No fue necesario ningún cambio de backend para esto,
      ya funcionaba así — sólo se hizo visible en el frontend.
    - **Recuperar contraseña por mail**: se sacó la "frase de recuperación".
      `/admin/recuperar` ahora sólo pide el DNI; si existe, llega un mail con
      una contraseña nueva para entrar y cambiarla después desde "Mi cuenta"
      (que también perdió su sección de frase de recuperación).
      `AuthService.recover()`/`changeRecoveryPhrase()` → `forgotPassword()`.
    - **Dirección en el footer**: `FooterComponent` muestra
      `settings().storeAddress` (si está cargada) debajo del texto "sobre
      nosotros", en todas las páginas de la tienda.
    - Probado en vivo: pedido de prueba con cupón de campaña (mail con imagen
      y contenido personalizado) y mail de recuperación de contraseña, ambos
      contra Brevo real — después limpiados/revertidos en la base.
48. **QR por producto + quién vendió/cobró + turnos con cierre de caja
    (2026-09-11, misma sesión que #46-47, tanda siguiente).**
    - **Escanear QR en el POS**: nuevo componente `admin-pos-scanner` (modal,
      `@zxing/browser` `BrowserQRCodeReader.decodeFromConstraints` con
      `facingMode: 'environment'`) — botón "📷 Escanear" en
      `/admin/ventas/nueva` junto al buscador. Decodifica la URL del QR, saca
      el `id` del final, lo busca en `productService.availableProducts()` y
      si lo encuentra hace `search.set(producto.nombre)` (reusa la grilla de
      talles ya existente, no hay selector nuevo); si no, error corto y sigue
      escaneando. Limpia el `MediaStream`/reader al cerrar el modal.
    - **QR imprimible por producto**: nueva ruta `/admin/qr-producto/:id`
      (permiso `PRODUCTS_VIEW`), componente `admin-product-qr` — mismo patrón
      de impresión que `admin-receipt` (`window.print()` + `.no-print` +
      `@media print`). El QR (librería `qrcode`, `QRCode.toDataURL`) codifica
      `{origin}/producto/{id}` (la ficha pública ya existía). Botón "🏷️ QR"
      nuevo en la fila de `/admin/productos`.
    - **POS en dos pasos (armar/cobrar)**: checkbox nuevo "Dejar pendiente de
      cobro (lo cobra otra persona)" en `/admin/ventas/nueva`, destildado por
      defecto. Destildado (caso normal, un solo empleado): `createPos(...)` +
      `confirm(...)` en el mismo click, como siempre. Tildado: sólo arma el
      pedido (`PENDIENTE`) y limpia el form — el pedido aparece en
      `/admin/pedidos` y el botón "Confirmar" de siempre pasa a ser el paso
      de "cobrar" (mismo endpoint, ahora registra quién cobra).
    - **Quién armó/cobró**: `Order` sumó `createdByName?`/`confirmedByName?`
      (sólo el nombre, no el DNI). Se muestran en `admin-order-detail`
      ("Armó: X" / "Cobró: Y") y en el recibo `admin-receipt` ("Vendió: X" /
      "Cobró: Y") — sólo si vienen, y sólo "Cobró" si es distinto de "Armó"
      (si es la misma persona no se repite el dato).
    - **Turnos** (`/admin/turnos`, permiso nuevo `SHIFTS_MANAGE`, ítem nuevo
      en el menú "Ventas" después de "Caja"): `shift.model.ts` +
      `shift.service.ts` (current/open/close/list, mismo estilo que
      `cash-register.service.ts`, historial paginado con `CollectionStore`).
      Componente `admin-shifts`: si no hay turno abierto, botón "Abrir turno";
      si hay uno, "Cerrar turno" + la caja de **ese turno en vivo**
      (`cashRegisterService.forShift(id)`); historial de turnos con "Ver caja"
      (modal con la misma tabla + imprimir). La tabla de caja se factorizó a
      un componente nuevo reusable `cash-register-table` (antes vivía inline
      en `admin-cash-register`, ahora la comparten los dos).
    - Se restartearon `ng serve` y el backend a mitad de esta tanda: habían
      quedado corriendo con el código de *antes* de estos cambios (nuevas
      rutas/endpoints devolvían 404 / caían al wildcard `**`→`/`) — si el
      panel "pierde" una ruta o feature nueva después de un rato largo
      corriendo, sospechar de esto antes que del código.
    - Probado en vivo: turno abierto → venta dejada pendiente → confirmada
      desde `/admin/pedidos` → la caja del turno reflejó el total → turno
      cerrado (con "Ver caja" desde el historial) → QR de un producto
      impreso. Todo limpiado/revertido de la base real después.
49. **Superadmin + Cloudinary editable (2026-09-11):** primer paso de una charla
    más larga con el cliente sobre convertir el sitio en plantilla reusable
    (config editable en vez de tocar código) y separar un nivel de acceso
    "superadmin" (solo Augusto) del admin de la tienda (Ruth). Quedan
    pendientes en la misma charla: usuarios con nombre/apellido/DNI + login por
    DNI + recuperación por mail; vendedor vs. cobrador en la venta + turnos
    (apertura automática al loguearse, cierre manual, métricas por turno,
    varios turnos/día); historial de costo por producto + foto del costo al
    momento de la venta (para que subir el costo no recalcule el margen de
    ventas viejas); QR por prenda/talle para cargar al POS escaneando (a futuro).
    - **`AdminUser.superAdmin`** (boolean, default false): eje aparte de
      `Permission`/`Role` — **no se puede otorgar desde `/admin/usuarios`**
      (esa ABM no lo expone ni en `UserResponse` ni en los DTOs de alta/edición),
      sólo sembrando la cuenta por env vars (`SUPERADMIN_USER`/`SUPERADMIN_PASSWORD`,
      `AuthService.ensureSuperAdmin()`, se llama desde `DataSeeder` — no hace nada
      si faltan las env vars). `JwtAuthFilter` agrega la authority `SUPERADMIN`
      cuando corresponde; `/api/auth/me` la expone (`MeResponse.superAdmin`).
    - **Cloudinary pasó de hardcodeado (`site-config.ts`) a editable**:
      `site_settings` sumó `cloudinaryCloudName`/`cloudinaryUploadPreset`
      (default `jitutkbc`/`estilospequenos`, los que ya estaban hardcodeados).
      Lectura pública vía `GET /api/settings` (cualquier sesión de admin los
      necesita para poder subir fotos); edición aparte y protegida:
      `GET`/`PUT /api/admin/settings/cloudinary` con
      `@PreAuthorize("hasAuthority('SUPERADMIN')")` — el `PUT /api/admin/settings`
      general (`SETTINGS_MANAGE`, lo tiene Ruth) nunca toca esos dos campos.
      Frontend: `SettingsService.cloudinaryConfigured` + `updateCloudinaryConfig()`;
      `CloudinaryService` ya no importa `SITE_CONFIG.cloudinary` (que se borró de
      `site-config.ts`, ahora sólo tiene `apiBaseUrl`), lee del `SettingsService`.
    - **Pantalla nueva** `/admin/superadmin/cloudinary`
      (`AdminSuperadminCloudinaryComponent`), gateada por el guard nuevo
      `superAdminGuard` (`core/guards/admin.guard.ts`) — redirige a `/admin` si
      `auth.isSuperAdmin()` es false. Grupo de menú nuevo "🔒 Superadmin" en
      `admin-layout.component.ts` (`NavItem.superAdminOnly`): sólo aparece si
      `AuthService.isSuperAdmin()`, así Ruth ni sabe que existe.
    - **Pendiente para vos:** setear `SUPERADMIN_USER`/`SUPERADMIN_PASSWORD` (env
      vars, o en `application-local.yml` en local — hay un ejemplo comentado en
      `application-local.yml.example`) con tu usuario y una contraseña fuerte;
      sin eso no se siembra ninguna cuenta superadmin y `/admin/superadmin/**`
      queda inaccesible para todos. Nota aparte: este archivo decía `../backend/`
      y una corrección posterior lo pasó a `../backend-ecommer-ruth/`; hoy la
      carpeta en esta máquina se llama, de nuevo, `../backend/` (ver #63).
50. **Nombre/apellido/DNI en AdminUser, primer paso de login por DNI
    (2026-09-11):** arranque del ítem 2 de la cola (usuarios con nombre/apellido/
    DNI, login por DNI, recuperación por mail). Hecho en esta tanda:
    - `AdminUser` sumó `firstName`, `lastName`, `email` (los 3 opcionales, para
      no romper cuentas viejas). La columna `username` **sigue llamándose así**
      pero ahora es el DNI para cuentas nuevas — no se renombró para no arriesgar
      el login/JWT (`sub`) ni las cuentas existentes con username libre (ej. "admin").
      `/admin/usuarios` (alta y edición) pide Nombre/Apellido además de DNI y
      contraseña; el login relabeleado "Usuario / DNI" (ambos conviven mientras
      no se migren las cuentas viejas). `/api/auth/me` devuelve `firstName`/
      `lastName` (para un futuro saludo en el panel).
    - **Recuperación por mail:** el campo `email` está guardado pero **todavía
      no se conecta** — la recuperación sigue siendo por frase secreta
      (`recoveryHash`). Falta decidir proveedor SMTP (SendGrid, Mailgun, Gmail
      con app password, etc.) antes de armar el envío — es una cuenta externa
      nueva, no lo resolví solo.
    - **Se creó tu cuenta superadmin** (Augusto Basaury): DNI `33756194` como
      username, `firstName`/`lastName` seteados, contraseña **bcrypt** (nunca
      texto plano) vía `app.superadmin.*` en `application-local.yml` (gitignored,
      no llegó al repo) + `AuthService.ensureSuperAdmin()`. Verificado con
      `POST /api/auth/login` + `GET /api/auth/me` (`superAdmin: true`) y se
      backfillearon `cloudinaryCloudName`/`cloudinaryUploadPreset` (`jitutkbc`/
      `estilospequenos`) en la fila de `site_settings` que ya existía en esta
      base local (los defaults nuevos del código sólo aplican a una fila creada
      de cero). Para otra máquina/el deploy real hace falta repetir el seed con
      `SUPERADMIN_USER=33756194` `SUPERADMIN_PASSWORD=<la tuya>`
      `SUPERADMIN_FIRST_NAME=Augusto` `SUPERADMIN_LAST_NAME=Basaury`.
    - **Quién está logueado, en todas las páginas del panel**: barra nueva en
      `admin-layout` (desktop: franja sticky arriba del contenido; mobile:
      badge a la derecha del logo en la barra superior) con nombre + rol
      (ej. "Juana · Vendedor"). `displayName` cae al username/DNI si la cuenta
      no tiene nombre/apellido cargado (cuentas viejas).
    - **Scaffolding de SMTP (Brevo elegido)**: `site_settings` sumó
      `smtpHost`/`smtpPort`/`smtpUsername`/`smtpPassword`/`smtpFromEmail`/
      `smtpFromName`. A diferencia de Cloudinary, `smtpPassword` es secreto de
      verdad — `GET /api/admin/settings/mail` (`SUPERADMIN`) nunca la devuelve,
      sólo `passwordSet: boolean`; `PUT` con password vacío no la pisa (mismo
      patrón que cambiar la contraseña de un `AdminUser`). Pantalla
      `/admin/superadmin/mail`. **Falta conectar el envío real** (no hay
      `MailService`/`JavaMailSender` todavía ni se usa en `/api/auth/recover`)
      — pendiente hasta tener credenciales reales de Brevo cargadas para poder
      probarlo.
    - **Actualizado al mergear con la otra rama (ver #51):** este ítem se hizo
      en paralelo con el #46 (que migró `AdminUser` de `username` a
      `nombre`/`apellido`/`dni`/`email`, sin `firstName`/`lastName`). El merge
      se quedó con los campos de #46 y con el flag `superAdmin` de este ítem
      (los dos ejes conviven: rol "Superadmin" de #46 + `AdminUser.superAdmin`
      de acá). La recuperación por mail terminó resuelta en #47
      (`AuthService.forgotPassword()`), no con el scaffolding de SMTP de acá.
51. **Merge de las ramas `develop` (local) y `origin/develop` (2026-09-12):**
    ambas ramas habían avanzado en paralelo sobre el mismo período (2026-09-10/11)
    sin verse entre sí — esta entrada documenta cómo se reconciliaron.
    - **`AdminUser`:** se quedó la forma del ítem #46 (`nombre`/`apellido`/`dni`/
      `email`, sin `username` ni `firstName`/`lastName`/`recoveryHash` del #49-50).
      Se sumó el `AdminUser.superAdmin` (boolean) del #49 como eje aparte del rol:
      la cuenta inicial de superadmin (`AuthService.ensureInitialSuperadmin()`,
      sembrada por `app.superadmin.*`) ahora setea **los dos** — rol "Superadmin"
      (todos los permisos) y `superAdmin=true` (gatilla la authority `SUPERADMIN`
      en el JWT, usada por `superAdminGuard` y por los endpoints
      `/api/admin/settings/cloudinary` y `/api/admin/settings/mail`).
    - **Se sacó Lombok** en 4 modelos (`MarketingConfig`, `MarketingSend`,
      `PlatformMailSettings`, `Shift`) que lo seguían usando — el `pom.xml`
      fusionado ya no lo tiene como dependencia (lo sacó la otra rama, #ver
      backend `PROYECTO.md`), así que quedaban rotos.
    - **Pendiente de decidir (no se tocó en este merge):** quedaron **dos
      configuraciones de mail SMTP independientes** — `PlatformMailSettings`
      (la que de verdad usan `AccountMailService`/`MarketingMailService` para
      mandar mail, editable en `/admin/config/servicios`, permiso
      `PLATFORM_SETTINGS_MANAGE`) y los campos `smtp*` de `SiteSettings`
      (editables en `/admin/superadmin/mail`, gateados por `SUPERADMIN`, pero
      **sin conectar a ningún envío real** — es el scaffolding del #50). Es
      redundante: hay dos pantallas de "configurar el mail" y sólo una hace
      algo. Falta decidir si se unifican (lo más simple: apuntar
      `/admin/superadmin/mail` a `PlatformMailSettings` y borrar los campos
      `smtp*`/`MailConfigRequest`/`MailConfigResponse` de `SiteSettings`) o si
      se les da un propósito distinto a cada una.
    - `database/schema.sql`: se agregó la columna `super_admin` a `admin_user`
      (faltaba). Los campos `cloudinary*`/`smtp*` de `site_settings` siguen sin
      reflejarse en `schema.sql` (existían así desde antes del merge, ver nota
      de `ddl-auto=update`).

52. **Puesta al día de este documento + arreglo del esquema de deploy
    (2026-09-20).** No se tocó código del frontend; fue documentación y backend.
    - **Backend (repo `../backend/`, commit `4f4dadc`):** el
      esquema de deploy estaba roto — `mysql < database/setup.sql` cortaba a la
      mitad por un `INSERT` sobre la tabla `discount_config` que ya no existía,
      faltaban las tablas `marketing_config`/`marketing_send` y 11 columnas, y
      `exchange.payment_method` no podía guardar `MERCADOPAGO`. Detalle
      completo en el `PROYECTO.md` del backend, ítem #36.
    - **Este documento estaba 12 días atrás** (última actualización
      2026-09-08) y describía un proyecto que ya no era: decía que no había
      pasarela de pago, que el login era `admin`/`ruth123`, que la recuperación
      era por frase, y listaba como pendientes cosas hechas. Corregidas las
      secciones **2** (pasarela de pago: ahora Mercado Pago Checkout Pro),
      **3** y **5** (login por DNI), **3bis** (la checklist de "sitio nuevo"
      tenía nombres de variables de entorno que ya no existen —
      `ADMIN_USER`/`SUPERADMIN_USER`/`SUPERADMIN_FIRST_NAME`/
      `SUPERADMIN_LAST_NAME` — y mandaba a cargar el SMTP en
      `/admin/superadmin/mail`, que es la config **muerta**; la real es
      `/admin/config/servicios`) y **12** (el resumen del backend). Se agregó
      un aviso en **10** aclarando que esa lista de pendientes es del 2026-09-08.
      Las secciones 6 a 11 quedaron como estaban.
    - **`CLAUDE.md`** también decía que el checkout era 100% client-side por
      WhatsApp; actualizado, y corregida la ruta del backend (en ese momento se
      pasó a `../backend-ecommer-ruth/`; hoy la carpeta local es `../backend/`,
      ver #63).
    - **Probado en el navegador** (Playwright, con back y front levantados): la
      home (hero + carrusel), el catálogo (19 productos, filtros por
      parametría, badges de "última unidad" y "sin stock"), el login por DNI, el
      dashboard (KPIs, banner de sesión, badges del menú), **Métricas** completa
      (totales, online vs local, más/menos vendidos, por tipo/talle/proveedor y
      comparativas), Pedidos y Balance. **Cero errores de consola.**
    - **Observado en esa prueba:** las ventas de la base de desarrollo están
      todas concentradas en septiembre, así que los gráficos de "facturación por
      mes" y las comparativas se ven casi vacíos (julio y agosto en $0). No es
      un bug, es falta de datos — motivo por el que se agregó un seed de demo
      (ver `../backend/database/README.md`).

53. **Bug: las barras de ganancia del gráfico de Balance eran invisibles
    (2026-09-20).** Lo reportó el cliente mirando `/admin/balance`.
    - **Síntoma:** el gráfico "Resultado neto por mes" mostraba las barras de
      pérdida en rojo, pero los meses con ganancia **no mostraban ninguna
      barra** — el cartel de arriba decía "+$208.129" y en el gráfico no había
      nada verde.
    - **Causa raíz:** en `src/styles.css`, el `@theme` definía la escala `mint`
      con **sólo 4 tonos** (`100`, `300`, `500`, `600`), pero el código usaba
      **11**: `mint-50`, `mint-200`, `mint-400`, `mint-700`, `mint-800` y
      `brand-800` **no existían** (`brand` y `accent` sí tienen la escala
      completa, 50–700). Con Tailwind v4, una clase cuyo token de tema no existe
      **no se genera: sin error y sin warning** — el elemento simplemente queda
      sin color (fondo transparente, o texto heredado). Eran **16 usos** en toda
      la app.
    - En el gráfico se veía perfecto el mecanismo: las barras negativas usaban
      `bg-red-400` (color estándar de Tailwind, existe → rojo y visible) y las
      positivas `bg-mint-400` (no existía → **transparente**). Las alturas
      estaban bien calculadas; invisible era sólo el relleno.
    - **Fix:** completar las dos escalas en `@theme`.
      `brand-800: #9a3412` es el valor **exacto** (la escala `brand` es
      literalmente la `orange` de Tailwind: `brand-500`=`#f97316`=`orange-500`,
      etc.). Los 5 tonos de `mint` que faltaban se interpolaron entre los que
      ya estaban: `mint-50 #f0fdf6`, `mint-200 #b3efd3`, `mint-400 #5ed6a3`,
      `mint-700 #17724c`, `mint-800 #125e40`. **Esos 5 son una elección:** si el
      tono no cierra, se ajustan en `styles.css` (están comentados).
    - **Verificado en el navegador:** los 3 meses positivos ahora salen verdes,
      el punto verde de la leyenda aparece, la tarjeta "Resultado neto" queda
      con fondo y texto verdes, y **las 16 clases antes rotas ahora existen** en
      el CSS compilado. Cero errores de consola.
    - **Nit que queda:** un mes con resultado exactamente $0 dibuja una línea
      verde de 2px (por el `min-h-[2px]` + `>= 0`). Antes era invisible. Es
      cosmético; lo correcto sería un color neutro para el cero.
    - **Para no repetirlo:** un token de tema faltante no falla ruidosamente.
      Vale la pena un chequeo tipo "toda clase `*-<color>-<n>` usada en los
      templates existe en `@theme`" — habría cazado esto y los 16 usos.

54. **Entrega/cancelación parcial de pedidos + devolución pura en Cambios +
    banner promocional + WhatsApp flotante + "Coordinar por WhatsApp" +
    ajuste masivo de precio + POSNET (2026-09-23).** Contraparte frontend del
    backend #38 (ver ese documento para el detalle del lado servidor).
    - **`admin-order-detail`, rediseñado:** las checkboxes de "tildar/destildar"
      (todo-o-nada) se reemplazan por selección de líneas **pendientes** con
      botones "Entregar seleccionados"/"Cancelar seleccionados"
      (`confirmLines`/`cancelLines`), badge de estado por línea
      (Pendiente/Entregada/Cancelada), input de cantidad editable y botón "✕"
      por línea pendiente, y un buscador inline para agregar un ítem nuevo al
      pedido (`addLine`) mientras siga pendiente. "Confirmar/Cancelar todo lo
      pendiente" quedan como atajos sobre el resto de líneas sin resolver.
    - **`order.model.ts`:** `OrderLine.status` nuevo (`PENDIENTE`/`ENTREGADA`/
      `CANCELADA`); `PaymentMethod` suma `POSNET`; `PAYMENT_LABELS.CASH` se
      simplifica de "Efectivo al recibir/retirar" a **"Efectivo"**.
    - **`admin-pos`:** medios de pago en la venta local pasan de
      `CASH/TRANSFER/QR_TRANSFER/QR_CARD` a **`POSNET/CASH/TRANSFER`** (pedido
      explícito: sin Mercado Pago ni QRs en el local).
    - **Cambios (`admin-exchange-new`):** "Se lleva" pasa a ser opcional —
      `canSave` ya no exige `taken().length > 0` (devolución pura). El bloque
      de medio de pago se muestra con `difference() !== 0` (antes sólo `> 0`)
      y cambia la etiqueta a "Cómo se le devuelve la plata" cuando la
      diferencia es a favor del cliente. Mismo ajuste en el recibo
      (`admin-exchange-receipt`).
    - **"Coordinar por WhatsApp" post-pago:** `mis-pedidos-page` ahora lee
      `?code=...&pago=aprobado` de la URL de vuelta de Mercado Pago (Ver
      `OrderService.startMercadoPagoCheckout` en el backend), precarga el
      código y muestra un banner "pago aprobado, buscá tu pedido". Cada pedido
      con `paymentStatus === 'APPROVED'` en los resultados tiene un botón
      "💬 Coordinar entrega por WhatsApp" (`WhatsappService.buildPublicCoordinationLink`,
      mensaje simple con el código — no expone datos internos del pedido).
    - **Banner promocional:** `PromoBannerComponent` (popup, `app.component`,
      sólo páginas públicas) — se muestra una vez por pestaña
      (`sessionStorage`) si `promoBannerEnabled` y hay `promoBannerImage`
      cargados; se edita en "Configuración → Sobre nosotros" (mismo patrón que
      la foto del local: subida a Cloudinary + link opcional al tocarlo).
    - **WhatsApp flotante:** `WhatsappFloatComponent`, botón circular fijo
      abajo a la derecha en toda página pública, va al chat general de la
      tienda (sin mensaje precargado).
    - **Ajuste masivo de precio + "Eliminar definitivamente" (`admin-products`):**
      checkboxes por fila + toolbar "Ajuste masivo de precio: [%] Aplicar" (a
      los seleccionados, o a todos si no se tildó ninguno —
      `ProductService.bulkAdjustPrice`). En "Productos archivados", botón
      "Eliminar definitivamente" junto a "Restaurar" (irreversible, confirm
      con `danger: true`).
    - **Cloudinary API Key/Secret:** nuevos campos en
      `/admin/superadmin/cloudinary` (API Secret nunca se muestra una vez
      guardado, mismo patrón que la config de mail) — hacen falta para que
      "Eliminar definitivamente" borre también las fotos en Cloudinary (ver
      backend #38; **todavía no están cargados**).
    - **Verificación:** `ng build` sin errores nuevos (sólo quedaron los 3
      warnings preexistentes de módulos CommonJS: `qrcode`, `jsbarcode`,
      `leaflet`). **No se probó en el navegador** — falta antes de dar la
      tanda por cerrada (mismo pendiente que el backend #38).

55. **Prueba en el navegador de la tanda #54 + Gastos/Balance/Stock
    (2026-09-28).** Hecha con el plugin de Playwright (la extensión de Chrome
    es inestable). Sin cambios de código en el frontend; los arreglos fueron
    en el backend (ver backend §12 #39).
    - **Funciona:** entrega/cancelación parcial en `admin-order-detail`
      (editar cantidad recalcula, tildar → "Entregar seleccionados" → modal →
      línea "Entregada", el resto sigue pendiente; cancelar la última →
      pedido "procesado") · devolución pura en `/admin/cambios/nuevo` ("A
      favor del cliente" + "Cómo se le devuelve la plata" + recibo) · ajuste
      masivo (pide confirmación con la cantidad de productos) · archivar →
      eliminar definitivamente · banner promocional (aparece, se cierra con la
      X, no vuelve en la pestaña) · WhatsApp flotante · `/admin/gastos`
      (listado), `/admin/balance` (las cuentas cierran) y
      `/admin/movimientos-stock` (historial con motivo y quién).
    - **Bugs encontrados (arreglados en el backend):** "Total a cobrar" y la
      Caja seguían sumando las líneas canceladas de un pedido parcial; y la
      Caja no restaba la plata devuelta en una devolución pura. La pantalla
      de Caja ya los muestra bien (la devolución sale en negativo en la
      columna "Cambios").
    - **Sin probar:** "💬 Coordinar entrega por WhatsApp" en `/mis-pedidos`
      (necesita un pedido con `paymentStatus=APPROVED`) · alta de un gasto ·
      registrar compra a proveedor.
    - **Hallazgos sin tocar:** el filtro "Parametría" de `/admin/productos`
      lista también las categorías de Gastos (Alquiler, Sueldos…) · el
      checkbox del encabezado del ajuste masivo tilda sólo la página actual
      (para "por categoría" hay que filtrar y tildar página por página —
      evaluar "aplicar a todos los filtrados") · `/api/settings` tiene
      `Cache-Control: max-age=300`, así que los cambios de configuración
      tardan hasta 5 min en verse · el recibo de una devolución pura muestra
      "SE LLEVA" vacío · `app-confirm-dialog` sin `role="dialog"`.
    - Las sugerencias del roadmap (§10) que siguen sin tomar quedaron
      listadas, chequeadas contra el código, en backend `PROYECTO.md` §11bis.

56. **Diseños de tienda intercambiables: Ruth + Editorial + Pop (2026-09-30).**
    Pedido: que el ecommerce tenga **más de un frontend para elegir** — diseños
    "totalmente diferentes visualmente" (no un cambio de paleta), compatibles
    con la lógica y los datos que ya hay, y con movimiento/transiciones. El
    motivo: en el intento anterior (el SaaS, pausado en la rama
    `backup-sesion-2026-09-22-vieja-base`) todas las plantillas generadas
    salían iguales, porque sólo variaba el hero y la grilla/header/footer eran
    compartidos. La idea es migrar después estas vistas al SaaS.
    - **Arquitectura** (detalle en la sección 7bis): `CatalogPageComponent`
      pasó a ser un **contenedor** — carga productos, carrusel, parametrías,
      talles, filtros, orden y paginado — que se expone como `CatalogView`
      (`features/catalog/catalog-view.ts`) y hace `@switch (layout())` sobre
      tres plantillas dueñas de **todo** el markup
      (`features/catalog/templates/`). Registro de diseños en
      `core/layouts.ts` (`LAYOUTS`, `DEFAULT_LAYOUT`, `ensureLayoutFonts`);
      `AppComponent` escribe `data-layout` en `<html>` (y lo saca en `/admin`).
      Los tokens y helpers por diseño viven en `styles.css` (CSS global, por el
      presupuesto de 4 kB de `anyComponentStyle`), con los selectores duplicados
      atributo+clase para que las miniaturas del panel se vean bien con
      cualquier diseño activo. `ProductCard` sumó variantes
      `classic | editorial | pop`.
    - **Ruth quedó intacta:** su plantilla es el markup anterior portado
      literal, así el diseño que ya usa el cliente no cambió en nada.
    - **Movimiento** sin dependencias nuevas: directive `appReveal`
      (`shared/directives/`, IntersectionObserver, variantes up/mask/bounce,
      delay escalonado, corre con `zone.run()`) + keyframes `fade-up`,
      `marquee`, `wobble`, `pop-in`, `ken-burns`, `float-y` y `sheen`, todo
      apagado con `prefers-reduced-motion`.
    - **Backend:** `SiteSettings.layout` + `AppearanceRequest` (validado con
      `@Pattern` `ruth|editorial|pop`) + `PUT /api/admin/settings/apariencia`
      (`PLATFORM_SETTINGS_MANAGE` **o** `CAROUSEL_MANAGE`, para que lo pueda
      cambiar el dueño) + `layout` en `SettingsResponse`. La columna la creó
      solo `ddl-auto=update`. En el frontend, `SettingsService` sumó `layout()`
      (con fallback al default si el backend devuelve un id desconocido) y
      `updateAppearance()`.
    - **Bug arreglado de raíz — era el hallazgo de #55:** `GET /api/settings`
      respondía `Cache-Control: max-age=300, public`, así que después de guardar
      un diseño la tienda seguía mostrando el viejo hasta 5 minutos. Se comprobó
      comparando un `fetch('/api/settings', {cache:'no-store'})` (daba
      `editorial`) contra el `data-layout="ruth"` del `<html>`. Ahora ese
      endpoint manda **`CacheControl.noStore()`**: el dueño cambia diseño,
      nombre, logo o WhatsApp y se ve al recargar. (`/api/param-groups` y
      `/api/size-scales` siguen con `max-age=300` de antes — se dejaron a
      propósito, cambian mucho menos.)
    - **Panel:** nueva pantalla `/admin/config/diseno` (`AdminDesignComponent`,
      ruta lazy + `permissionGuard` con `PLATFORM_SETTINGS_MANAGE`) con
      miniaturas **vivas**: la home real renderizada a 1440 px y escalada a
      0.32, `pointer-events-none` y `[preview]="true"` (4 productos, sin "más
      vendidos"). Tarjeta nueva primera en el hub de `/admin/config`. Como en
      `/admin` el `data-layout` global está sacado, la pantalla llama a
      `ensureLayoutFonts` con los tres ids para que cada miniatura use su
      tipografía real.
    - **Verificación:** `ng build` de producción sin errores nuevos (initial
      487.92 kB, bajo el warn de 500 kB; sólo los 3 warnings CommonJS de
      siempre: qrcode, jsbarcode, leaflet). En navegador, logueado como
      superadmin: ciclo completo **ruth → editorial → pop → ruth** — cada cambio
      persiste en la base, el anillo "EN USO" se mueve, y la tienda renderiza el
      diseño correcto al recargar, con consola limpia. La tienda quedó en
      **Ruth**.
    - **Pendientes de esta tanda:** sumar "Diseño de la tienda" al menú lateral
      (hoy sólo se entra por el hub) · la ficha de producto, el carrito, el
      header y el footer siguen siendo únicos (sólo la home tiene plantillas) ·
      `database/setup.sql` no incluye la columna `layout` de `site_settings`
      (con `ddl-auto=update` se crea sola, pero para el camino `validate` de la
      sección 3bis hay que agregarla).

57. **Cuatro diseños más: Vidriera, Ofertas, Fichero y Mosaico (2026-10-01).**
    Pedido: más opciones para elegir cómo se ve el front (hasta acá había tres),
    con dos condiciones explícitas — que las vistas nuevas sean **muy diferentes
    entre sí** y que estén **acordes al backend**, porque "de nada sirve un front
    con mil cosas que no tenemos". Antes de escribir una línea se hizo el
    inventario de lo que el backend realmente devuelve y se descartó todo lo que
    no tiene respaldo (el detalle quedó en la sección 7bis).
    - **Las cuatro vistas:** **Vidriera** (un riel horizontal por cada opción real
      del grupo "Público" + el catálogo completo con filtros al final),
      **Ofertas** (sin hero: barra con los descuentos vigentes de
      `/api/discounts`, filtros en columna y grilla densa de 4 con el `-X%` real
      en las prendas alcanzadas), **Fichero** (una prenda destacada en grande con
      su descripción y sus talles con stock, y el catálogo en **filas** en vez de
      grilla) y **Mosaico** (tablero tipo bento con carrusel, foto del local,
      "sobre nosotros", categorías que filtran al tocarlas y la grilla abajo).
    - **Datos: cero invención.** `CatalogView` sumó `settings` (foto del local y
      "sobre nosotros" para el Mosaico), `promos` (descuentos vigentes con el
      texto ya armado en el contenedor, usando los labels de parametrías y
      `PAYMENT_LABELS`) y `discountPercentFor(product)` (el mayor % por
      parametría que le toca a una prenda). El contenedor inyecta `DiscountService`
      para esto: `/api/discounts` es público y es el mismo cálculo que usa el
      carrito, así que la barra de promos no inventa descuentos.
    - **Ojo con los precios:** el único precio que existe es `product.price` (no
      hay "precio de lista" en el backend), así que la grilla de Ofertas muestra
      el precio real y el chip sólo comunica el % que se aplica en el carrito.
      **Nada de precios tachados ni "precio antes".**
    - **`ProductCard`** sumó las variantes `vidriera`, `oferta` y `mosaico`
      (Fichero no la usa: dibuja sus propias filas porque necesita la
      descripción y los talles, que la tarjeta no muestra).
    - **Backend:** una línea — el `@Pattern` de `AppearanceRequest` pasó a
      `ruth|editorial|pop|vidriera|ofertas|fichero|mosaico`. Sin eso el `PUT` de
      apariencia devolvía 400 con los ids nuevos. No hubo cambio de esquema ni
      de endpoint. Compilado con `./mvnw -o -q compile` (exit 0).
    - **CSS:** los tokens de los cuatro (`[data-layout="x"], .tpl-x`) y sus
      piezas (`.vid-*`, `.oft-*`, `.fic-*`, `.mos-*`) fueron al `styles.css`
      global, como los de Editorial y Pop, por el presupuesto de 4 kB por
      componente. **No se agregó ninguna dependencia nueva** y todas las fuentes
      siguen saliendo de Google Fonts vía `ensureLayoutFonts`.
    - **Verificación:** `ng build` de producción **OK y sin warnings nuevos**
      (initial 500,79 kB / 129,96 kB de transferencia; quedan sólo los 3 warnings
      CommonJS de siempre: qrcode, jsbarcode y leaflet). Las plantillas nuevas
      dejaron 6 warnings NG8107/NG8102 por un `?.`/`??` de más sobre `sizeStocks`
      y sobre `promos()[0]`: se corrigieron antes de cerrar. Por eso el umbral de
      aviso del bundle `initial` subió de 500 kB a **550 kB** en `angular.json`:
      el CSS global —que es donde viven los tokens y las piezas de **todos** los
      diseños— creció ~13 kB con las utilidades que usan las cuatro plantillas
      nuevas. El error sigue en 1 MB.
    - **Coherencia con los otros tres:** "lo más vendido" (Vidriera) y la prenda
      destacada (Fichero, Mosaico) no se muestran sin filtrar cuando hay filtros
      puestos —Ruth/Editorial/Pop ya escondían ese bloque—: con filtros, el
      destacado sale del catálogo filtrado.
    - **Pendientes:** la ficha de producto, el carrito, `/nosotros` y
      `/como-comprar` siguen siendo únicos para los siete diseños (sólo la home
      tiene plantilla; lo que cambia en toda la tienda son las fuentes y la
      paleta) · `/admin/config/diseno` ahora renderiza **7 miniaturas vivas**, o
      sea 7 instancias de la home con sus carruseles: si la pantalla se pone
      pesada, conviene renderizar cada miniatura sólo cuando entra en pantalla ·
      los cuatro diseños nuevos no se probaron todavía en el navegador con datos
      reales (la verificación fue de compilación).

58. **Octavo diseño: Nova — el moderno, con mucho movimiento (2026-10-01).**
    Pedido: "una plantilla más, distinta a las cuatro nuevas, como las que se usan
    en los ecommerce de ahora, con más movimiento y transiciones, que llame la
    atención". Se hizo con las mismas reglas que la tanda anterior: **todo con
    datos que ya existían** y sin agregar ninguna dependencia (ni GSAP, ni AOS,
    ni nada: CSS + directivas propias).
    - **Qué tiene Nova:** hero cinematográfico a pantalla completa (carrusel
      administrable de fondo con Ken Burns lento + gradiente vivo animado +
      oscurecido), banda kinética (marquesina) con las promos o las categorías
      reales, piezas de categoría que se **inclinan con el mouse** (tilt 3D con
      brillo que sigue al puntero), **barra de progreso** de lectura, tarjetas
      `variant="nova"` y catálogo con **scroll infinito de verdad** (un centinela
      llama a `showMore()`, con "Ver más" de respaldo). Cierra con una franja
      oscura con los datos reales del local y el botón de WhatsApp.
    - **Tres directivas nuevas** en `shared/directives/`, todas sin bindings ni
      change detection (escriben variables CSS y listo):
      `tilt.directive.ts` (`appTilt` → `--rx`/`--ry`/`--mx`/`--my`),
      `scroll-progress.directive.ts` (`appScrollProgress` → `--p` de 0 a 1, con
      listener pasivo y `requestAnimationFrame` fuera de Angular) y
      `auto-more.directive.ts` (`appAutoMore`: IntersectionObserver con
      `rootMargin` de 400 px; el centinela sólo existe mientras `hasMore()`, así
      que el ciclo se corta solo). `appReveal` sumó las variantes `blur`, `left`,
      `right` y `zoom` (las anteriores quedaron igual).
    - **Backend:** otra vez una línea — `nova` sumado al `@Pattern` de
      `AppearanceRequest`. Compilado con `./mvnw -o -q compile` (exit 0).
    - **Bug real que apareció y conviene no repetir:** el template traía
      `[class.text-white/75]="..."` y **Angular no compila eso**: el parser HTML
      lee la barra del modificador de Tailwind como cierre de tag y tira
      `NG5002 Opening tag "p" not terminated`. Se resolvió con un `[class]` y el
      modificador adentro del string (`[class]="foto ? 'text-white/75' :
      'text-brand-800/70'"`), que Tailwind igual detecta al escanear el archivo.
      **Regla para el próximo diseño: nunca usar `/` dentro de un `[class.x]`.**
    - **Verificación:** `ng build` de producción **OK y sin warnings nuevos**
      (initial 510,73 kB / 131,28 kB de transferencia; los mismos 3 warnings
      CommonJS de siempre). El CSS global pasó de 89,14 kB a 98,71 kB: es el
      precio de la arquitectura —las utilidades que usan las 8 plantillas viven
      en el `styles.css` compartido— y sigue debajo del umbral de aviso de
      550 kB. El backend compila. **No se probó en el navegador con datos
      reales.**
    - **Pendientes:** los mismos de #57 (la ficha del producto, el carrito,
      `/nosotros` y `/como-comprar` siguen siendo únicos para los 8 diseños) ·
      `/admin/config/diseno` ahora renderiza **8 miniaturas vivas**, o sea 8
      instancias de la home con sus carruseles y su Ken Burns: si la pantalla se
      pone pesada, hay que pasar a renderizarlas sólo cuando entran en pantalla ·
      el hero de Nova usa `86vh`, así que su miniatura en el panel queda dominada
      por el hero (es su identidad, pero se puede acortar si molesta).

59. **Noveno diseño: Neón — el disruptivo, oscuro y con banners animados
    (2026-10-01).** Pedido: "otro diseño, disruptivo, con cosas más animadas, con
    movimientos, con los banners de promoción con movimiento, más llamativo y que
    no tenga absolutamente nada que ver con los diseños que ya están".
    - **Lo que lo hace distinto de verdad: es uno de los dos diseños oscuros**
      (el otro es Cohete, ver #60) de la
      tienda. Y no se logra componente por componente: el `body` usa
      `--color-brand-50` como color de página, así que la rampa `brand-*` de Neón
      está **invertida** (50 = casi negro, 500 = cian) y con eso se da vuelta toda
      la tienda. El header y el footer compartidos sí tenían superficies claras
      escritas a mano (`bg-white/90`, `text-stone-600`), así que sumó **reglas
      acotadas** (`[data-layout="neon"] app-header header {…}` y lo mismo para
      `app-footer`) que ganan por una razón que conviene recordar: `styles.css` es
      *unlayered* y las utilidades de Tailwind v4 viven en `@layer utilities`, y
      lo que está fuera de capa le gana a lo que está en capa **sin importar la
      especificidad**. Junto con Cohete, son los únicos diseños que tocan el
      chrome compartido.
    - **Movimiento (lo que pidió el cliente):** el nombre de la tienda entra
      **letra por letra** (`appReveal variant="bounce"` con delay escalonado),
      **doble marquesina** cruzando en direcciones opuestas (`.anim-marquee` +
      `.anim-marquee-reverse`, la única utilidad de marquesina nueva),
      **banners de promoción animados** —anillo de luz que gira alrededor de cada
      banner (`@property --neon-angle` + `conic-gradient`), reflejo que lo cruza
      (`shimmer-x`), disco con el **% real** que viene de `/api/discounts` y la
      fecha de fin cuando la promo la tiene—, **cinta diagonal** con las promos
      pasando, grilla luminosa que se desplaza sola (`grid-slide`) y **prendas que
      se dan vuelta** (flip 3D en CSS puro: `preserve-3d` + `rotateY`) que del
      otro lado muestran la descripción y los talles con stock.
    - **Dato nuevo en el contrato:** `PromoLine` sumó `endsLabel` ("Hasta el
      15/10"), armado en el contenedor cortando el string `YYYY-MM-DD` a mano y
      **no** con el `DatePipe`: `new Date('2026-10-15')` es medianoche UTC y en
      Argentina cae el 14, así que la promo habría mostrado un día de menos.
    - **Urgencia real, no inventada:** la sección "se están agotando" sale de
      `totalStock(p) > 0 && totalStock(p) <= (p.lowStockThreshold ?? 3)` —el mismo
      criterio que usa la alerta de reposición del panel—.
    - **Accesibilidad:** en táctil (o con `prefers-reduced-motion`) el flip no
      gira y esa misma información se muestra abajo, siempre visible
      (`.flip-extra`); el bloque de accesibilidad apaga además la grilla, el
      anillo y el reflejo.
    - **Backend:** `neon` sumado al `@Pattern` de `AppearanceRequest`. **Hubo que
      reiniciar el backend**: el proceso que estaba corriendo tenía la clase
      compilada sin `neon`, así que el `PUT` de apariencia devolvía 400 hasta
      reiniciarlo.
    - **Verificación:** `ng build` de producción OK y sin warnings nuevos (initial
      518,43 kB / 132,61 kB de transferencia; el CSS global pasó de 98,71 kB a
      106,05 kB). Probado de punta a punta contra el backend real: login →
      `PUT apariencia {layout:"neon"}` → 200, y el `GET /api/settings` lo refleja.
      **No se probó a ojo en el navegador.**
    - **Bug de tooling que vale anotar:** el dev server (`ng serve`) **no ve los
      archivos nuevos** creados mientras está corriendo: se queda con el
      `TS2307 Cannot find module` cacheado y hay que reiniciarlo (el build de
      producción sí los resuelve). Ya había pasado con Nova.
    - **Pendientes:** los mismos de siempre (la ficha de producto, el carrito,
      `/nosotros` y `/como-comprar` siguen siendo únicos para los 9 diseños) ·
      `/admin/config/diseno` renderiza **9 miniaturas vivas** · Neón es el único
      con fondo oscuro: si se publica, conviene mirar que el logo (que es claro,
      sobre fondo blanco) no quede con un halo raro sobre el negro.

60. **Cuatro diseños más, para chicos: Caramelo, Cohete, Jungla y Crayón
    (2026-10-01).** Pedido: "varios diseños más, como el último (con movimientos)
    pero para niños, y que no tengan nada que ver con los que ya están".
    - **Qué es cada uno** (detalle en la sección 7bis): **Caramelo** (pastel:
      rayos que giran, manchas que flotan, ondas que corren y piezas que se
      aplastan como un caramelo al pasar el mouse), **Cohete** (noche espacial,
      el segundo diseño oscuro: estrellas que titilan, órbitas que giran, una
      nave que cruza la pantalla y estrellas fugaces), **Jungla** (arboleda que
      se mece, huellas que marchan solas y piezas que se balancean) y **Crayón**
      (papel, bordes tembleques, cintas adhesivas y **garabatos SVG que se
      dibujan solos**).
    - **Cada uno con SU movimiento:** los keyframes son de la tanda
      (`spin-slow`, `bob`, `jelly`, `wave-x`, `twinkle`, `fly-across`,
      `shooting`, `sway`, `march-x`, `draw-in`, `wobble-slow`) y ninguno repite
      el recurso de otro diseño. Todos se apagan con `prefers-reduced-motion`;
      en Crayón hay un detalle que no se puede olvidar: al apagar la animación
      hay que dejar `stroke-dashoffset: 0`, si no los dibujos quedan invisibles
      (con el guion corrido).
    - **Ahora hay DOS diseños oscuros:** Cohete también invierte la rampa
      `brand-*`, así que el chrome compartido (header y footer) lleva las mismas
      reglas acotadas que Neón. Las afirmaciones de "el único diseño oscuro" de
      #58 y #59 quedaron corregidas en toda la documentación.
    - **`ProductCard`** sumó `caramelo`, `cohete`, `jungla` y `crayon`. Las
      variantes de Caramelo y Jungla usan animaciones arbitrarias de Tailwind
      (`hover:animate-[jelly_.6s_ease]`, `hover:animate-[sway_1.1s_ease-in-out
      _infinite]`): se verificó en el CSS compilado que Tailwind las genera.
    - **Backend:** los 4 ids sumados al `@Pattern` de `AppearanceRequest`.
      **Otra vez hubo que reiniciar el backend** (y el dev server, que no ve los
      archivos nuevos): los dos quedaron levantados.
    - **Tres errores reales que aparecieron en las plantillas nuevas** y que
      conviene no repetir:
      1. `[style.animation-delay]="-1s"` **no compila**: Angular lee el binding
         como expresión y `-1s` no es una expresión válida (`NG5002 Parser Error:
         Unexpected token 's'`). Lo correcto es `[style.animation-delay]="'-1s'"`
         —con las comillas adentro—. La forma de atributo estático
         (`style.animation-delay="-1s"`) compila, pero deja el warning `NG8104`.
      2. `@let destacados = destacados();` **se auto-referencia** y Angular no lo
         permite (`NG8016 Cannot read @let declaration before it has been
         defined`): el `@let` tapa el nombre del computed. Hay que usar otro
         nombre (`@let carril = destacados()`).
      3. Faltaba importar `CldImagePipe` en Cohete, que igual usaba `| cldImg`
         (`NG8004 No pipe found with name 'cldImg'`).
      Los tres se arreglaron y el build quedó limpio.
    - **Verificación:** `ng build` de producción **OK y sin warnings nuevos**
      (initial 536,17 kB / 135,44 kB de transferencia; el CSS global pasó de
      106,05 a 122,55 kB, todavía debajo del umbral de aviso de 550 kB) +
      `tsc --noEmit` sin errores + los 16 keyframes presentes en el CSS
      compilado. Probado de punta a punta: `PUT apariencia` con los 4 ids
      devuelve 200 y el `GET /api/settings` lo refleja. **No se probó a ojo en el
      navegador.**
    - **Pendientes:** los mismos de siempre (la ficha de producto, el carrito,
      `/nosotros` y `/como-comprar` siguen siendo únicos para los 13 diseños) ·
      `/admin/config/diseno` renderiza **13 miniaturas vivas**: con 13 instancias
      de la home —varias con animaciones infinitas y su propio carrusel— conviene
      pasar a renderizarlas sólo cuando entran en pantalla · **el `styles.css`
      global ya está en 122 kB y el aviso de presupuesto quedó a ~14 kB**: antes
      del próximo diseño hay que decidir si se sube el umbral o si el CSS de cada
      diseño se separa en archivos que se carguen **sólo** con el diseño activo
      (que es la solución de fondo, porque hoy las utilidades de los 13 viajan en
      el bundle inicial).

61. **Ocho diseños más: Boutique, Feria, Periódico, Retro 90, Suizo, Cancha,
    Cine y Playa — ya son 21 (2026-10-02).** Pedido: "8 templates más, así de
    disruptivos y diferentes" (y la pregunta de cómo se adapta la tienda si el
    cliente sube otro logo u otro nombre). Respuesta corta: el nombre, el logo y
    los textos ya salen de `/api/settings`, así que cambiar de marca no toca
    ninguna plantilla; y para la parte "seleccionar prendas en promoción" se
    sumó la vista de #62.
    - **Cada diseño tiene UN recurso visual propio** (detalle en 7bis): Boutique
      (marfil/negro/dorado, nada de cajas de color), Feria (toldo rayado,
      carteles de cartón con cinta), Periódico (catálogo como **ranking
      numerado**, cabecera de diario a doble filete), Retro 90 (Memphis),
      Suizo (grilla, números de sección, fotos **gris → color** al pasar el
      mouse), Cancha (tablero LED + pizarra + red), Cine (**el tercer diseño
      oscuro**, marquesina con foquitos y cortina) y Playa (degradé de mar,
      sol, olas y promos coral).
    - **Los 8 no inventan datos:** todo sale de lo que el backend ya tenía
      (parametrías, `/api/discounts`, `storePhotoUrl`, `aboutText`,
      `sizeStocks`, `description`, `bestSellers`).
    - **`ProductCard`** sumó `boutique`, `feria`, `periodico`, `retro`, `suizo`,
      `cancha`, `cine` y `playa`: **20 variantes** (Fichero sigue usando
      `classic` porque su home usa filas).
    - **Backend:** los 8 ids sumados al `@Pattern` de `AppearanceRequest`
      (commit `b36c5a2`); commit del frontend `ffd23fc`.
    - **Verificación:** los 21 diseños se ven en las miniaturas vivas de
      `/admin/config/diseno` y el cambio de diseño se probó de punta a punta
      contra el backend real y en el navegador. La tienda quedó en **Pop** (el
      elegido para probar; el default sigue siendo Ruth).
    - **Build (medición del día, con los tres cambios de la fecha):**
      `ng build` OK; initial **565,82 kB** / 140,18 kB de transferencia; el CSS
      global pasó de 122,55 kB a **145,6 kB (149.056 bytes)** — y por primera
      vez **aparece el aviso de presupuesto**: se pasó por 15,82 kB del umbral
      de 550 kB (era el pendiente que #60 había dejado anotado). Sigue pendiente
      decidir entre subir el umbral o separar el CSS por diseño.

62. **Vista `/promos`: marcado manual "Mostrar en promos" con fallback a los
    descuentos vigentes (2026-10-02).** Nació de la pregunta del cliente:
    "¿poder seleccionar prendas en promoción para que aparezcan en otra vista
    que es la que aparezca en el banner de liquidación o promoción?".
    - **Cómo funciona:** el form de producto suma el tilde **"Mostrar en
      promos"** (`featuredInPromos`, columna nueva que crea sola
      `ddl-auto: update`). La vista `/promos` muestra, por prioridad: (1) las
      prendas marcadas a mano; (2) si no hay ninguna, **las prendas con
      descuento por parametría vigente** (las mismas de `/api/discounts`),
      ordenadas de mayor a menor %. El chip **"-N%"** sale de
      `DiscountService.percentForProduct` — el mismo cálculo que aplica el
      carrito, así que nunca se anuncia un % que no se descuente.
    - **Integración:** el **banner promocional** acepta `/promos` como link
      (placeholder del campo actualizado) y los links del diseño **Neón**
      ("Ver promos" del hero y "Ver las prendas en promo →") apuntan ahí.
      La página vive fuera del `CatalogView`, así que elige la variante de
      tarjeta con un `VARIANT_BY_LAYOUT` propio (duplicado a propósito) para no
      desentonar con el diseño activo.
    - **Commits:** frontend `bcea9d2`, backend `ba63338` (columna + 4 DTOs +
      `ProductService.apply()` + form).
    - **Verificación:** en navegador con y sin prendas marcadas (fallback) y
      con el banner apuntando a `/promos`. Al cerrar se desmarcó la prenda que
      había quedado de la prueba anterior ("Zapatillas urbanas velcro"): hoy no
      hay ninguna marcada a mano y `/promos` muestra el fallback.

63. **Título de pestaña dinámico: "Página | Nombre de la tienda" (2026-10-02).**
    - **Qué hace:** `StoreTitleStrategy` (`core/store-title.strategy.ts`,
      registrada como `TitleStrategy` en `app.config.ts`) arma el título de las
      páginas públicas como `<página> | <storeName real de /api/settings>`: si
      la dueña cambia el nombre de la tienda desde el panel, la pestaña lo sigue
      sin redeployar. En el panel (`/admin`) el título queda como lo define cada
      ruta (`X | Admin`).
    - **El bug que apareció y cómo se resolvió:** resolver `SettingsService` con
      `inject()` en el constructor de la estrategia dispara el request de
      `/api/settings` mientras el Router todavía se está construyendo; el
      interceptor de ese request vuelve a pedir el Router → **ciclo de DI
      (NG0200)**. Lo grave es que el error se tiraba sincrónicamente dentro del
      subscribe del interceptor y **moría en silencio**: `/api/settings` no se
      resolvía nunca y la tienda quedaba con los `DEFAULTS`. Se resolvió
      **diferido**: `Injector.get(SettingsService)` en la primera navegación
      (cuando el Router ya terminó de construirse) + `effect` con guarda
      `inAdmin` para no pisar el título del panel.
    - **Verificación:** se renombró la tienda temporalmente desde el panel para
      ver la pestaña cambiar en vivo y se revirtió: quedó como estaba,
      "Estilos Pequeños". Commit `18a7b28`.
    - **Documentación:** esta pasada actualizó PROYECTO.md (encabezado, 2, 6,
      7bis, 7ter, 8, 9sexies y este historial) y CLAUDE.md; además se corrigió
      la ruta del backend (en esta máquina la carpeta es `../backend/`, el repo
      en GitHub se llama `backend-ecommer-ruth`).

64. **Vocabulario de tienda en las etiquetas funcionales de las plantillas temáticas (2026-10-02).**
    - **Qué se corrigió:** varios diseños renombraban títulos y estados con
      jerga del tema —Cine decía "Función continuada" y contaba prendas "en
      cartel"; Cancha hablaba de "Plantel completo"— y quien entra a comprar no
      entiende qué está mirando. Regla adoptada desde acá (documentada en
      §7bis): **los textos funcionales usan siempre el vocabulario de tienda
      de Ruth** y la personalidad del diseño queda sólo en lo decorativo.
    - **Qué se cambió (31 ediciones en 9 plantillas):** títulos de sección →
      "Lo más vendido" / "El catálogo" / "Promos vigentes" (Cine, Cancha,
      Jungla, Periódico, Playa, Feria, Retro 90, Boutique y Cohete); conteos →
      "N prendas" (Cine, Cancha); kicker de filtros → "Elegí tu categoría:"
      (Cine); buscador → "Buscar producto..." (Cine, Cancha, Periódico,
      Feria); estados vacíos → "Sin resultados" + "No encontramos productos
      con esos filtros." / "Probá con otros filtros." + CTA "Ver todo el
      catálogo" (Cine, Cancha, Periódico, Playa, Feria, Retro 90); "Ver más
      productos (N más)" (Periódico); y en Cohete la urgencia de stock pasó al
      mismo texto que Neón ("Se están agotando").
    - **Qué se mantuvo a propósito (lo decorativo):** kickers del hero ("Cine
      de barrio · ropa para chicos", "Club de ropa para chicos"), epígrafes
      ("La cartelera, pasando ahora — deslizá →", "Deslizá para ver la
      cancha"), frases de cierre ("Te esperamos en la selva. 🌴") y los
      chistes de los estados de error ("Se cortó la película", "Suspendido",
      "Se cortó la música"), que ya traían la aclaración en castellano simple
      debajo. También quedaron las variantes honestas ya en llano: "Los más
      elegidos" (Jungla), "Lo que más sale" (Crayón), "Recién llegados"
      (Caramelo).
    - **Verificación:** grep sobre las 21 plantillas sin restos de las cadenas
      viejas (sólo coincidencias benignas en comentarios internos);
      compilación limpia; en navegador Cine, Cancha y Periódico completos
      (incluido el vacío con "Sin resultados" y el CTA "Ver todo el catálogo",
      y el riel de más vendidos que se esconde al filtrar) + las miniaturas
      del panel para Jungla y Cohete. La tienda quedó en **Pop**, como estaba.
    - **Commit:** frontend `39f1740` (9 archivos, 63+/63−). Esta pasada de
      documentación actualizó §7bis (regla nueva + mención "en cartel" del
      bullet de Cine corregida), el encabezado y este historial.

65. **Nueve diseños "de movimiento": Pasarela, Baraja, Líquido, Kinético, Órbita, Estela, Origami, Historias y Portal (2026-10-06).**
    - **Qué se pidió:** nueve diseños nuevos que no se parezcan a los 21
      existentes, con movimiento, animaciones y transiciones, y que sigan
      mostrando todo lo que la tienda ya tiene.
    - **Decisión de diseño:** como los anteriores se diferencian por tema, estos
      se diferencian por **mecánica de movimiento** (detalle de cada uno en
      §7bis). Misma arquitectura: plantilla dueña de su markup, variante propia
      de `ProductCard`, tokens `[data-layout="x"], .tpl-x` en `styles.css`,
      entrada en `LAYOUTS`, variante en `/promos` y los nueve ids en el
      `@Pattern` de `AppearanceRequest` (backend).
    - **Qué se agregó:** 5 directivas (`appScrollScene`, `appOrbit`,
      `appCursorTrail`, `appMagnetic`, `appSwipe`), 2 variantes de `appReveal`
      (`fold`, `flip`), `MotionTemplateBase`, 9 plantillas (`.ts` + `.html`),
      9 variantes de tarjeta, el bloque "DISEÑOS DE MOVIMIENTO" de
      `styles.css` y `withViewTransitions` en `app.config.ts`.
    - **Verificación en navegador (Playwright, 1440×900 y 390×780) contra el
      backend real:** los nueve activados uno por uno con `PUT apariencia`
      (200), recorridos de punta a punta sin errores de consola y sin scroll
      horizontal. Probado puntualmente: el desfile de Pasarela (queda clavado y
      el riel llega de punta a punta), el mazo de Baraja (flechas y arrastre,
      sin navegar al arrastrar), el anillo de Órbita (gira solo, arrastre sin
      navegar, clic sí navega), la estela de Estela, las historias (avance
      manual y automático), la hoja de filtros de Historias (abre, filtra,
      cierra con Escape, contador), el portal (progreso 0→1) y la navegación a
      la ficha con el nombre de transición puesto. También: "Sin resultados" +
      "Ver todo el catálogo" y `prefers-reduced-motion` (los dos, sólo en
      Portal), las miniaturas de `/admin/config/diseno` (30 tarjetas; a la
      vista las de la última tanda), y que con Pop la navegación sigue igual
      con View Transitions activadas. Una segunda pasada confirmó los arreglos
      hechos sobre la marcha: el título de Kinético entra entero en escritorio y
      celular, los filtros de Baraja quedan en una fila, Pasarela no desborda en
      el celular, la solapa de Origami se abre al pasar el mouse y muestra los
      talles, y `/promos` dibuja las tarjetas con la variante nueva (probado con
      Pasarela).
    - **Bugs encontrados y corregidos en la verificación:** el arrastre del
      anillo abría la prenda (ahora el clic se frena en captura); títulos que
      desbordaban en el celular (cuerpos con `clamp` + `min-w-0`; en Kinético el
      cuerpo sale del largo de la palabra más larga); el nombre de la tienda en
      el header empujaba el carrito con las fuentes anchas de Pasarela y Órbita
      (se achica sólo ahí, sólo en el celular); el visor de Historias no se veía
      en escritorio (columna `auto` → `22rem`); `skipTransition()` ensuciaba la
      consola (reemplazado por CSS).
    - **No verificado:** dedo real en un teléfono (los gestos se probaron con
      mouse y viewport de celular; la miniatura táctil de Estela y la solapa
      abierta de Origami dependen de `(hover: none)` y no se vieron en un
      dispositivo táctil de verdad); Safari y Firefox; fotos reales en el
      carrusel (la base local no tiene, así que los heros se vieron con el logo
      o con la foto de una prenda); el estado de error de carga del catálogo;
      la animación del viaje de la foto de Portal cuadro por cuadro (se
      comprobó que navega y que los nombres de transición coinciden, no cómo se
      ve); `prefers-reduced-motion` en los otros ocho (sólo se probó Portal); y
      el visor de Historias en escritorio después del arreglo, que sólo se vio
      en la miniatura del panel.
    - **Costo:** el bundle inicial pasó de 565,8 kB a 619,9 kB (140,2 → 149,0 kB
      comprimido), casi todo CSS. Ya estaba por encima del aviso de 550 kB antes
      de esta tanda; el límite de error (1 MB) sigue lejos.
    - La tienda quedó en **Pop**, como estaba.

## 12. Backend (`../backend/`) — resumen

> **Ruta real:** en esta máquina la carpeta del backend es `../backend/` (el
> repo en GitHub se llama `backend-ecommer-ruth`). **Detalle completo en
> `../backend/PROYECTO.md`**, que es el documento vivo del backend; lo de acá
> es un resumen y puede quedar atrás.

- **Qué es:** API REST en Java 21 / Spring Boot 3.3 / MySQL 8. Repo git propio.
  Docs interactivas en `http://localhost:8080/swagger-ui.html`.
- **Auth:** `POST /api/auth/login` con **DNI + contraseña** (contraseña
  **BCrypt** contra la tabla `admin_user`) → **JWT** para `Authorization: Bearer`
  en `/api/admin/**`. **Recuperación por mail con link** (`POST
  /api/auth/forgot-password` → `/api/auth/reset-password`, token de un solo uso
  que vence en 1 h). Ya **no** hay frase de recuperación ni `username`.
- **Roles:** RBAC con `Role` + `Permission` (`@PreAuthorize` por endpoint).
  Roles: Superadmin (sistema, todos los permisos), Administrador y Vendedor.
  Hay además un eje aparte `AdminUser.superAdmin` para Cloudinary/mail
  (backend #26/#51).
- **Endpoints públicos:** catálogo (`/api/products`, `/best-sellers`),
  parametrías, escalas de talle, carrusel, descuentos, `GET /api/settings`
  (**sin caché de navegador** desde 2026-09-30, historial #56),
  `POST /api/orders` (checkout), `GET /api/orders/lookup` (mis pedidos),
  `GET /api/coupons/{code}`, y el **webhook de Mercado Pago**.
- **Diseño de la tienda (2026-09-30, ampliado el 2026-10-01 y el 2026-10-02):**
  `SiteSettings.layout` — los **21 ids** (`ruth` | `editorial` | `pop` |
  `vidriera` | `ofertas` | `fichero` | `mosaico` | `nova` | `neon` |
  `caramelo` | `cohete` | `jungla` | `crayon` | `boutique` | `feria` |
  `periodico` | `retro` | `suizo` | `cancha` | `cine` | `playa`), validados con
  `@Pattern` en `AppearanceRequest`) +
  `PUT /api/admin/settings/apariencia` con
  `@PreAuthorize("hasAnyAuthority('PLATFORM_SETTINGS_MANAGE',
  'CAROUSEL_MANAGE')")` — lo puede cambiar el dueño de la tienda, no sólo el
  superadmin. `ddl-auto=update` creó la columna sola. Ver sección 7bis.
- **Producto promocionable (2026-10-02):** `Product.featuredInPromos`
  (boolean, default `false`, la crea `ddl-auto=update`) — lo edita el form del
  panel y lo expone `GET /api/products`; lo usa la vista `/promos`. Ambos se
  pueden tocar también por `PUT /api/admin/products/{id}`. Ver sección 7ter.
- **Entidades principales:** AdminUser, Role/Permission, SiteSettings (fila
  única), PlatformMailSettings, Product (+ `params`, `sizeStocks`, `images`,
  `barcode`, `videoUrl`, `costPrice`, `supplierId`), ParamGroup/ParamOption,
  SizeScale, Supplier, Discount, Coupon, Order/OrderLine, Exchange/ExchangeLine,
  Shift, StockMovement, Expense/ExpenseBudget, MarketingConfig/MarketingSend,
  HeroSlide.
- **Módulos:** catálogo, checkout (WhatsApp **y** Mercado Pago Checkout Pro),
  panel con POS, turnos con cierre de caja, cambios de prenda, cupones,
  campañas de mail, métricas, gastos/balance con **costeo por promedio
  ponderado**, movimientos de stock, alertas de stock bajo por mail, export CSV.
- **Descuentos:** `DiscountService.computeForLines` es el port de
  `discount.service.ts` (`computeCartDiscount`) — se aplica al crear el pedido.
- **Código de pedido:** `PED-0001`… derivado de un correlativo `number`.
- **Seed:** al primer arranque carga parametrías, escalas, 2 descuentos y 10
  productos de ejemplo (`DataSeeder`). Se apaga con `SEED_ENABLED=false`.
- **Correr:** `cd ../backend && ./mvnw spring-boot:run` con
  `DB_USER`/`DB_PASSWORD` (MySQL) y `JWT_SECRET` (o `application-local.yml`).
- **DB:** en desarrollo `ddl-auto=update` (Hibernate crea/actualiza el esquema).
  En `database/` hay scripts SQL a mano (`schema.sql`, `seed.sql`, `reset.sql`,
  `setup.sql`). **Verificado el 2026-09-20** (backend #36): `mysql < setup.sql`
  + arrancar con `ddl-auto=validate` funciona. Flyway sigue pendiente.
- **Pendientes backend:** Flyway (migraciones versionadas), perfil `prod` +
  deploy, proyecciones DTO y desactivar OSIV, subida de imágenes a storage en
  vez de data-URI, y probar Mercado Pago con credenciales reales.
