/**
 * Migra a Cloudinary las imagenes que hoy estan guardadas como data URI en la
 * base y deja en su lugar la URL del CDN. Cubre:
 *   - fotos de productos   (product_image.url)     -> estilos-pequenos/productos
 *   - fotos del carrusel    (hero_slide.image_url)   -> estilos-pequenos/carrusel
 *   - logo y QRs de pago    (site_settings.*)        -> estilos-pequenos/logo, .../pagos
 *
 * No toca el backend: se loguea como admin contra la API REST, sube cada foto a
 * Cloudinary con el mismo unsigned upload preset que usa el front, y hace el PUT
 * correspondiente con la URL ya reemplazada.
 *
 * Uso (desde `frontend/`):
 *
 *   CLOUDINARY_CLOUD=jitutkbc CLOUDINARY_PRESET=estilospequenos \
 *   ADMIN_USER=admin ADMIN_PASS=ruth123 \
 *   node scripts/migrate-images-to-cloudinary.mjs [--dry-run]
 *
 * Variables:
 *   API_BASE          default http://localhost:8080
 *   ADMIN_USER        default admin
 *   ADMIN_PASS        (requerida)
 *   CLOUDINARY_CLOUD  (requerida) - el "Cloud name"
 *   CLOUDINARY_PRESET (requerida) - nombre del unsigned upload preset
 *   --dry-run         no sube ni guarda nada, solo lista que haria
 *
 * Idempotente: las fotos que ya son URLs (http...) se dejan intactas.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8080';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const CLOUD = process.env.CLOUDINARY_CLOUD || '';
const PRESET = process.env.CLOUDINARY_PRESET || '';
const DRY_RUN = process.argv.includes('--dry-run');

if (!ADMIN_PASS || !CLOUD || !PRESET) {
  console.error('Faltan variables: ADMIN_PASS, CLOUDINARY_CLOUD y CLOUDINARY_PRESET son obligatorias.');
  process.exit(1);
}

const isDataUri = (v) => typeof v === 'string' && v.startsWith('data:');

/** "Remera rayada bebe" -> "remera-rayada-bebe" (igual que src/app/core/utils/slugify.ts). */
function slugify(text) {
  const s = (text ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return s || 'producto';
}

async function login() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  if (!res.ok) throw new Error(`login fallo (${res.status})`);
  return (await res.json()).token;
}

async function uploadToCloudinary(dataUri, folder, publicId) {
  if (DRY_RUN) return `https://res.cloudinary.com/${CLOUD}/image/upload/${folder}/${publicId}`;
  const form = new FormData();
  form.append('file', dataUri);
  form.append('upload_preset', PRESET);
  form.append('folder', folder);
  form.append('public_id', publicId);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const b = await res.json().catch(() => null);
    throw new Error(b?.error?.message || `Cloudinary respondio ${res.status}`);
  }
  return (await res.json()).secure_url;
}

// --- Productos --------------------------------------------------------------

async function fetchAllProducts(auth) {
  const out = [];
  for (let page = 0; ; page++) {
    const res = await fetch(`${API_BASE}/api/admin/products?page=${page}&size=100`, { headers: auth });
    if (!res.ok) throw new Error(`GET products fallo (${res.status})`);
    const body = await res.json();
    out.push(...body.content);
    if (page >= body.totalPages - 1) break;
  }
  const arch = await fetch(`${API_BASE}/api/admin/products/archived`, { headers: auth });
  if (arch.ok) out.push(...(await arch.json()));
  return out;
}

function productRequest(p, images) {
  return {
    name: p.name, description: p.description, price: p.price, ageRange: p.ageRange,
    images, videoUrl: p.videoUrl ?? null, active: p.active, discontinued: p.discontinued,
    sizeScaleId: p.sizeScaleId ?? null, supplierId: p.supplierId ?? null,
    costPrice: p.costPrice ?? null, lowStockThreshold: p.lowStockThreshold ?? null,
    params: p.params ?? {}, sizeStocks: p.sizeStocks ?? [],
  };
}

