import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IPermiso } from '../../interfaces/auth';

// Tipos específicos para las respuestas del servicio
type PermisoResponse = ApiResponse<IPermiso>;
type PermisoListResponse = ApiResponse<IPermiso[]>;

@Injectable({
  providedIn: 'root'
})
export class PermisoService extends HttpService {

  private readonly endpoints = {
    permisos: '/auth/permisos',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http); // pasa HttpClient al servicio base
  }

  async getPermisos({ page = 1, limit = 10, busqueda = '', all = false } = {}): Promise<PermisoListResponse | null> {
    try {
      let params: any = {
        page,
        limit,
        busqueda
      };
      if (all) {
        params = { ...params, todos: all };
      }
      const resp = await firstValueFrom(this.get<PermisoListResponse>(`${this.endpoints.permisos}`, params));
      if (resp.body?.success) {
        return resp.body;
      }

      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoService ~ getPermisos ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al obtener permisos', 'Error');
      return null;
    }
  }

  async getPermiso(permisoId: string): Promise<PermisoResponse | null> {
    try {
      const resp = await firstValueFrom(this.get<PermisoResponse>(`${this.endpoints.permisos}/${permisoId}`));
      if (resp.body?.success) {
        return resp.body;
      }

      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoService ~ getPermiso ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al obtener permiso', 'Error');
      return null;
    }
  }

  async createPermiso(createPermiso: Omit<IPermiso, 'permisoId'>): Promise<PermisoResponse | null> {
    try {
      const { codigo, modulo, accion, descripcion, activo } = createPermiso;
      const resp = await firstValueFrom(this.post<PermisoResponse>(`${this.endpoints.permisos}`, {
        codigo,
        modulo,
        accion,
        descripcion,
        activo,
      }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }

      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoService ~ createPermiso ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al crear permiso', 'Error');
      return null;
    }
  }

  async updatePermiso(updatePermiso: IPermiso): Promise<PermisoResponse | null> {
    try {
      const { permisoId, codigo, modulo, accion, descripcion, activo } = updatePermiso;
      const resp = await firstValueFrom(this.put<PermisoResponse>(`${this.endpoints.permisos}/${permisoId}`, {
        codigo,
        modulo,
        accion,
        descripcion,
        activo,
      }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }

      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoService ~ updatePermiso ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al actualizar permiso', 'Error');
      return null;
    }
  }

  async deletePermiso(permisoId: string): Promise<PermisoResponse | null> {
    try {
      const resp = await firstValueFrom(this.delete<PermisoResponse>(`${this.endpoints.permisos}/${permisoId}`));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }

      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoService ~ deletePermiso ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al eliminar permiso', 'Error');
      return null;
    }
  }

}
