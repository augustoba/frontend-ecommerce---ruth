# Estilos Pequeños — Documento de alcance y referencia

> Documento vivo: actualizalo a mano (o pedime que lo actualice) cada vez
> que cambie algo importante del proyecto. Última actualización: 2026-09-07.

## 1. Qué es esto

Ecommerce de indumentaria infantil ("Estilos Pequeños", Argentina).
**Checkout sin pasarela de pago:** el cliente arma el carrito y al tocar
"Comprar" se abre WhatsApp con el pedido ya redactado, dirigido al número
del dueño/a. El dueño/a responde por WhatsApp con el alias o link de
Mercado Pago para coordinar el pago manualmente.

- **Frontend:** Angular — repo actual (`frontend-ecommerce---ruth/`), ya
  desarrollado. **Todavía usa datos mock en `localStorage`** — NO está
  conectado al backend.
- **Backend:** Java 21 + Spring Boot 3.3 + MySQL 8, carpeta hermana
  `../backend/` — **v1 hecha (2026-09-08)**: CRUD completo del admin + catálogo
  público + login JWT. Ver sección 12 y `../backend/README.md`.
- **Pendiente:** conectar el frontend al backend (reemplazar los services de
  `localStorage` por `HttpClient`).

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

```bash
cd "C:\proyectos\ecommerce ruth\frontend"
npm start
```

Abre en `http://localhost:4200`. Live reload activado (recarga sola al
guardar cambios). Si el puerto está ocupado: `npm start -- --port 4300`.

Build de producción: `npm run build` → sale en `dist/ecommerce-ninos/`.

## 4. Configuración clave — `src/app/core/config/site-config.ts`

**Todo lo que hay que tocar antes de publicar el sitio de verdad vive en
este único archivo.**

| Campo | Valor actual | Qué es |
|---|---|---|
| `storeName` | `Estilos Pequeños` | Nombre que se muestra en toda la app |
| `whatsappNumber` | `5491122334455` | ⚠️ **Placeholder, no es un número real.** Formato: país+área+número sin `+`, espacios ni `15`. Hay que reemplazarlo por el número real del dueño/a antes de publicar. |
| `admin.username` | `admin` | Usuario del panel `/admin` |
| `admin.password` | `cambiar-esta-clave` | ⚠️ **Placeholder — cambiarla.** Login simple pensado solo para esta v1 sin backend (las credenciales viven en el código del frontend, no es seguridad real). Cuando exista el backend Java hay que reemplazar `AuthService` por un login contra la API. |
| `about` | texto "Somos Estilos Pequeños... hace 5 años..." | Texto del "Sobre nosotros" del pie de página |
| `redes.instagram` | `estilospequenos_` | Usuario de Instagram (sin @) — real, confirmado por el cliente |
| `redes.facebookUrl` | `https://www.facebook.com/share/1NZXdYgick/` | Link de Facebook — real, confirmado por el cliente |

## 5. Panel de administración

- URL: `http://localhost:4200/admin` (pide login).
- Permite: crear/editar/ocultar/eliminar productos, con **stock manejado
  por talle** (cada talle tiene su propia cantidad, no un stock único por
  producto) y **clasificación por parametrías** (ver sección 9ter).
- Los datos se guardan en `localStorage` del navegador (no hay backend
  todavía) — si se borra el storage del navegador, vuelve al catálogo de
  ejemplo.

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
- **Imágenes de productos y del carrusel:** hoy son ilustraciones
  generadas por código (SVG con emoji de la prenda sobre círculo de
  color — ver `src/app/core/assets/clothing-icons.ts`), **no son fotos
  reales**. No dependen de internet.
  - Para poner fotos reales: copiarlas a `public/` y cambiar el
    `imageUrl` correspondiente en `src/app/core/services/product.service.ts`
    (productos) o `HERO_SLIDES` en `catalog-page.component.ts` (carrusel).
- Debajo: buscador + filtros dinámicos generados desde las parametrías
  marcadas como "filtro en la tienda" (Público como botones, el resto como
  selectores) + filtro por talle, y la grilla de productos.

## 8. Estructura del código

```
src/app/
  core/
    config/site-config.ts       # nombre, WhatsApp, credenciales admin, redes (ver sección 4)
    assets/clothing-icons.ts    # generador de imágenes SVG de ejemplo
    utils/image-resize.ts       # redimensiona fotos subidas antes de guardarlas
    models/                     # Product (params + sizeScaleId + supplierId/costPrice opc.), CartItem, Order, ParamGroup, Discount, Supplier, SizeScale
    services/
      product.service.ts        # catálogo (mock + localStorage), CRUD admin, migra `category`→params y talles→sizeScaleId
      param.service.ts          # parametrías (grupos + opciones) editables — localStorage
      size-scale.service.ts     # escalas de talle editables (ropa bebé/niños/adultos, calzado…) — localStorage
      supplier.service.ts       # proveedores del local (info interna admin) — localStorage
      cart.service.ts           # carrito (signals + localStorage)
      whatsapp.service.ts       # arma el mensaje (código + subtotal/descuento/total) y el link wa.me
      order.service.ts          # pedidos con código, confirmar/cancelar, descuenta stock, aplica descuentos
      discount.service.ts       # descuentos por monto y por parametría + modo de combinación (localStorage)
      hero-slides.service.ts    # fotos del carrusel de la home (localStorage)
      auth.service.ts           # login simple del panel admin
    guards/admin.guard.ts       # protege /admin/*
  shared/components/            # header, footer, product-card, quantity-stepper, hero-carousel
  features/
    catalog/catalog-page/       # home: hero + carrusel + filtros + grilla
    product-detail/             # ficha de producto (talle con stock, cantidad, agregar al carrito)
    cart/cart-page/             # carrito + botón "Comprar por WhatsApp" (crea el pedido)
    admin/                      # login, layout, productos, pedidos, carrusel (ver sección 9bis)
```