async function migrateProducts(auth, stats) {
  const products = await fetchAllProducts(auth);
  console.log(`\nProductos: ${products.length} en total.`);
  for (const p of products) {
    const imgs = p.images ?? [];
    if (!imgs.some(isDataUri)) continue;
    const slug = slugify(p.name);
    const newImages = [];
    for (let i = 0; i < imgs.length; i++) {
      if (isDataUri(imgs[i])) {
        const url = await uploadToCloudinary(imgs[i], 'estilos-pequenos/productos', `${slug}-${i + 1}`);
        console.log(`  ${p.name}: foto ${i + 1} -> ${url}`);
        newImages.push(url);
        stats.uploaded++;
      } else {
        newImages.push(imgs[i]);
      }
    }
    stats.touched++;
    if (DRY_RUN) continue;
    const res = await fetch(`${API_BASE}/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(productRequest(p, newImages)),
    });
    if (!res.ok) console.error(`  ! no se pudo guardar ${p.name} (${res.status}): ${await res.text()}`);
  }
}

// --- Carrusel --------------------------------------------------------------

async function migrateHeroSlides(auth, stats) {
  const res = await fetch(`${API_BASE}/api/admin/hero-slides`, { headers: auth });
  if (!res.ok) {
    console.warn(`\nCarrusel: no se pudo leer (${res.status}), salteo.`);
    return;
  }
  const slides = await res.json();
  // Nota: las fotos viejas del carrusel se suben tal cual (no se recortan a 21:9;
  // la subida unsigned no permite transformaciones). Si alguna queda mal
  // encuadrada, volvé a subirla desde /admin/carrusel.
  console.log(`\nCarrusel: ${slides.length} fotos.`);
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    if (!isDataUri(s.imageUrl)) continue;
    const url = await uploadToCloudinary(s.imageUrl, 'estilos-pequenos/carrusel', `carrusel-${i + 1}`);
    console.log(`  carrusel ${i + 1} -> ${url}`);
    stats.uploaded++;
    stats.touched++;
    if (DRY_RUN) continue;
    const put = await fetch(`${API_BASE}/api/admin/hero-slides/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ imageUrl: url, alt: s.alt ?? '' }),
    });
    if (!put.ok) console.error(`  ! no se pudo guardar el slide ${s.id} (${put.status})`);
  }
}

// --- Settings (logo + QRs) -------------------------------------------------

const SETTINGS_IMAGES = {
  logoUrl: { folder: 'estilos-pequenos/logo', publicId: 'logo' },
  paymentQrTransferImage: { folder: 'estilos-pequenos/pagos', publicId: 'qr-transferencia' },
  paymentQrCardImage: { folder: 'estilos-pequenos/pagos', publicId: 'qr-tarjeta' },
};

async function migrateSettings(auth, stats) {
  const res = await fetch(`${API_BASE}/api/admin/settings`, { headers: auth });
  if (!res.ok) {
    console.warn(`\nSettings: no se pudo leer (${res.status}), salteo.`);
    return;
  }
  const s = await res.json();
  let changed = false;
  for (const [field, { folder, publicId }] of Object.entries(SETTINGS_IMAGES)) {
    if (!isDataUri(s[field])) continue;
    const url = await uploadToCloudinary(s[field], folder, publicId);
    console.log(`\nSettings: ${field} -> ${url}`);
    s[field] = url;
    changed = true;
    stats.uploaded++;
  }
  if (!changed) {
    console.log('\nSettings: sin imagenes data-URI.');
    return;
  }
  stats.touched++;
  if (DRY_RUN) return;
  const put = await fetch(`${API_BASE}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(s),
  });
  if (!put.ok) console.error(`  ! no se pudo guardar settings (${put.status}): ${await put.text()}`);
}

// --- Main ----------------------------------------------------------------

async function main() {
  console.log(`API: ${API_BASE}  -  Cloudinary: ${CLOUD}/${PRESET}${DRY_RUN ? '  -  DRY RUN' : ''}`);
  const token = await login();
  const auth = { Authorization: `Bearer ${token}` };
  const stats = { touched: 0, uploaded: 0 };

  await migrateProducts(auth, stats);
  await migrateHeroSlides(auth, stats);
  await migrateSettings(auth, stats);

  console.log(
    DRY_RUN
      ? `\nDRY RUN: ${stats.touched} registros con imagenes data-URI (${stats.uploaded} fotos).`
      : `\nListo: ${stats.touched} registros actualizados, ${stats.uploaded} fotos subidas a Cloudinary.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
