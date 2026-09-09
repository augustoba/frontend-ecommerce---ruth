import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  /** Texto del botón que confirma (default "Confirmar"). */
  confirmLabel?: string;
  cancelLabel?: string;
  /** true = botón de confirmar en rojo (acción destructiva). */
  danger?: boolean;
  /** Si se define, el modal muestra un input y `confirm()` resuelve con el texto (o null si cancela). */
  input?: { label?: string; placeholder?: string; type?: 'text' | 'password'; initial?: string };
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean | string | null) => void;
}

/**
 * Modal de confirmación propio (reemplaza `window.confirm` / `window.prompt`).
 * Se renderiza una vez con `<app-confirm-dialog>` en el root.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pendingSignal = signal<PendingConfirm | null>(null);
  readonly pending = this.pendingSignal.asReadonly();

  /** Pregunta sí/no. Resuelve true si el usuario confirma. */
  confirm(opts: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pendingSignal.set({ ...opts, resolve: (v) => resolve(v === true) });
    });
  }

  /** Pide un texto. Resuelve con el texto ingresado, o null si cancela. */
  prompt(opts: ConfirmOptions & { input: NonNullable<ConfirmOptions['input']> }): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      this.pendingSignal.set({
        ...opts,
        resolve: (v) => resolve(typeof v === 'string' ? v : null),
      });
    });
  }

  /** Lo llama el componente del modal. */
  resolve(value: boolean | string | null): void {
    const p = this.pendingSignal();
    if (p) {
      p.resolve(value);
      this.pendingSignal.set(null);
    }
  }
}
