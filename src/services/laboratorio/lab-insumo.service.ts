import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ILabInsumo,
  ILabInsumoFiltros,
  ILabMovimiento,
} from '../../interfaces/laboratorio';
import { LabBaseService, ListaResponse } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabInsumoService extends LabBaseService<ILabInsumo> {
  protected readonly endpoint = '/laboratorio/insumos';
  protected readonly etiqueta = 'el inventario';

  /** Listado con los filtros propios del inventario. */
  async listarInventario(
    filtros: ILabInsumoFiltros = {},
  ): Promise<ListaResponse<ILabInsumo> | null> {
    return this.listar(filtros as Record<string, unknown>);
  }

  /** Kardex de un objeto. */
  async movimientos(
    insumoId: string,
    { page = 1, limit = 10 } = {},
  ): Promise<ListaResponse<ILabMovimiento> | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ListaResponse<ILabMovimiento>>(
          `${this.endpoint}/${insumoId}/movimientos`,
          { page, limit },
        ),
      );
      return resp.body?.success ? resp.body : null;
    } catch (error: unknown) {
      this.notificarError(error, 'Error al obtener el kardex del objeto');
      return null;
    }
  }
}
