import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly logoSrc = inject(SettingsService).logoSrc;
  readonly dni = signal('');
  readonly password = signal('');
  readonly error = signal(false);
  readonly loading = signal(false);

  /** Segundos que faltan hasta poder reintentar (0 = no bloqueado). */
  readonly blockedSeconds = signal(0);
  readonly blockedMessage = signal('');
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly blocked = computed(() => this.blockedSeconds() > 0);
  readonly blockedLabel = computed(() => {
    const s = this.blockedSeconds();
    if (s <= 0) return '';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem ? `${m}m ${rem}s` : `${m}m`;
  });

  ngOnDestroy(): void {
    this.clearTimer();
  }

  submit(): void {
    if (this.loading() || this.blocked()) return;
    this.error.set(false);
    this.loading.set(true);
    this.authService.login(this.dni(), this.password()).subscribe((res) => {
      this.loading.set(false);
      if (res.ok) {
        this.router.navigate(['/admin/productos']);
      } else if (res.blocked) {
        this.blockedMessage.set(res.message ?? 'Demasiados intentos.');
        this.startCountdown(res.retryAfterSeconds ?? 900);
      } else {
        this.error.set(true);
      }
    });
  }

  private startCountdown(seconds: number): void {
    this.clearTimer();
    this.blockedSeconds.set(Math.ceil(seconds));
    this.timer = setInterval(() => {
      const next = this.blockedSeconds() - 1;
      this.blockedSeconds.set(Math.max(0, next));
      if (next <= 0) {
        this.clearTimer();
        this.blockedMessage.set('');
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
