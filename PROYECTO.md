# Estilos Pequeños — Documento de alcance y referencia

> Documento vivo del proyecto (overview general + detalle del frontend).
> El detalle del backend (entidades, endpoints, auth) está en
> `../backend/PROYECTO.md`. Última actualización: 2026-09-08.

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
| Datos de productos (front) | Mock en código + `localStorage` (todavía sin conectar al backend) | Preparar capa HTTP desde ya |
| Backend | Java 21 + Spring Boot 3.3 + MySQL 8 + JWT (Maven) | Node/Nest, Quarkus, Gradle, Postgres/H2 |
| Alcance v1 | Catálogo+filtros, carrito+checkout WhatsApp, panel admin, API backend | — |
| Pasarela de pago | Ninguna — checkout por WhatsApp + alias/link MP manual | Mercado Pago Checkout Pro/API |

Sin dependencias de pasarela de pago en el proyecto.

## 3. Cómo correr el proyecto en local

**Necesitás los dos: backend + frontend.**

```bash
# 1) backend  (con MySQL corriendo)
cd "C:\Users\august0\Desktop\proyectos\ecommerce ruth\backend"
./mvnw spring-boot:run          # http://localhost:8080

# 2) frontend
cd "C:\Users\august0\Desktop\proyectos\ecommerce ruth\frontend-ecommerce---ruth"
npm start                       # http://localhost:4200
```

El frontend llama a `/api/*` y el dev-server lo redirige al backend
(`proxy.conf.json` — se toma solo, sin flags). Si el backend está caído,
la tienda muestra "no se pudo conectar" y estados de error con "reintentar".

Login del admin: **`admin` / `ruth123`**.

Build de producción del frontend: `npm run build` → `dist/ecommerce-ninos/`.
En prod, poné la URL del backend en `apiBaseUrl` (site-config.ts) si va en
otro dominio.

## 4. Configuración clave — `src/app/core/config/site-config.ts`

Este archivo quedó reducido a **una sola cosa**: la base de la API.

| Campo | Valor actual | Qué es |
|---|---|---|
| `apiBaseUrl` | `''` (vacío) | Base del backend. Vacío = usa el proxy del dev-server. En prod, la URL del backend si va en otro dominio. |

También exporta `apiUrl(path)` → `` `${apiBaseUrl}/api${path}` ``.

**El nombre de la tienda, el número de WhatsApp, el texto de "sobre nosotros"
y las redes ya NO viven en el código.** Son configurables desde
`/admin/config` y los guarda el backend (`site_settings`). Ver sección 9sexies.
Valores por defecto (fallback si el backend no responde) en
`src/app/core/services/settings.service.ts` → `DEFAULTS`.

## 5. Panel de administración

- URL: `http://localhost:4200/admin`. Login **`admin` / `ruth123`** — valida
  contra el backend (`POST /api/auth/login`) y guarda el JWT en `localStorage`.
  Un interceptor lo manda en `/api/admin/**`; si expira o falta, vuelve al login.
- **Menú lateral agrupado** (sección 9octies): Inicio suelto arriba + tres grupos
  colapsables (Ventas, Catálogo, **Configuración del sitio**) + Mi cuenta y "Ver
  tienda" abajo. En mobile es un drawer con botón hamburguesa. El estado abierto
  de cada grupo se recuerda en `localStorage` (`ep_admin_menu_open`).
- `/admin/recuperar` — si el admin se olvidó la contraseña: usuario + **frase de
  recuperación** + contraseña nueva (no usa email).
- `/admin/cuenta` — cambiar la contraseña y la frase de recuperación (piden la
  contraseña actual). ⚠️ **La frase de recuperación inicial es
  `frase-de-recuperacion-cambiar` — cambiala.**
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
    agregar por URL o subir del disco (se redimensiona a data URI), reordenar,
    quitar. La ficha de producto muestra la galería con miniaturas.
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
  disco, reordenar, quitar; la primera es la portada) y **umbral de stock bajo**
  propio (vacío = default global 3). El form de edición usa un *resolver*.
