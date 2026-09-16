import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { SettingsService } from '../../../core/services/settings.service';

/**
 * `navigator.share` NO alcanza sola para saber si estamos en un celular:
 * Windows 10/11 con Chrome/Edge moderno también la implementa (abre el
 * panel de "Compartir" del propio Windows) — probado en el navegador,
 * hace que el botón apareciera en una PC con Windows sin que hubiera
 * ninguna forma real de llegar a Instagram/Facebook desde ahí. Se suma
 * esta segunda señal (tipo de dispositivo) para no dar falsos positivos
 * en desktop. `userAgentData.mobile` es la señal moderna (Chrome/Edge en
 * Android e igual en Windows la reportan bien); si no existe (Safari),
 * se cae al string de user-agent de siempre.
 */
function isLikelyMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaData = (navigator as { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (uaData && typeof uaData.mobile === 'boolean') return uaData.mobile;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Botón "Publicar en redes" de un producto — usa la Web Share API nativa
 * del celular (compartir foto + texto a Facebook/Instagram con la app ya
 * instalada), no la API de Meta: no requiere aprobación de Meta ni guardar
 * ningún token, pero por eso mismo sólo funciona desde el celular que
 * tiene esas cuentas — de PC no hay forma de que ni Instagram ni (con
 * control total) Facebook acepten una publicación automática. El botón
 * queda SIEMPRE visible (a propósito, para que se descubra el feature
 * aunque hoy se esté en la PC) — si `!supported`, tocarlo avisa con un
 * toast en vez de intentar compartir. `compact` es para listados (un
 * link de texto, sin el selector de título/descripción ni la preview).
 */
@Component({
  selector: 'app-social-share-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './social-share-button.component.html',
})
export class SocialShareButtonComponent {
  private readonly toast = inject(ToastService);
  private readonly settingsService = inject(SettingsService);

  /** Módulo "Publicar en redes" — ver `Plan.enabledModules` / `com.saasweb.core.plan.Modules` en el backend. */
  readonly moduleEnabled = computed(() => this.settingsService.settings().socialShareEnabled);

  /** Todas las fotos del producto, portada primero — ver `Product.images`/`images()` del form. */
  readonly images = input<string[]>([]);
  readonly productName = input.required<string>();
  readonly productDescription = input<string>('');
  readonly compact = input(false);

  /**
   * URLs (no índices — el form puede reordenar/sacar fotos y así no queda
   * apuntando a la foto equivocada) elegidas para publicar. `undefined` =
   * "todavía no la tocó el usuario, usar la portada por defecto" — evita
   * tener que resetear el signal cada vez que cambia `images()`.
   */
  private readonly touchedSelection = signal<Set<string> | undefined>(undefined);
  readonly selectedImages = computed(() => {
    const all = this.images();
    const touched = this.touchedSelection();
    if (!touched) return all.slice(0, 1); // por defecto: sólo la portada
    const selected = all.filter((url) => touched.has(url));
    return selected.length ? selected : all.slice(0, 1); // nunca 0 fotos elegidas
  });

  isImageSelected(url: string): boolean {
    return this.selectedImages().includes(url);
  }

  toggleImage(url: string): void {
    const current = new Set(this.touchedSelection() ?? this.selectedImages());
    if (current.has(url)) {
      if (current.size > 1) current.delete(url); // siempre queda al menos 1 elegida
    } else {
      current.add(url);
    }
    this.touchedSelection.set(current);
  }

  readonly captionSource = signal<'name' | 'description' | 'custom'>('name');
  readonly customCaption = signal('');
  readonly captionText = computed(() => {
    const source = this.captionSource();
    const text =
      source === 'description'
        ? this.productDescription()
        : source === 'custom'
          ? this.customCaption()
          : this.productName();
    return text.trim();
  });

  /**
   * true sólo si además de existir la función, el dispositivo parece un
   * celular — ver el comentario de `isLikelyMobileDevice` arriba.
   */
  readonly supported =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function' && isLikelyMobileDevice();

  readonly sharing = signal(false);

  async share(): Promise<void> {
    if (!this.supported) {
      this.toast.error('Esta función sólo se puede usar abriendo el panel desde el celular que tiene Instagram/Facebook.');
      return;
    }
    const urls = this.selectedImages();
    if (!urls.length || this.sharing()) return;
    this.sharing.set(true);
    try {
      const files = await Promise.all(
        urls.map(async (url, i) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error('No se pudo descargar una de las fotos del producto.');
          const blob = await response.blob();
          return new File([blob], `producto-${i + 1}.jpg`, { type: blob.type || 'image/jpeg' });
        })
      );
      const shareData: ShareData = { title: this.productName(), text: this.captionText(), files };

      if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
        this.toast.error('Este navegador no puede compartir la foto directamente. Descargala y subila a mano.');
        return;
      }

      // `navigator.share` necesita la "activación de usuario" del click que
      // disparó este método — cada `await` previo puede consumirla, así que
      // se llama apenas está listo el archivo, ANTES de cualquier otra cosa
      // (ver `navigator.clipboard.writeText` más abajo, movido a después a
      // propósito por el mismo motivo).
      await navigator.share(shareData);

      // Mejor esfuerzo, ya sin apuro de activación: si Instagram no toma el
      // texto prellenado (limitación de esa app, no nuestra), al menos ya
      // quedó copiado para pegarlo.
      navigator.clipboard?.writeText(this.captionText()).catch(() => {});
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return; // el usuario cerró el panel de compartir
      this.toast.error(e instanceof Error ? e.message : 'No se pudo abrir el panel de compartir.');
    } finally {
      this.sharing.set(false);
    }
  }
}
