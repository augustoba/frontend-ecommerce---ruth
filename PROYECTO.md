# Estilos Pequeños — Documento de alcance y referencia

> Documento vivo del proyecto (overview general + detalle del frontend).
> El detalle del backend (entidades, endpoints, auth) está en
> `../backend-ecommer-ruth/PROYECTO.md` (esa es la carpeta real; este documento
> la llamaba `../backend/`).
>
> **Última actualización: 2026-09-20** — en esa fecha se puso al día este
> documento, que había quedado del **2026-09-08** y describía un proyecto de 12
> días antes: decía que no había pasarela de pago (Mercado Pago Checkout Pro
> está implementado desde el 2026-09-17), que el login era `admin`/`ruth123`
> (es por DNI desde el 2026-09-11), y listaba como pendientes varias cosas ya
> hechas. Se corrigieron las secciones 2, 3, 3bis, 5 y 12. **Las demás secciones
> (6 a 11) siguen con la redacción del 2026-09-08** y pueden tener detalles
> atrasados — para lo del backend, la fuente de verdad es
> `../backend-ecommer-ruth/PROYECTO.md`.

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
esta máquina (el nombre de la carpeta del backend no coincide con lo que dice
este documento en otros lados — `../backend/` — es así de una tanda vieja):

```bash
# 0) (sólo la primera vez) config local del backend — gitignored, no se sube
cd "C:\proyectos\ecommerce ruth\backend-ecommer-ruth"
copy src\main\resources\application-local.yml.example src\main\resources\application-local.yml
# Editá application-local.yml: usuario/contraseña de tu MySQL, un JWT secret
# largo, y (opcional pero recomendado) tu cuenta superadmin — ver más abajo.

# 1) backend (con MySQL corriendo)
cd "C:\proyectos\ecommerce ruth\backend-ecommer-ruth"
./mvnw spring-boot:run -Dspring-boot.run.profiles=local     # http://localhost:8080

# 2) frontend
cd "C:\proyectos\ecommerce ruth\frontend"
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
   balance, campañas), hay un seed de demo: ver `../backend-ecommer-ruth/database/README.md`.

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
- `/admin/config` ("🎨 Configuración del sitio") — hub con sub-páginas: identidad
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
- Fuentes: Baloo 2 (títulos) + Nunito (texto), vía Google Fonts.

## 7. Página de inicio (`/`, `CatalogPageComponent`)

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

## 8. Estructura del código

```
src/app/
  core/
    config/site-config.ts       # storeName, apiBaseUrl, WhatsApp, redes + helper apiUrl()
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
  shared/components/            # header, footer, product-card, quantity-stepper, hero-carousel, toast, skeleton, site-preview
  features/
    catalog/catalog-page/       # home: hero + carrusel + filtros + grilla
    product-detail/             # ficha de producto (talle con stock, cantidad, agregar al carrito)
    cart/cart-page/             # carrito + entrega (retiro/envío) + pago + "Comprar por WhatsApp"
    admin/                      # login, layout, productos, pedidos, carrusel (ver sección 9bis)
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
  `logo_url`, `whatsapp_intro`, `whatsapp_closing`. `GET /api/settings` (público),
  `GET`/`PUT /api/admin/settings` (con token). El mensaje de pedido se arma en el
  frontend (`WhatsappService`), el backend sólo guarda los textos.
- **Frontend:** `SettingsService` (signal-based, `providedIn: 'root'`) carga
  `/api/settings` al arrancar la app y expone `settings()`, `logoSrc()`,
  `whatsappUrl()`, `instagramUrl()`. Si el backend no responde, usa `DEFAULTS`.
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
      queda inaccesible para todos. Nota aparte: este archivo dice `../backend/`
      pero la carpeta real en esta máquina es `../backend-ecommer-ruth/` — quedó
      así de antes, no lo tocamos en esta tanda.
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
    - **Backend (repo `../backend-ecommer-ruth/`, commit `4f4dadc`):** el
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
      WhatsApp; actualizado, y corregida la ruta del backend (decía
      `../backend/`, la carpeta real es `../backend-ecommer-ruth/`).
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
      (ver `../backend-ecommer-ruth/database/README.md`).

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

## 12. Backend (`../backend-ecommer-ruth/`) — resumen

> **Ruta real:** la carpeta del backend en esta máquina es
> `../backend-ecommer-ruth/` (este documento la llamaba `../backend/` en varios
> lados — sea `backend-ecommer-ruth`). **Detalle completo en
> `../backend-ecommer-ruth/PROYECTO.md`**, que es el documento vivo del backend;
> lo de acá es un resumen y puede quedar atrás.

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
  parametrías, escalas de talle, carrusel, descuentos, `GET /api/settings`,
  `POST /api/orders` (checkout), `GET /api/orders/lookup` (mis pedidos),
  `GET /api/coupons/{code}`, y el **webhook de Mercado Pago**.
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
- **Correr:** `cd ../backend-ecommer-ruth && ./mvnw spring-boot:run` con
  `DB_USER`/`DB_PASSWORD` (MySQL) y `JWT_SECRET` (o `application-local.yml`).
- **DB:** en desarrollo `ddl-auto=update` (Hibernate crea/actualiza el esquema).
  En `database/` hay scripts SQL a mano (`schema.sql`, `seed.sql`, `reset.sql`,
  `setup.sql`). **Verificado el 2026-09-20** (backend #36): `mysql < setup.sql`
  + arrancar con `ddl-auto=validate` funciona. Flyway sigue pendiente.
- **Pendientes backend:** Flyway (migraciones versionadas), perfil `prod` +
  deploy, proyecciones DTO y desactivar OSIV, subida de imágenes a storage en
  vez de data-URI, y probar Mercado Pago con credenciales reales.
