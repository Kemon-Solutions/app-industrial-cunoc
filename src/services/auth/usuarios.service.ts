import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IUsuario } from '../../interfaces/auth';
import { StorageService, StorageUploadData } from '../storage.service';

type UsuarioResponse = ApiResponse<IUsuario>;
type UsuarioListResponse = ApiResponse<IUsuario[]>;

@Injectable({ providedIn: 'root' })
export class UsuariosService extends HttpService {
  private readonly endpoints = {
    usuarios: '/auth/usuarios',
    cambiarClave: '/auth/usuarios/cambiar-clave',
    resetClave: '/auth/usuarios/reset-clave',
  };

  constructor(http: HttpClient, private toastr: ToastrService, private storage: StorageService) {
    super(http);
  }

  async getUsuarios({ page = 1, limit = 10, busqueda = '', all = false , puestoNombre = ''} = {}): Promise<UsuarioListResponse | null> {
    try {
      let params: any = { page, limit, busqueda };
      if (all) params = { ...params, todos: all };
      if (puestoNombre) params = { ...params, puestoNombre}
      const resp = await firstValueFrom(this.get<UsuarioListResponse>(`${this.endpoints.usuarios}`, params));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ getUsuarios ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener usuarios', 'Error');
      return null;
    }
  }

  async getUsuario(usuarioId: string): Promise<UsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(this.get<UsuarioResponse>(`${this.endpoints.usuarios}/${usuarioId}`));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ getUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener usuario', 'Error');
      return null;
    }
  }

  async createUsuario(usuario: Omit<IUsuario, 'usuarioId' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<UsuarioResponse | null> {
    try {
      const { nombre1, nombre2, nombre3, apellido1, apellido2, apellido3, userName, correo, rolId, puestoId, sucursal_id, activo, clave } = usuario;
      const resp = await firstValueFrom(this.post<UsuarioResponse>(`${this.endpoints.usuarios}`, {
        nombre1, nombre2, nombre3, apellido1, apellido2, apellido3, userName, correo, rolId,
        ...(puestoId ? { puestoId } : {}),
        ...(sucursal_id ? { sucursal_id } : {}),
        activo, clave
      }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ createUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al crear usuario', 'Error');
      return null;
    }
  }

  async updateUsuario(usuario: IUsuario): Promise<UsuarioResponse | null> {
    try {
      const { usuarioId, nombre1, nombre2, nombre3, apellido1, apellido2, apellido3, userName, correo, rolId, puestoId, sucursal_id, activo } = usuario;
      const resp = await firstValueFrom(this.put<UsuarioResponse>(`${this.endpoints.usuarios}/${usuarioId}`, {
        nombre1, nombre2, nombre3, apellido1, apellido2, apellido3, userName, correo, rolId,
        puestoId: puestoId || undefined,
        sucursal_id: sucursal_id || undefined,
        activo,
      }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ updateUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al actualizar usuario', 'Error');
      return null;
    }
  }

  async deleteUsuario(usuarioId: string): Promise<UsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(this.delete<UsuarioResponse>(`${this.endpoints.usuarios}/${usuarioId}`));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ deleteUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al eliminar usuario', 'Error');
      return null;
    }
  }

  async cambiarClave(usuarioId: string, claveAnterior: string, claveNueva: string): Promise<ApiResponse | null> {
    try {
      const resp = await firstValueFrom(this.post<ApiResponse>(`${this.endpoints.cambiarClave}`, { usuarioId, claveAnterior, claveNueva }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Contraseña actualizada', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ cambiarClave ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al cambiar contraseña', 'Error');
      return null;
    }
  }

  async resetClave(usuarioId: string, claveNueva: string): Promise<ApiResponse | null> {
    try {
      const resp = await firstValueFrom(this.post<ApiResponse>(this.endpoints.resetClave, { usuarioId, claveNueva }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Contraseña restablecida', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ resetClave ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al restablecer contraseña', 'Error');
      return null;
    }
  }

  /**
   * Sube la imagen de perfil usando el nuevo endpoint POST /v1/storage/upload/perfil.
   * Delega a StorageService.uploadPerfil.
   */
  async uploadPerfil(file: File, userName: string): Promise<ApiResponse<StorageUploadData> | null> {
    return this.storage.uploadPerfil(file, userName);
  }
}
