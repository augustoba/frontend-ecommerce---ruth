import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MotionTemplateBase } from './motion-template.base';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { HeroCarouselComponent } from '../../../shared/components/hero-carousel/hero-carousel.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { CldImagePipe } from '../../../shared/pipes/cld-image.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ScrollSceneDirective } from '../../../shared/directives/scroll-scene.directive';

/**
 * Diseño "Portal": se entra a la tienda atravesando una foto. El hero es una
 * escena clavada: una ventana en forma de arco muestra la foto y, al bajar, la
 * ventana crece hasta ocupar toda la pantalla (`clip-path` atado a `--s`, que
 * escribe `appScrollScene`) mientras la foto se va descubriendo entera. Recién ahí aparece el
 * resto de la tienda.
 *
 * Además, al tocar una prenda su foto "viaja" hasta la ficha del producto: es una
 * View Transition del router (sólo se activa con este diseño, ver
 * `app.config.ts`). `marcar` le pone el nombre de transición a la foto que se
 * tocó; del otro lado lo tiene la foto principal de la ficha
 * (`[data-layout="portal"] button[aria-label="Ampliar foto"] > img`, en
 * `styles.css`). En navegadores sin View Transitions simplemente no hay viaje.
 */
@Component({
  selector: 'app-template-portal',
  imports: [
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroCarouselComponent,
    SkeletonComponent,
    CldImagePipe,
    RevealDirective,
    ScrollSceneDirective,
  ],
  templateUrl: './template-portal.component.html',
  host: { class: 'tpl-portal block bg-brand-50 text-stone-900 [overflow-x:clip]' },
})
export class TemplatePortalComponent extends MotionTemplateBase {
  /** La foto del portal: la primera del carrusel o, si no hay, la de una prenda. */
  readonly fotoPortal = computed<string | null>(() => {
    const v = this.vm();
    return v.heroSlides()[0]?.imageUrl ?? v.filteredProducts()[0]?.imageUrl ?? null;
  });

  /**
   * Marca la foto de la prenda que se tocó como origen del viaje. El nombre de
   * transición tiene que ser único en la página, así que primero se le saca a
   * la que lo tuviera.
   */
  protected marcar(event: Event, host: HTMLElement): void {
    const card = (event.target as HTMLElement).closest('app-product-card');
    const img = card?.querySelector('img');
    if (!img) return;
    host.querySelectorAll<HTMLElement>('img[data-portal]').forEach((other) => {
      other.style.removeProperty('view-transition-name');
      other.removeAttribute('data-portal');
    });
    img.setAttribute('data-portal', '');
    img.style.setProperty('view-transition-name', 'portal-foto');
  }
}
