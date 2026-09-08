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
  coincide con su marca real de WhatsApp/redes.
- Las imágenes de productos y del carrusel de la home son **íconos SVG
  generados por código** (`src/app/core/assets/clothing-icons.ts`), no
  fotos reales. El cliente todavía no mandó fotos de sus productos.
- La paleta de colores del sitio (naranja/celeste/menta, en `src/styles.css`)
  quedó como **posible ajuste pendiente** para acercarla a los tonos
  exactos del logo — ofrecido, no confirmado.
- `whatsappNumber` y `admin.username`/`admin.password` en `site-config.ts`
  son **placeholders** — hay que reemplazarlos antes de publicar.
- Redes del footer: Instagram `@estilospequenos_` y Facebook (links reales
  confirmados, en `site-config.ts` → `redes`), con íconos de marca SVG
  propios (no emoji — el cliente lo pidió explícitamente).
