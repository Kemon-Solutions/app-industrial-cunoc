import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ILabMovimiento } from '../../interfaces/laboratorio';
import { ItemResponse, LabBaseService } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabMovimientoService extends LabBaseService<ILabMovimiento & { id?: string }> {
  protected readonly endpoint = '/laboratorio/movimientos';
  protected readonly etiqueta = 'los movimientos';

  /** Registra un movimiento y devuelve el insumo ya actualizado. */
  async registrar(movimiento: {
    insumo_id: string;
    tipo: string;
    cantidad: number;
    motivo?: string;
    responsable?: string;
  }): Promise<ItemResponse<{ movimiento: ILabMovimiento; insumo: unknown }> | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ItemResponse<{ movimiento: ILabMovimiento; insumo: unknown }>>(
          this.endpoint,
          this.limpiarCuerpo(movimiento),
        ),
      );

      if (resp.body?.success) {
        const alerta = (resp.body.metadata as unknown as { alerta?: number })?.alerta;
        const mensaje =
          (resp.body.metadata as unknown as { alerta_mensaje?: string })
            ?.alerta_mensaje ?? resp.body.message;

        if (alerta === 1) this.toastr.error(mensaje, 'Existencia crítica');
        else if (alerta === 2) this.toastr.warning(mensaje, 'Existencia baja');
        else this.toastr.success(resp.body.message, 'Éxito');

        return resp.body;
      }
      return null;
    } catch (error: unknown) {
      this.notificarError(error, 'Error al registrar el movimiento');
      return null;
    }
  }
}
