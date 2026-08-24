/* ============================================================================
 * Inventario del Laboratorio de Ingeniería Industrial (CUNOC-USAC)
 * Interfaces espejo de las tablas lab_* del API.
 * ========================================================================== */

/** Registro común a todos los catálogos lab_*. */
export interface ILabBase {
  id?: string;
  nombre: string;
  descripcion?: string | null;
  activo?: number;
  created_at?: string;
  updated_at?: string | null;
}

/** lab_categoria — Clasificación del objeto. */
export interface ILabCategoria extends ILabBase {
  color?: string | null;
}

/** lab_ubicacion — Lugar físico principal. */
export interface ILabUbicacion extends ILabBase {
  responsable?: string | null;
  areas?: ILabArea[];
}

/** lab_area — Dirección o lado dentro de una ubicación. */
export interface ILabArea extends ILabBase {
  ubicacion_id: string;
  ubicacion?: ILabUbicacion | null;
}

export type TipoAlmacenamiento =
  | 'CAJA'
  | 'ORGANIZADOR'
  | 'ESTANTERIA'
  | 'MUEBLE'
  | 'BOTIQUIN'
  | 'SUELTO'
  | 'OTRO';

export const TIPOS_ALMACENAMIENTO: { valor: TipoAlmacenamiento; etiqueta: string }[] = [
  { valor: 'CAJA', etiqueta: 'Caja' },
  { valor: 'ORGANIZADOR', etiqueta: 'Organizador' },
  { valor: 'ESTANTERIA', etiqueta: 'Estantería' },
  { valor: 'MUEBLE', etiqueta: 'Mueble' },
  { valor: 'BOTIQUIN', etiqueta: 'Botiquín' },
  { valor: 'SUELTO', etiqueta: 'Suelto / en uso' },
  { valor: 'OTRO', etiqueta: 'Otro' },
];

/** lab_almacenamiento — Contenedor donde se guarda el objeto. */
export interface ILabAlmacenamiento extends ILabBase {
  codigo?: string | null;
  tipo?: TipoAlmacenamiento;
  ubicacion_id?: string | null;
  ubicacion?: ILabUbicacion | null;
}

/** lab_estado — Estado del objeto. */
export interface ILabEstado extends ILabBase {
  disponible?: number;
  color?: string | null;
  orden?: number;
}

/** Nivel de alerta calculado por el API: 1 crítico, 2 bajo, 3 normal. */
export type NivelAlerta = 1 | 2 | 3;

/** lab_insumo — Registro del inventario. */
export interface ILabInsumo {
  id?: string;
  codigo?: string;
  nombre: string;
  descripcion?: string | null;

  categoria_id?: string | null;
  ubicacion_id?: string | null;
  area_id?: string | null;
  almacenamiento_id?: string | null;
  estado_id?: string | null;

  categoria?: ILabCategoria | null;
  ubicacion?: ILabUbicacion | null;
  area?: ILabArea | null;
  almacenamiento?: ILabAlmacenamiento | null;
  estado?: ILabEstado | null;

  cantidad?: number;
  unidad?: string;
  stock_minimo?: number;
  stock_medio?: number;
  costo_unitario?: number;

  orden?: number | null;
  hoja_origen?: string | null;
  imagen_url?: string | null;
  observaciones?: string | null;
  activo?: number;

  /** Calculado por el API en las respuestas de listado y consulta */
  alerta?: NivelAlerta;

  created_at?: string;
  updated_at?: string | null;
}

export type TipoMovimiento =
  | 'ENTRADA'
  | 'SALIDA'
  | 'AJUSTE'
  | 'PRESTAMO'
  | 'DEVOLUCION'
  | 'BAJA';

export const TIPOS_MOVIMIENTO: {
  valor: TipoMovimiento;
  etiqueta: string;
  efecto: 'suma' | 'resta' | 'fija';
}[] = [
  { valor: 'ENTRADA', etiqueta: 'Entrada', efecto: 'suma' },
  { valor: 'DEVOLUCION', etiqueta: 'Devolución', efecto: 'suma' },
  { valor: 'SALIDA', etiqueta: 'Salida', efecto: 'resta' },
  { valor: 'PRESTAMO', etiqueta: 'Préstamo', efecto: 'resta' },
  { valor: 'BAJA', etiqueta: 'Baja', efecto: 'resta' },
  { valor: 'AJUSTE', etiqueta: 'Ajuste de inventario', efecto: 'fija' },
];

/** lab_movimiento — Kardex. */
export interface ILabMovimiento {
  id?: string;
  insumo_id: string;
  insumo?: ILabInsumo | null;
  tipo: TipoMovimiento;
  cantidad: number;
  cantidad_anterior?: number;
  cantidad_nueva?: number;
  motivo?: string | null;
  responsable?: string | null;
  usuario_id?: string | null;
  fecha_movimiento?: string;
}

/** Respuesta de /laboratorio/dashboard/resumen */
export interface ILabResumen {
  total_registros: number;
  total_piezas: number;
  criticos: number;
  bajos: number;
  normales: number;
  por_categoria: { nombre: string; registros: number; piezas: number }[];
  por_ubicacion: { nombre: string; registros: number; piezas: number }[];
  ultimos_movimientos: ILabMovimiento[];
}

/** Filtros del listado del inventario. */
export interface ILabInsumoFiltros {
  page?: number;
  limit?: number;
  busqueda?: string;
  todos?: boolean;
  categoriaId?: string;
  ubicacionId?: string;
  areaId?: string;
  almacenamientoId?: string;
  estadoId?: string;
  alerta?: number;
}