- `/admin/carrusel` — fotos del carrusel de la home: subir foto (se redimensiona
  sola a máx. 1600px de ancho antes de mandarla), editar descripción, reordenar,
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
- `/admin/cuenta` — cambiar contraseña y frase de recuperación.
- `/admin/recuperar` — recuperar la cuenta con la frase de recuperación (ruta
  pública, fuera del layout del admin).
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
- **Logo:** se sube del disco → `resizeImageFile(..., 512, 0.9, 'image/png'|'image/jpeg')`
  (conserva el PNG con transparencia) → data URI en `site_settings.logo_url`
  (`MEDIUMTEXT`; null = `logo.jpeg`, el archivo estático). `SettingsService.logoSrc`
  lo resuelve; lo usan header, footer, home, login, recuperar, layout del admin y
  el `<app-site-preview>`. También actualiza el **favicon** en vivo
  (`SettingsService.applyFavicon`).
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

- [ ] Cargar el número de WhatsApp real desde `/admin/ajustes` antes de publicar
      (hoy hay un placeholder, `5491122334455`).
- [ ] Cambiar la contraseña (`ruth123`) y la **frase de recuperación**
      (`frase-de-recuperacion-cambiar`) del admin — desde `/admin/cuenta`.
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
- [ ] **Imágenes a storage externo** (Cloudinary/S3/disco) en vez de data-URI.
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
    - **Cambios de prenda** (`/admin/cambios`, permiso `POS_USE`): entidad
      `Exchange` + `ExchangeLine` (DEVUELTA/LLEVADA). Lo devuelto vuelve al
      stock, lo que se lleva se descuenta (estricto), `difference` = takenTotal −
      returnedTotal a precio de lista; si es positiva se cobra (con medio de
      pago). Código `CAM-0001`. Pantalla con toggle "devuelve / se lleva" +
      listado. schema.sql al día. (Todavía NO suma a métricas.)

## 12. Backend (`../backend/`) — resumen

**Detalle completo en `../backend/PROYECTO.md`.** Resumen:

- **Qué es:** API REST en Java 21 / Spring Boot 3.3 / MySQL 8. Repo git propio.
  Docs interactivas en `http://localhost:8080/swagger-ui.html`.
- **Auth:** `POST /api/auth/login` (`admin` / `ruth123`) valida contra la tabla
  `admin_user` (contraseña **BCrypt**) → **JWT** para `Authorization: Bearer` en
  `/api/admin/**`. Recuperación por frase (`POST /api/auth/recover`), cambio de
  clave/frase en `/api/admin/account/**`. Endpoints públicos: catálogo,
  `GET /api/discounts`, `GET /api/settings`, `POST /api/orders`. Métricas del
  panel: `GET /api/admin/metrics`.
- **Entidades:** AdminUser, SiteSettings (fila única), Product (con `params`,
  `sizeStocks`, `sizeScaleId`, `supplierId`, `costPrice`),
  ParamGroup/ParamOption, SizeScale, Supplier, Discount + DiscountConfig,
  Order/OrderLine, HeroSlide.
- **Estructura del código:** package-by-layer (`model/`, `repository/`,
  `service/`, `controller/`, `dto/`, + `common/`, `config/`).
- **Descuentos:** `DiscountService.computeForLines` es el port de
  `discount.service.ts` (`computeCartDiscount`) — se aplica al crear el pedido.
- **Código de pedido:** `PED-0001`… derivado de un correlativo `number`.
- **Seed:** al primer arranque carga parametrías, escalas, 2 descuentos y 10
  productos de ejemplo (`DataSeeder`). Se apaga con `SEED_ENABLED=false`.
- **Correr:** `cd ../backend && ./mvnw spring-boot:run` con `DB_USER`/`DB_PASSWORD`
  (MySQL) y `JWT_SECRET` en el entorno (o `application-local.yml`). Detalle en
  `../backend/README.md`.
- **DB:** `spring.jpa.hibernate.ddl-auto=update` (Hibernate crea/actualiza el
  esquema). En `backend/database/` hay scripts SQL a mano (`schema.sql`,
  `seed.sql`, `reset.sql`) para armar la base sin depender de `ddl-auto` (para
  prod, correr `schema.sql` y usar `ddl-auto=validate`). Flyway queda pendiente.
- **Pendientes backend:** Flyway, hashear la clave del admin, perfil de
  producción/deploy, y **conectar el frontend Angular**.
