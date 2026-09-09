import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Página pública "Cómo comprar" + Preguntas frecuentes. El contenido se edita
 * desde `/admin/config/ayuda`. Si no hay nada cargado, muestra un texto genérico.
 */
@Component({
  selector: 'app-como-comprar-page',
  imports: [RouterLink],
  templateUrl: './como-comprar-page.component.html',
})
export class ComoComprarPageComponent {
  private readonly settingsService = inject(SettingsService);

  readonly storeName = computed(() => this.settingsService.settings().storeName);
  readonly helpText = computed(() => this.settingsService.settings().helpText?.trim() || '');

  readonly faq = computed<FaqItem[]>(() => {
    const raw = this.settingsService.settings().faqText?.trim();
    if (!raw) return [];
    return raw
      .split(/\n\s*\n/)
      .map((block) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return null;
        return { question: lines[0], answer: lines.slice(1).join('\n') };
      })
      .filter((x): x is FaqItem => x !== null && !!x.answer);
  });

  readonly openIndex = signal<number | null>(0);
  toggle(i: number): void {
    this.openIndex.update((cur) => (cur === i ? null : i));
  }
}
