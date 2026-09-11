import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { CldImagePipe } from '../../pipes/cld-image.pipe';

export interface HeroSlide {
  imageUrl: string;
  alt: string;
}

@Component({
  selector: 'app-hero-carousel',
  imports: [CldImagePipe],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css',
})
export class HeroCarouselComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly slides = input.required<HeroSlide[]>();
  readonly intervalMs = input(4500);

  private readonly rawIndex = signal(0);

  /** Índice actual, siempre dentro de rango aunque cambie la cantidad de slides (ej: se borran fotos desde el admin) */
  readonly currentIndex = computed(() => {
    const total = this.slides().length;
    if (total === 0) return 0;
    return ((this.rawIndex() % total) + total) % total;
  });

  ngOnInit(): void {
    const timer = setInterval(() => this.next(), this.intervalMs());
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  next(): void {
    if (this.slides().length === 0) return;
    this.rawIndex.update((i) => i + 1);
  }

  prev(): void {
    if (this.slides().length === 0) return;
    this.rawIndex.update((i) => i - 1);
  }

  goTo(index: number): void {
    this.rawIndex.set(index);
  }
}
