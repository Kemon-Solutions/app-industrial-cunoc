import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { ISucursal } from '../../interfaces/auth';

type SucursalResponse = ApiResponse<ISucursal>;
type SucursalListResponse = ApiResponse<ISucursal[]>;

@Injectable({ providedIn: 'root' })
export class SucursalService extends HttpService {
  private readonly endpoint = '/auth/sucursal';

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  async getSucursales({ page = 1, limit = 10, busqueda = '' } = {}): Promise<SucursalListResponse | null> {
    try {
      const params: any = { page, limit, busqueda };
      const resp = await firstValueFrom(this.get<SucursalListResponse>(this.endpoint, params));
      return resp.body?.success ? resp.body : null;
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error al obtener sucursales', 'Error');
      return null;
    }
  }

  async getSucursal(id: string): Promise<SucursalResponse | null> {
    try {
      const resp = await firstValueFrom(this.get<SucursalResponse>(`${this.endpoint}/${id}`));
      return resp.body?.success ? resp.body : null;
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error al obtener sucursal', 'Error');
      return null;
    }
  }

  async createSucursal(sucursal: ISucursal): Promise<SucursalResponse | null> {
    try {
      const payload = {
        nombre: sucursal.nombre,
        municipio: sucursal.municipio,
        departamento: sucursal.departamento,
        telefono: sucursal.telefono || undefined,
        direccion: sucursal.direccion || undefined,
      };
      const resp = await firstValueFrom(this.post<SucursalResponse>(this.endpoint, payload));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error al crear sucursal', 'Error');
      return null;
    }
  }

  async updateSucursal(id: string, sucursal: ISucursal): Promise<SucursalResponse | null> {
    try {
      const payload = {
        nombre: sucursal.nombre,
        municipio: sucursal.municipio,
        departamento: sucursal.departamento,
        telefono: sucursal.telefono || undefined,
        direccion: sucursal.direccion || undefined,
      };
      const resp = await firstValueFrom(this.put<SucursalResponse>(`${this.endpoint}/${id}`, payload));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error al actualizar sucursal', 'Error');
      return null;
    }
  }

  async deleteSucursal(id: string): Promise<SucursalResponse | null> {
    try {
      const resp = await firstValueFrom(this.delete<SucursalResponse>(`${this.endpoint}/${id}`));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error al eliminar sucursal', 'Error');
      return null;
    }
  }
}
