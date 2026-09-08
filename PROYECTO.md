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
`/admin/ajustes` y los guarda el backend (`site_settings`). Ver sección 9sexies.
Valores por defecto (fallback si el backend no responde) en
`src/app/core/services/settings.service.ts` → `DEFAULTS`.

## 5. Panel de administración

- URL: `http://localhost:4200/admin`. Login **`admin` / `ruth123`** — valida
  contra el backend (`POST /api/auth/login`) y guarda el JWT en `localStorage`.
  Un interceptor lo manda en `/api/admin/**`; si expira o falta, vuelve al login.
- `/admin/recuperar` — si el admin se olvidó la contraseña: usuario + **frase de
  recuperación** + contraseña nueva (no usa email).
- `/admin/cuenta` — cambiar la contraseña y la frase de recuperación (piden la
  contraseña actual). ⚠️ **La frase de recuperación inicial es
  `frase-de-recuperacion-cambiar` — cambiala.**
- `/admin/ajustes` ("🏬 Datos del local") — nombre de la tienda, número de
  WhatsApp, texto de "sobre nosotros" y redes. Sin redesplegar nada (sección 9sexies).
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
  shared/components/            # header, footer, product-card, quantity-stepper, hero-carousel, toast, skeleton
  features/
    catalog/catalog-page/       # home: hero + carrusel + filtros + grilla
    product-detail/             # ficha de producto (talle con stock, cantidad, agregar al carrito)
    cart/cart-page/             # carrito + botón "Comprar por WhatsApp" (crea el pedido)
    admin/                      # login, layout, productos, pedidos, carrusel (ver sección 9bis)
```

## 9. Cómo funciona el checkout por WhatsApp

1. Cliente agrega prendas al carrito eligiendo talle y cantidad (limitado
   al stock de ESE talle puntual). El carrito vive en `localStorage`.
2. En `/carrito` carga su nombre y toca **"Comprar por WhatsApp"**. Ahí el
   frontend hace `POST /api/orders` → el **backend** crea el pedido con
   código correlativo (`PED-0001`…), calcula los descuentos y el total, y lo
   guarda en la base. Con el pedido devuelto se abre `wa.me/<número>` en
   pestaña nueva con el mensaje ya armado. El cliente solo tiene que enviarlo.
3. El dueño/a recibe el pedido por WhatsApp y responde con el alias o
   link de Mercado Pago para que el cliente pague directamente.
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
- `/admin/pedidos/:id` — detalle: tildar/destildar ítems, confirmar
  (descuenta stock) o cancelar el pedido completo. **No deja confirmar** si
  algún ítem tildado no tiene stock suficiente (muestra qué falta y el backend
  también lo rechaza). Usa un *resolver* (`orderResolver`) — no depende de que
  el pedido esté en la página cargada del listado.
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
- `/admin/promociones` — descuentos automáticos: por **monto de compra** y por
  **parametría** (ej: "todo lo de bebé 15% off"), con un **modo de combinación**
  ("aplicar el mayor" / "combinar"). Cada descuento admite **fechas de vigencia**
  (desde / hasta) — fuera del rango no se aplica; el panel muestra un indicador
  (Programado / Vencido / Vigente). Se aplican solo en el carrito.
- `/admin/cuenta` — cambiar contraseña y frase de recuperación.
- `/admin/recuperar` — recuperar la cuenta con la frase de recuperación (ruta
  pública, fuera del layout del admin).
- `/admin/ajustes` — datos del local: nombre de la tienda, WhatsApp, "sobre
  nosotros", Instagram y Facebook (ver sección 9sexies).
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

## 9sexies. Datos del local (configurables sin desplegar)

- **Qué es:** `/admin/ajustes` — un formulario para editar el **nombre de la
  tienda**, el **número de WhatsApp**, el texto de **"sobre nosotros"** (pie de
  página), el **usuario de Instagram** y el **link de Facebook**. Los cambios se
  aplican al instante para todos, sin redesplegar backend ni frontend.
- **Backend:** tabla `site_settings` (una sola fila, id fijo `config`).
  `GET /api/settings` (público — lo usan header, footer, home y el armado del
  mensaje de WhatsApp), `GET`/`PUT /api/admin/settings` (con token).
- **Frontend:** `SettingsService` (signal-based, `providedIn: 'root'`) carga
  `/api/settings` al arrancar la app y expone `settings()`, `whatsappUrl()`,
  `instagramUrl()`. Si el backend no responde, usa `DEFAULTS` (los valores
  reales actuales) para no romper la tienda. `FooterComponent`,
  `HeaderComponent`, `CatalogPageComponent`, `AdminLayoutComponent` y
  `WhatsappService` leen de ahí.
- **Validación** del número: solo dígitos, 8 a 15 (sin `+`, espacios ni `15`).
  Mismo `@Pattern` en el DTO del backend y en el form.
- Sigue **pendiente** cargar el número de WhatsApp real: ahora se hace desde
  `/admin/ajustes`, no tocando código.

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
