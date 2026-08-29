import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';

export type ItemResponse<T> = ApiResponse<T>;
export type ListaResponse<T> = ApiResponse<T[]>;

/**
 * Servicio base para los catálogos del laboratorio.
 * Cada catálogo concreto solo define su endpoint y su etiqueta.
 */
@Injectable()
export abstract class LabBaseService<T extends { id?: string }> extends HttpService {
  /** Ruta del recurso, p. ej. '/laboratorio/categorias' */
  protected abstract readonly endpoint: string;
  /** Nombre legible usado en los mensajes de error, p. ej. 'categorías' */
  protected abstract readonly etiqueta: string;

  constructor(
    http: HttpClient,
    protected readonly toastr: ToastrService,
  ) {
    super(http);
  }

  async listar(
    filtros: Record<string, unknown> = {},
  ): Promise<ListaResponse<T> | null> {
    try {
      const params = this.limpiarParams({
        page: 1,
        limit: 10,
        ...filtros,
      });

      const resp = await firstValueFrom(
        this.get<ListaResponse<T>>(this.endpoint, params),
      );

      return resp.body?.success ? resp.body : null;
    } catch (error: unknown) {
      this.notificarError(error, `Error al obtener ${this.etiqueta}`);
      return null;
    }
  }

  /** Atajo para llenar combos: trae todos los registros sin paginar. */
  async listarTodos(
    filtros: Record<string, unknown> = {},
  ): Promise<T[]> {
    const resp = await this.listar({ ...filtros, todos: true, limit: 1000 });
    return resp?.data ?? [];
  }

  async obtener(id: string): Promise<ItemResponse<T> | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ItemResponse<T>>(`${this.endpoint}/${id}`),
      );
      return resp.body?.success ? resp.body : null;
    } catch (error: unknown) {
      this.notificarError(error, `Error al consultar ${this.etiqueta}`);
      return null;
    }
  }

  async crear(item: T): Promise<ItemResponse<T> | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ItemResponse<T>>(this.endpoint, this.limpiarCuerpo(item)),
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: unknown) {
      this.notificarError(error, `Error al crear ${this.etiqueta}`);
      return null;
    }
  }

  async actualizar(item: T): Promise<ItemResponse<T> | null> {
    try {
      const { id, ...datos } = item as T & { id?: string };
      const resp = await firstValueFrom(
        this.put<ItemResponse<T>>(
          `${this.endpoint}/${id}`,
          this.limpiarCuerpo(datos),
        ),
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: unknown) {
      this.notificarError(error, `Error al actualizar ${this.etiqueta}`);
      return null;
    }
  }

  async guardar(item: T): Promise<ItemResponse<T> | null> {
    return item.id ? this.actualizar(item) : this.crear(item);
  }

  async eliminar(id: string): Promise<ItemResponse<T> | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<ItemResponse<T>>(`${this.endpoint}/${id}`),
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: unknown) {
      this.notificarError(error, `Error al eliminar ${this.etiqueta}`);
      return null;
    }
  }

  /**
   * El API valida con `forbidNonWhitelisted`, por lo que nunca deben viajar
   * campos vacíos, relaciones cargadas ni metadatos de solo lectura.
   */
  protected limpiarCuerpo(datos: unknown): Record<string, unknown> {
    const omitir = new Set([
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'alerta',
      'categoria',
      'ubicacion',
      'area',
      'areas',
      'almacenamiento',
      'estado',
      'insumo',
      'movimientos',
    ]);

    const salida: Record<string, unknown> = {};
    Object.entries((datos ?? {}) as Record<string, unknown>).forEach(
      ([clave, valor]) => {
        if (omitir.has(clave)) return;
        if (valor === undefined || valor === null || valor === '') return;
        salida[clave] = typeof valor === 'string' ? valor.trim() : valor;
      },
    );
    return salida;
  }

  protected limpiarParams(
    params: Record<string, unknown>,
  ): Record<string, string | number | boolean> {
    const salida: Record<string, string | number | boolean> = {};
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined || valor === null || valor === '') return;
      salida[clave] = valor as string | number | boolean;
    });
    return salida;
  }

  protected notificarError(error: unknown, porDefecto: string): void {
    const mensaje =
      (error as { error?: { message?: string } })?.error?.message ?? porDefecto;
    // Cadena de formato constante: `this.endpoint` va como argumento, no
    // interpolado, para que un '%s' en su valor no pueda desplazar los
    // argumentos siguientes y falsear la linea de log.
    console.error('[%s]', this.endpoint, error);
    this.toastr.error(mensaje, 'Error');
  }
}
