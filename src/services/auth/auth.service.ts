import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IAcceso, ILogin, IUsuario } from '../../interfaces/auth';
import { environment } from '../../environments/environment';

type LoginResponse = ApiResponse<ILogin>;

/**
 * Códigos de error de autenticación que devuelve el API
 * (ver `api-prototipo/src/common/exceptions/unauthorized.exception.ts`).
 */
export const AUTH_ERROR = {
  TOKEN_NO_ENVIADO: 'TOKEN_NO_ENVIADO',
  TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
  TOKEN_INVALIDO: 'TOKEN_INVALIDO',
  API_KEY_NO_ENVIADA: 'API_KEY_NO_ENVIADA',
  API_KEY_INVALIDA: 'API_KEY_INVALIDA',
  SERVICIO_NO_DISPONIBLE: 'SERVICIO_NO_DISPONIBLE',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR)[keyof typeof AUTH_ERROR];

/**
 * Resultado de consultar al API si el token sigue vivo.
 * - `valido`        el API confirmó la sesión
 * - `invalido`      el API respondió 401: hay que cerrar sesión
 * - `indeterminado` no se pudo preguntar (sin red, API caído, 429...): NO se
 *                   cierra la sesión para no expulsar al usuario por un
 *                   problema de conectividad
 */
export interface VerificacionToken {
  estado: 'valido' | 'invalido' | 'indeterminado';
  mensaje?: string;
  codigo?: AuthErrorCode | string;
}

@Injectable({ providedIn: 'root' })
export class AuthService extends HttpService {
  private readonly endpoints = {
    login: '/auth/login',
    verifyToken: '/auth/verify-token',
    usuarios: '/auth/usuarios',
  };

  // Signal para el estado del usuario
  private _user = signal<IUsuario>(this.loadUserFromStorage());
  private _accesos = signal<IAcceso[]>(this.loadAccesosFromStorage());
  private _accesosLoading = signal<boolean>(false);
  public user = this._user.asReadonly();
  public accesos = this._accesos.asReadonly();
  public accesosLoading = this._accesosLoading.asReadonly();

  /** Mensaje por defecto cuando el API no envía uno propio */
  static readonly MSG_SESION_EXPIRADA =
    'Su sesión ha expirado. Por favor inicie sesión nuevamente para continuar.';

  /** Evita toasts y redirecciones duplicadas cuando varias peticiones fallan a la vez */
  private cerrandoSesion = false;

  private readonly router = inject(Router);

