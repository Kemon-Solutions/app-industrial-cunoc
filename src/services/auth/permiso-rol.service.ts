import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IPermisoMatriz, IPermisoRol } from '../../interfaces/auth';

type MatrizListResponse = ApiResponse<IPermisoMatriz[]>;
type PermisoRolResponse = ApiResponse<IPermisoRol>;

@Injectable({
  providedIn: 'root'
})
export class PermisoRolService extends HttpService {

  private readonly endpoints = {
    permisosRol: '/auth/permisos/rol',
    matriz: '/auth/permisos/rol/matriz',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  /**
   * Matriz de permisos del rol: trae todos los permisos (filtrados/paginados)
   * marcando cada uno con `asignado` según los tenga el rol.
   * GET /auth/permisos/rol/matriz
   */
  async getMatriz(
    { rolId, codigo = '', modulo = '', accion = '', page = 1, limit = 10, all = false }:
      { rolId: string; codigo?: string; modulo?: string; accion?: string; page?: number; limit?: number; all?: boolean }
  ): Promise<MatrizListResponse | null> {
    try {
      let params: any = { rolId, page, limit };
      if (codigo) params.codigo = codigo;
      if (modulo) params.modulo = modulo;
      if (accion) params.accion = accion;
      if (all) params.todos = true;

      const resp = await firstValueFrom(this.get<MatrizListResponse>(`${this.endpoints.matriz}`, params));
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoRolService ~ getMatriz ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al obtener la matriz de permisos', 'Error');
      return null;
    }
  }

  /**
   * Asigna un permiso a un rol.
   * POST /auth/permisos/rol
   */
  async asignar(rolId: string, permisoId: string): Promise<PermisoRolResponse | null> {
    try {
      const resp = await firstValueFrom(this.post<PermisoRolResponse>(`${this.endpoints.permisosRol}`, {
        rolId,
        permisoId,
      }));
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoRolService ~ asignar ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al asignar el permiso al rol', 'Error');
      return null;
    }
  }

  /**
   * Retira un permiso de un rol.
   * DELETE /auth/permisos/rol/:rolId/:permisoId
   */
  async retirar(rolId: string, permisoId: string): Promise<PermisoRolResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<PermisoRolResponse>(`${this.endpoints.permisosRol}/${rolId}/${permisoId}`)
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoRolService ~ retirar ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al retirar el permiso del rol', 'Error');
      return null;
    }
  }

}
