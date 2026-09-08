import { Injectable, signal } from '@angular/core';
import { heroBannerDataUri } from '../assets/clothing-icons';

const STORAGE_KEY = 'pp_hero_slides';

export interface HeroSlideRecord {
  id: string;
  imageUrl: string;
  alt: string;
}

const DEFAULT_SLIDES: HeroSlideRecord[] = [
  { id: crypto.randomUUID(), imageUrl: heroBannerDataUri('#fdf2f8'), alt: 'Nueva colección' },
  { id: crypto.randomUUID(), imageUrl: heroBannerDataUri('#fff7ed'), alt: 'Ropa de verano' },
  { id: crypto.randomUUID(), imageUrl: heroBannerDataUri('#eef9ff'), alt: 'Para nenes y nenas' },
  { id: crypto.randomUUID(), imageUrl: heroBannerDataUri('#f0fdf4'), alt: 'Comodidad y color' },
  { id: crypto.randomUUID(), imageUrl: heroBannerDataUri('#faf5ff'), alt: 'Envíos a todo el país' },
];

/**
 * Fotos del carrusel de bienvenida de la home. Se administran desde
 * /admin/carrusel y se guardan en localStorage (las fotos subidas por
 * archivo se guardan como data URL, ya redimensionadas — ver
 * `resizeImageFile`). Si no hay ninguna guardada, se usan las
 * ilustraciones de ejemplo por defecto.
 */
@Injectable({ providedIn: 'root' })
export class HeroSlidesService {
  private readonly slidesSignal = signal<HeroSlideRecord[]>(this.loadInitial());

  readonly slides = this.slidesSignal.asReadonly();

  /**
   * @returns false si no se pudo guardar (ej: se llenó el storage del
   * navegador por fotos muy pesadas) — en ese caso no se agrega la foto.
   */
  add(imageUrl: string, alt: string): boolean {
    const previous = this.slidesSignal();
    const slide: HeroSlideRecord = { id: crypto.randomUUID(), imageUrl, alt: alt.trim() || 'Foto de la tienda' };
    this.slidesSignal.set([...previous, slide]);
    const ok = this.persist();
    if (!ok) this.slidesSignal.set(previous);
    return ok;
  }

  updateAlt(id: string, alt: string): void {
    this.slidesSignal.update((list) => list.map((s) => (s.id === id ? { ...s, alt } : s)));
    this.persist();
  }

  remove(id: string): void {
    this.slidesSignal.update((list) => list.filter((s) => s.id !== id));
    this.persist();
  }

  /** Mueve una foto una posición hacia arriba (-1) o abajo (+1) en el orden del carrusel */
  move(id: string, direction: -1 | 1): void {
    this.slidesSignal.update((list) => {
      const index = list.findIndex((s) => s.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    this.persist();
  }

  resetToDefault(): void {
    this.slidesSignal.set(DEFAULT_SLIDES);
    this.persist();
  }

  private loadInitial(): HeroSlideRecord[] {
    if (typeof localStorage === 'undefined') return DEFAULT_SLIDES;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SLIDES;
      const parsed = JSON.parse(raw) as HeroSlideRecord[];
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SLIDES;
    } catch {
      return DEFAULT_SLIDES;
    }
  }

  /**
   * @returns false si no se pudo guardar (ej: se llenó el storage del
   * navegador por fotos muy pesadas), para que la UI avise al usuario.
   */
  private persist(): boolean {
    if (typeof localStorage === 'undefined') return true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.slidesSignal()));
      return true;
    } catch {
      return false;
    }
  }
}
