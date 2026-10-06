import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { PromoLine } from '../catalog-view';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

/** Una cara del cubo: una foto del carrusel, una promo real o el logo. */
type Cara =
  | { kind: 'foto'; image: string; alt: string }
  | { kind: 'promo'; promo: PromoLine }
  | { kind: 'tienda' };

/**
 * Diseño "Cubo": un cubo que rota. El hero es un cubo 3D cuyas cuatro caras
 * muestran las fotos del carrusel y las promos vigentes; gira solo cada pocos
 * segundos, o con las flechas.
 *
 * `cara` no se reinicia: cuenta los giros, y el cubo rota siempre en el mismo
 * sentido (`rotateY(cara × -90deg)`), sin rebobinar. El tiempo entre giros lo
 * marca la animación CSS de la barrita (`animationend` pide el giro siguiente),
 * como en Historias: no hay `setInterval`. La barrita se recrea en cada giro
 * (`@for … track cara()`), que es lo que reinicia la animación. Se pausa con el
 * puntero encima, y con `prefers-reduced-motion` el cubo no gira solo.
 */
@Component({
  selector: 'app-template-cubo',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
  ],
  templateUrl: './template-cubo.component.html',
  host: { class: 'tpl-cubo block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplateCuboComponent extends MotionTemplateBase {
  /**
   * Las cuatro caras del cubo. Salen de las fotos del carrusel y de las promos
   * reales; si hay menos de cuatro se repiten en orden, y si no hay ninguna las
   * cuatro muestran el logo.
   */
  readonly caras = computed<Cara[]>(() => {
    const v = this.vm();
    const todas: Cara[] = [
      ...v.heroSlides().map((s): Cara => ({ kind: 'foto', image: s.imageUrl, alt: s.alt })),
      ...v.promos().map((p): Cara => ({ kind: 'promo', promo: p })),
    ];
    if (!todas.length) todas.push({ kind: 'tienda' });
    return [0, 1, 2, 3].map((i) => todas[i % todas.length]);
  });

  /** Si las cuatro caras son la misma, no tiene sentido girar. */
  readonly gira = computed(() => {
    const v = this.vm();
    return v.heroSlides().length + v.promos().length > 1;
  });

  /** Cantidad de giros hechos. Crece o baja sin tope. */
  protected readonly cara = signal(0);

  /** Qué cara quedó al frente (0..3), para marcarla y para `aria-hidden`. */
  readonly frente = computed(() => ((this.cara() % 4) + 4) % 4);

  protected girar(pasos: number): void {
    this.cara.update((c) => c + pasos);
  }
}
