import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import { ILabResumen } from '../../interfaces/laboratorio';

@Injectable({ providedIn: 'root' })
export class LabDashboardService extends HttpService {
  constructor(
    http: HttpClient,
    private readonly toastr: ToastrService,
  ) {
    super(http);
  }

  async resumen(): Promise<ILabResumen | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ApiResponse<ILabResumen>>('/laboratorio/dashboard/resumen'),
      );
      return resp.body?.success ? resp.body.data : null;
    } catch (error: unknown) {
      const mensaje =
        (error as { error?: { message?: string } })?.error?.message ??
        'Error al obtener el resumen del inventario';
      console.error('[laboratorio/dashboard]', error);
      this.toastr.error(mensaje, 'Error');
      return null;
    }
  }
}
