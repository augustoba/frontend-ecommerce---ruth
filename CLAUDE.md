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
- **Checkout sin pasarela de pago:** el carrito arma un mensaje de WhatsApp
  con el pedido y lo manda al número del dueño/a, que responde con el
  alias/link de Mercado Pago para coordinar el pago a mano. Todo el flujo
  es 100% client-side.
- **Frontend:** Angular 19 (standalone components + signals) + Tailwind
  CSS v4. Repo actual (`frontend/`), ya desarrollado.
- **Backend:** Java 21 + Spring Boot 3 + MySQL 8 + JWT, carpeta hermana
  `../backend/` (repo git propio). Package-by-layer. Ver `../backend/README.md`.
- Correr en local: backend (`cd ../backend && ./mvnw spring-boot:run`) **y**
  frontend (`npm start` → `http://localhost:4200`). El carrito es lo único
  que sigue en `localStorage`.

## Cómo trabaja el cliente (importante)

- Escribe en español rioplatense, informal, sin tildes ni mayúsculas en
  el chat. Es estilo de escritura rápido, **no** indica nivel técnico bajo.
- Pide cambios **de a uno, iterativos y concretos** ("agregá imágenes",
  "necesito que el stock sea por talle"), no specs grandes de una vez.
- **Corta el scope explícitamente cuando algo se adelanta.** Trabajar de a
  un cambio a la vez y no meter cosas que no pidió.
- **Frontend + backend conectados** (2026-09-08): los services usan `HttpClient`
  contra `/api/*` (proxy `ng serve` → `../backend/` en `:8080`). Para correr
  hace falta **levantar los dos** (ver PROYECTO.md sección 3). Login admin:
  `admin` / `ruth123` (JWT). Solo el carrito y el token quedan en `localStorage`.

## Detalles que no están en el código y conviene recordar

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
