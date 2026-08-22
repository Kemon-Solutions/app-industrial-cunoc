import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

/**
 * Endpoints públicos: un 401 aquí es un problema de credenciales o lo maneja
 * quien hizo la llamada (el TokenVerifierService), no una sesión que expira.
 */
const RUTAS_PUBLICAS = ['/auth/login', '/auth/verify-token'];

/**
 * Intercepta las respuestas del API y, ante un 401 (token vencido, revocado o
 * usuario desactivado), cierra la sesión y redirige al login mostrando el
 * mensaje en español que envía el API (`AuthUnauthorizedException`).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esRutaPublica = RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta));

      // Sin token en storage no hay sesión que cerrar (p. ej. 401 estando ya en el login)
      if (error.status === 401 && !esRutaPublica && authService.token) {
        // El body puede ser un Blob (descargas), por eso el acceso defensivo al mensaje
        const mensaje =
          typeof error.error === 'object' && error.error !== null
            ? error.error.message
            : undefined;

        authService.sesionExpirada(mensaje);
      }

      return throwError(() => error);
    })
  );
};