  private httpClient: HttpClient;
  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
    this.httpClient = http;
  }

  /** Cargar usuario desde localStorage (si existe) */
  private loadUserFromStorage(): IUsuario {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed: IUsuario = JSON.parse(user);
      // Si existe una foto cacheada en localStorage, úsala
      if (parsed?.userName) {
        const cached = localStorage.getItem(`fotoPerfil:${parsed.userName}`);
        if (cached && cached.startsWith('data:')) {
          parsed.fotoUrl = cached as any;
        }
      }
      return parsed;
    }

    // Usuario "vacío"
    return {
      usuarioId: '',
      nombreCompleto: 'Sin autenticar',
      userName: '',
      nombre1: '',
      nombre2: '',
      nombre3: '',
      apellido1: '',
      apellido2: '',
      apellido3: '',
      clave: '',
      correo: '',
      fotoUrl: '',
      lastPasswordUpdate: new Date(),
      huella: null,
      activo: false,
      rolId: '',
      puestoId: null,
      // metodoId: null,
      created_at: new Date(),
      rol: {
        rolId: '',
        nombre: 'Sin autenticar',
        activo: false,
        invitado: false,
        esAdmin: false,
        created_at: new Date()
      }
    };
  }

  private loadAccesosFromStorage(): IAcceso[] {
    const accesos = localStorage.getItem('accesos');
    if (accesos) return JSON.parse(accesos);

    // Accesos "vacíos"
    return [];
  }


  /** Obtener snapshot del usuario actual */
  getUserStorage(): IUsuario {
    return this._user();
  }

  getAccesosStorage(): IAcceso[] {
    return this._accesos();
  }

  /** Actualizar usuario en memoria y storage */
  updateUser(user: IUsuario) {
    this._user.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /** Actualizar accesos en memoria y storage */
  updateAccesos(accesos: IAcceso[]) {
    this._accesos.set(accesos || []);
    localStorage.setItem('accesos', JSON.stringify(accesos || []));
  }

  /** Cambiar estado de carga de accesos */
  setAccesosLoading(loading: boolean) {
    this._accesosLoading.set(loading);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decodifica el payload de un JWT sin validar la firma.
   * Solo sirve para leer `exp`; la validación real la hace el API.
   */
  private decodificarToken(token: string): { exp?: number } | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const relleno = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : '';
      const json = decodeURIComponent(
        atob(base64 + relleno)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * Comprueba localmente (sin llamar al API) si el token ya venció.
   * Un token corrupto o ilegible se considera vencido.
   */
  isTokenExpired(token: string | null = this.token): boolean {
    if (!token) return true;

    const payload = this.decodificarToken(token);
    if (!payload) return true;

    // Si el token no declara `exp`, no se puede afirmar que venció: decide el API
    if (!payload.exp) return false;

    const ahora = Math.floor(Date.now() / 1000);
    return payload.exp <= ahora + 5; // 5 s de margen por desfase de reloj
  }

  /**
   * Hay sesión sólo si existe token y además no está vencido, por lo que al
   * recargar la página una sesión caducada nunca llega a renderizar la pantalla.
   */
  isAuthenticated(): boolean {
    const token = this.token;
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Cierra la sesión por token vencido/inválido y envía al login.
   * Es idempotente: varias peticiones que fallen con 401 a la vez producen
   * un solo toast y una sola redirección.
   */
  sesionExpirada(mensaje: string = AuthService.MSG_SESION_EXPIRADA) {
    if (this.cerrandoSesion) return;
    this.cerrandoSesion = true;

    this.logout(mensaje || AuthService.MSG_SESION_EXPIRADA);
    this.router.navigate(['/login']);
  }

  async login(data: { userName: string; password: string }): Promise<LoginResponse | null> {
    // Nuevo intento de sesión: se libera el candado de `sesionExpirada`
    this.cerrandoSesion = false;
    try {
      const resp = await firstValueFrom(this.post<LoginResponse>(this.endpoints.login, data));
      if (resp.body?.success) {
        // Guardar el token ANTES de descargar la foto: fetchAndApplyUserPhoto
        // lee el token desde localStorage para enviar el header Authorization.
        // Si no se guarda primero, la petición de la foto sale sin token (401).
        if (resp.body.data?.token) {
          localStorage.setItem('token', resp.body.data.token);
        }
        if (resp.body.data.user) {
          // Guardar usuario y, si tiene foto, descargarla y cachearla en localStorage
          const user = resp.body.data.user;
          await this.fetchAndApplyUserPhoto(user);
        }
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ UsuariosService ~ login ~ error:", error)
      this.toastr.error(error?.error?.message || 'Error al iniciar sesión', 'Error');
      return null;
    }
  }

  /**
   * Si el usuario posee fotoUrl, intenta descargarla desde el backend,
   * la convierte a dataURL y la almacena en localStorage bajo clave `fotoPerfil:<userName>`.
   * También actualiza el usuario en memoria con la dataURL para uso inmediato en la UI.
   */
  async fetchAndApplyUserPhoto(user: IUsuario): Promise<IUsuario> {
    try {
      if (!user?.fotoUrl) {
        this.updateUser(user);
        return user;
      }
      // Si ya es un dataURL, solo persistimos
      if (typeof user.fotoUrl === 'string' && user.fotoUrl.startsWith('data:')) {
        this.updateUser(user);
        return user;
      }

      const fotoPath = String(user.fotoUrl || '').trim();
      if (!fotoPath) {
        this.updateUser(user);
        return user;
      }

      // Construir URL para obtener la foto:
      // - Si es absoluta (http/https), usarla tal cual
      // - Si NO tiene '/', asumir que es el filename y pegar a /auth/usuarios/perfil/:fileName
      // - Si tiene '/', tratarlo como ruta relativa al apiPath
      let url: string;
      const isAbsolute = /^https?:\/\//i.test(fotoPath);
      if (isAbsolute) {
        url = fotoPath;
      } else if (!fotoPath.includes('/')) {
        url = `${environment.apiPath}/storage/perfil/${encodeURIComponent(fotoPath)}`;
      } else {
        const relative = fotoPath.startsWith('/') ? fotoPath : `/${fotoPath}`;
        url = `${environment.apiPath}${relative}`;
      }

      // Preparar headers con token; NO forzar Content-Type
      const token = localStorage.getItem('token') || '';
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

      const blob = await firstValueFrom(
        this.httpClient.get(url, { headers, responseType: 'blob' as const })
      );

      const dataUrl = await this.blobToDataURL(blob);
      if (user.userName) {
        localStorage.setItem(`fotoPerfil:${user.userName}`, dataUrl);
      }
      const updated = { ...user, fotoUrl: dataUrl } as IUsuario;
      this.updateUser(updated);
      return updated;
    } catch (e) {
      // Si falla la descarga, dejamos el user como está
      this.updateUser(user);
      return user;
    }
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Pregunta al API si el token sigue vivo.
   * Distingue "el API dijo que no" (401) de "no se pudo preguntar" (sin red,
   * API caído, 429), para no cerrar la sesión por un fallo de conectividad.
   */
  async verificarTokenEnServidor(token: string): Promise<VerificacionToken> {
    try {
      const resp = await firstValueFrom(
        this.post<ApiResponse>(this.endpoints.verifyToken, { token })
      );

      return resp.body?.success ? { estado: 'valido' } : { estado: 'invalido' };
    } catch (error: any) {
      if (error?.status === 401) {
        // El body trae { message, error } gracias a AuthUnauthorizedException
        return {
          estado: 'invalido',
          mensaje: error?.error?.message,
          codigo: error?.error?.error,
        };
      }

      return { estado: 'indeterminado' };
    }
  }

  /** Compatibilidad: `true` sólo si el API confirmó que el token es válido */
  async verifyToken(token: string): Promise<boolean> {
    const { estado } = await this.verificarTokenEnServidor(token);
    return estado === 'valido';
  }

  logout(message: string = '') {
    if (message) {
      this.toastr.error(message, 'Sesión cerrada');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario');
    localStorage.removeItem('accesos');

    // Resetear signal del usuario
    this._user.set(this.loadUserFromStorage());
    this._accesos.set(this.loadAccesosFromStorage());
    this._accesosLoading.set(false);
  }
}
