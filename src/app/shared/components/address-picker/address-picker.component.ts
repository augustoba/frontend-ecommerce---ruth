import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { GeoAddress, GeocodingService } from '../../../core/services/geocoding.service';

export interface PickedAddress {
  address: string;
  lat: number;
  lng: number;
}

/**
 * Busca una dirección de Tucumán (autocompletado con georef-ar) y deja
 * ajustar el pin exacto en un mapa. Emite `{ address, lat, lng }` o `null`.
 */
@Component({
  selector: 'app-address-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent {
  private readonly geocoding = inject(GeocodingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  readonly addressPicked = output<PickedAddress | null>();

  private readonly mapEl = viewChild<ElementRef<HTMLElement>>('mapEl');

  readonly query = signal('');
  readonly results = signal<GeoAddress[]>([]);
  readonly searching = signal(false);
  readonly selected = signal<GeoAddress | null>(null);
  /** Coordenadas del pin (arranca en las de la dirección, se mueve al arrastrar). */
  readonly pin = signal<{ lat: number; lng: number } | null>(null);

  readonly picked = computed<PickedAddress | null>(() => {
    const sel = this.selected();
    const p = this.pin();
    if (!sel || !p) return null;
    return { address: sel.label, lat: p.lat, lng: p.lng };
  });

  private readonly query$ = new Subject<string>();
  private map?: L.Map;
  private marker?: L.Marker;

  constructor() {
    this.query$
      .pipe(
        // 600ms: respeta el límite de ~1 req/s de Nominatim
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((q) => {
          this.searching.set(true);
          return this.geocoding.search(q);
        }),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        this.searching.set(false);
        this.results.set(res);
      });

    // (re)crear el mapa cuando hay una dirección elegida y el div ya existe
    effect(() => {
      const sel = this.selected();
      const el = this.mapEl()?.nativeElement;
      if (sel && el && !this.map) this.initMap(el, sel);
    });

    this.destroyRef.onDestroy(() => this.map?.remove());
  }

  private emit(): void {
    this.addressPicked.emit(this.picked());
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.query$.next(value.trim());
  }

  choose(addr: GeoAddress): void {
    this.selected.set(addr);
    this.pin.set({ lat: addr.lat, lng: addr.lng });
    this.results.set([]);
    this.query.set(addr.label);
    this.emit();
  }

  changeAddress(): void {
    this.map?.remove();
    this.map = undefined;
    this.marker = undefined;
    this.selected.set(null);
    this.pin.set(null);
    this.results.set([]);
    this.query.set('');
    this.emit();
  }

  private initMap(el: HTMLElement, addr: GeoAddress): void {
    const center: L.LatLngExpression = [addr.lat, addr.lng];
    this.map = L.map(el, { attributionControl: true }).setView(center, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    const icon = L.divIcon({
      className: '',
      html:
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="#ef6b2e" stroke="white" stroke-width="1.5">' +
        '<path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>',
      iconSize: [30, 30],
      iconAnchor: [15, 28],
    });
    this.marker = L.marker(center, { draggable: true, icon }).addTo(this.map);
    this.marker.on('dragend', () => {
      const p = this.marker!.getLatLng();
      this.zone.run(() => {
        this.pin.set({ lat: p.lat, lng: p.lng });
        this.emit();
      });
    });

    // el contenedor recién aparece: recalcular tamaño cuando ya está en pantalla
    this.map.whenReady(() => this.map?.invalidateSize());
    [50, 200, 500].forEach((ms) => setTimeout(() => this.map?.invalidateSize(), ms));
  }
}
