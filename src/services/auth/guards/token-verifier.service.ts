import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

/** Cada cuánto se pregunta al API si el token sigue vivo (minutos → ms) */
const INTERVALO_MS = (environment.tokenCheckInterval || 5) * 60 * 1000;

/**
 * Vigila la vigencia del token mientras la aplicación está abierta.
 *
 * Tres disparadores:
 *  1. `verificarAhora()` que ejecuta el `AuthGuard` en cada carga/recarga de la página.
 *  2. Un intervalo de `environment.tokenCheckInterval` minutos.
 *  3. El regreso a la pestaña (`visibilitychange`), que cubre el caso de dejar
 *     la aplicación abierta y volver a ella al día siguiente: el intervalo pudo
 *     no dispararse si el equipo estuvo suspendido.
 */
@Injectable({ providedIn: 'root' })
export class TokenVerifierService {
  private readonly authService = inject(AuthService);

  private intervalId: any = null;
  private started = false;
  /** Evita verificaciones simultáneas (intervalo + regreso a la pestaña) */
  private verificando: Promise<boolean> | null = null;

  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void this.verificarAhora();
    }
  };

  /** Arranca la vigilancia periódica si aún no está activa */
  ensureStarted() {
    if (this.started) return;
    this.started = true;

    this.intervalId = setInterval(() => void this.verificarAhora(), INTERVALO_MS);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  /** Detiene la vigilancia periódica */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.started = false;
  }

  /**
   * Verifica el token ahora mismo.
   * @returns `true` si la sesión sigue siendo utilizable; `false` si se cerró.
   */
  async verificarAhora(): Promise<boolean> {
    // Si ya hay una verificación en curso, se reutiliza su resultado
    if (this.verificando) return this.verificando;

    this.verificando = this.ejecutarVerificacion().finally(() => {
      this.verificando = null;
    }) as Promise<boolean>;

    return this.verificando;
  }

  private async ejecutarVerificacion(): Promise<boolean> {
    const token = this.authService.token;

    // Sin token no hay sesión que vigilar; del flujo se encarga el AuthGuard
    if (!token) {
      this.stop();
      return false;
    }

    // 1. Comprobación local: si el `exp` ya pasó, no hace falta consultar al API
    if (this.authService.isTokenExpired(token)) {
      this.cerrarSesion();
      return false;
    }

    // 2. Comprobación contra el API (el token pudo revocarse o el usuario desactivarse)
    const { estado, mensaje } = await this.authService.verificarTokenEnServidor(token);

    if (estado === 'invalido') {
      this.cerrarSesion(mensaje);
      return false;
    }

    // 'indeterminado': el API no respondió. No se cierra la sesión por un
    // problema de red; se reintenta en la siguiente verificación.
    return true;
  }

  private cerrarSesion(mensaje?: string) {
    this.stop();
    this.authService.sesionExpirada(mensaje || AuthService.MSG_SESION_EXPIRADA);
  }
}