## 9. Cómo funciona el checkout por WhatsApp (100% client-side)

1. Cliente agrega prendas al carrito eligiendo talle y cantidad (limitado
   al stock de ESE talle puntual).
2. En `/carrito` carga su nombre y toca **"Comprar por WhatsApp"**. Ahí
   se crea un **pedido con código correlativo** (`PED-0001`, `PED-0002`...)
   guardado en el panel de admin, y se abre `wa.me/<número>` en pestaña
   nueva con el mensaje ya armado (código, detalle de prendas, talles,
   cantidades, total). El cliente solo tiene que enviarlo.
3. El dueño/a recibe el pedido por WhatsApp y responde con el alias o
   link de Mercado Pago para que el cliente pague directamente.
4. El dueño/a entra a `/admin/pedidos`, busca el pedido por su código,
   **tilda/destilda cada prenda** según si la va a entregar (por si no
   hay stock real de algo) y toca **"Confirmar y descontar stock"** — ahí
   se descuenta automático el stock de cada talle confirmado, sin tener
   que ir producto por producto a mano. También puede cancelar el pedido
   completo sin tocar stock.

## 9bis. Panel de administración — módulos

- `/admin/pedidos` — listado de pedidos (código, cliente, fecha, total,
  estado). Muestra un contador de pedidos pendientes en el menú lateral.
- `/admin/pedidos/:id` — detalle: tildar/destildar ítems, confirmar
  (descuenta stock) o cancelar el pedido completo. Avisa si el stock
  actual de un talle ya no alcanza para lo pedido.
- `/admin/productos` y `/admin/productos/nuevo` / `:id/editar` — CRUD de
  productos con stock por talle (ver sección 5... perdón, sección de
  panel admin original).
- `/admin/carrusel` — administra las fotos del carrusel de la home: subir
  foto desde archivo (se redimensiona sola a máx. 1600px de ancho antes
  de guardarla, para no llenar el `localStorage`), editar descripción,
  reordenar, eliminar, o restaurar las ilustraciones de ejemplo.
- `/admin/parametrias` — grupos de clasificación de prendas (ver sección 9ter).
- `/admin/talles` — escalas de talle editables (ver sección 9quinquies).
- `/admin/proveedores` — proveedores del local (ver sección 9quater).
- `/admin/promociones` — descuentos automáticos: por **monto de compra** y por
  **parametría** (ej: "todo lo de bebé 15% off"), con un **modo de combinación**
  ("aplicar el mayor" / "combinar"). Se aplican solo en el carrito.

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

## 10. Pendientes / próximos pasos conocidos

- [ ] Reemplazar `whatsappNumber` por el número real antes de publicar.
- [ ] Cambiar `admin.username` / `admin.password` a algo definitivo.
- [ ] Sumar fotos reales de los productos y del carrusel (hoy son íconos
      de ejemplo).
- [ ] Definir si se ajusta la paleta de colores del sitio a los tonos
      exactos del logo.
- [ ] Backend en Java: **arrancar solo cuando el cliente lo pida**
      (instrucción explícita: no adelantarse). `ProductService` y
      `AuthService` ya están aislados del resto de la app para poder
      cambiarlos por llamadas HTTP sin tocar las pantallas.
- [ ] Evaluar deploy/hosting del frontend cuando esté listo para publicar.
- [ ] Pantalla de métricas (`/admin/metricas`): con talles, proveedores y
      parametrías ya estructurados, se puede armar un panel de ventas por talle
      / proveedor / estación leyendo los pedidos procesados. Pedido a futuro.

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
    creación de pedidos con cálculo de descuentos server-side. El frontend
    **todavía no está conectado** (sigue con `localStorage`).

## 12. Backend (`../backend/`)

- **Qué es:** API REST en Java 21 / Spring Boot 3.3 / MySQL 8. Proyecto
  separado, con su propio git. Docs interactivas en `/swagger-ui.html`.
- **Auth:** `POST /api/auth/login` (usuario/clave del admin, por defecto los
  mismos que el front: `admin` / `cambiar-esta-clave`) devuelve un **JWT** que
  hay que mandar como `Authorization: Bearer <token>` en todos los
  `/api/admin/**`. Los endpoints públicos (`/api/products`, `/api/param-groups`,
  `/api/size-scales`, `/api/hero-slides`, `POST /api/orders`) no piden token.
- **Entidades:** Product (con `params`, `sizeStocks`, `sizeScaleId`, `supplierId`,
  `costPrice`), ParamGroup/ParamOption, SizeScale, Supplier, Discount +
  DiscountConfig, Order/OrderLine, HeroSlide. Reflejan 1:1 los modelos del front.
- **Descuentos:** `DiscountService.computeForLines` es el port de
  `discount.service.ts` (`computeCartDiscount`) — se aplica al crear el pedido.
- **Código de pedido:** `PED-0001`… derivado de un correlativo `number`.
- **Seed:** al primer arranque carga parametrías, escalas, 2 descuentos y 10
  productos de ejemplo (`DataSeeder`). Se apaga con `SEED_ENABLED=false`.
- **Correr:** `cd ../backend && ./mvnw spring-boot:run` con `DB_USER`/`DB_PASSWORD`
  (MySQL) y `JWT_SECRET` en el entorno (o `application-local.yml`). Detalle en
  `../backend/README.md`.
- **DB:** `spring.jpa.hibernate.ddl-auto=update` (Hibernate crea/actualiza el
  esquema). Flyway queda pendiente.
- **Pendientes backend:** Flyway, hashear la clave del admin, perfil de
  producción/deploy, y **conectar el frontend Angular**.
