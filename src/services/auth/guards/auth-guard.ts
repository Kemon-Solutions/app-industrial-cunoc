import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';
import { TokenVerifierService } from './token-verifier.service';

/**
 * Protege las rutas privadas.
 *
 * En la PRIMERA activación tras cargar/recargar la página se confirma el token
 * contra el API antes de renderizar la vista: así, si se vuelve a la aplicación
 * al día siguiente con la pestaña abierta o con la sesión guardada, no se llega
 * a mostrar la pantalla anterior con un token muerto.
 *
 * En las navegaciones siguientes basta con la comprobación local de `exp`
 * (instantánea) más la vigilancia periódica del `TokenVerifierService` y el
 * `authInterceptor`, que reaccionan a cualquier 401 del API.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenVerifier = inject(TokenVerifierService);

  /** Ya se confirmó el token con el API en esta carga de la página */
  private verificadoConElApi = false;

  async canActivate(): Promise<boolean | UrlTree> {
    const token = this.authService.token;

    // Sin token: al login, sin nada que limpiar
    if (!token) return this.router.createUrlTree(['/login']);

    // Token vencido según su propio `exp`: se limpia la sesión antes de salir
    if (this.authService.isTokenExpired(token)) {
      this.authService.logout(AuthService.MSG_SESION_EXPIRADA);
      return this.router.createUrlTree(['/login']);
    }

    // Primera ruta protegida tras recargar: se confirma con el API
    if (!this.verificadoConElApi) {
      const sesionViva = await this.tokenVerifier.verificarAhora();
      this.verificadoConElApi = true;

      // `verificarAhora` ya cerró la sesión y notificó al usuario
      if (!sesionViva) return this.router.createUrlTree(['/login']);
    }

    // Vigilancia periódica mientras la aplicación siga abierta
    this.tokenVerifier.ensureStarted();
    return true;
  }
}
