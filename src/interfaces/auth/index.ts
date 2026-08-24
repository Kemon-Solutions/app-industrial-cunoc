export interface IPuesto {
    id?: string;        // UUID del puesto (el API lo devuelve como `id`)
    nombre: string;    // Nombre del puesto
    // Relaciones
    usuarios?: IUsuario[];  // Usuarios asociados al puesto
}

export interface ISucursal {
  id?: string;
  nombre: string;
  municipio: string;
  departamento: string;
  telefono?: string;
  direccion?: string;
  central?: boolean;
  created_at?: Date;
}

export interface IUsuario {
  id?: string;                    // UUID del usuario (el API lo devuelve como `id`)
  nombreCompleto: string;        // Nombre completo concatenado
  nombre1: string;               // Primer nombre
  nombre2?: string | null;       // Segundo nombre
  nombre3?: string | null;       // Tercer nombre
  apellido1: string;             // Primer apellido
  apellido2?: string | null;     // Segundo apellido
  apellido3?: string | null;     // Tercer apellido
  userName: string;              // Nombre de usuario (único)
  clave: string;                 // Contraseña (hash)
  correo: string;                // Correo electrónico (único)
  fotoUrl?: string | null;       // URL de la foto
  lastPasswordUpdate: Date;      // Última actualización de contraseña
  huella?: string | null;        // Huella digital (en base64 u otro formato)
  activo: boolean;               // Estado del usuario (activo/inactivo)
  rolId: string;                 // ID del rol asignado
  puestoId?: string | null;      // ID del puesto (si aplica)
  sucursalId?: string | null;    // ID de la sucursal (así lo espera el API)

  // Relaciones
  rol?: IRol;                    // Objeto del rol relacionado
  puesto?: IPuesto;              // Objeto del puesto relacionado
  sucursal?: ISucursal;          // Objeto de la sucursal relacionada

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface IAcceso {
  id?: string;                    // UUID del acceso (el API lo devuelve como `id`)
  ordenMenu: number;             // Orden del menú
  showApp: boolean;              // Si se muestra en la app móvil
  showWeb: boolean;              // Si se muestra en la web
  activo: boolean;               // Estado del acceso

  mainMenuId?: string | null;    // ID del menú principal (si aplica)
  menuId: string;                // ID del menú relacionado
  rolId: string;                 // ID del rol relacionado

  // Relaciones (opcionalmente incluidas en consultas)
  menu: IMenu;
  subMenus?: ISubmenu[];
  rol?: IRol;

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface ISubmenu {
  id?: string;                    // UUID del acceso (el API lo devuelve como `id`)
  ordenMenu: number;             // Orden del menú
  showApp: boolean;              // Si se muestra en la app móvil
  showWeb: boolean;              // Si se muestra en la web
  activo: boolean;               // Estado del acceso

  mainMenuId?: string | null;    // ID del menú principal (si aplica)
  menuId: string;                // ID del menú relacionado
  rolId: string;                 // ID del rol relacionado

  // Relaciones (opcionalmente incluidas en consultas)
  menu: IMenu;

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}


export interface IRol {
    id?: string;             // UUID del rol (el API lo devuelve como `id`)
    nombre: string;         // Nombre del rol
    invitado: boolean;      // Indica si es rol invitado
    activo: boolean;        // Indica si está activo
    esAdmin: boolean;       // Indica si tiene privilegios de administrador

    // Relaciones
    usuarios?: IUsuario[];  // Usuarios asociados al rol
    accesos?: IAcceso[];    // Accesos asociados al rol

    // Metadatos de auditoría
    created_at: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
}

export interface ILogin {
  user: IUsuario,
  token: string
}

/**
 * Permiso por código. Habilita una acción concreta dentro de un módulo.
 * Se asignan a roles (IPermisoRol) y, como excepción, a usuarios (IPermisoUsuario).
 */
export interface IPermiso {
  id?: string;                   // UUID del permiso (el API lo devuelve como `id`)
  codigo: string;                // Código único (ej. "USR_CREAR")
  modulo: string;                // Módulo al que pertenece (ej. "usuarios")
  accion: string;                // Acción que habilita (ej. "crear")
  descripcion?: string | null;   // Descripción opcional
  activo: boolean;               // Estado del permiso

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
}

/** Asignación de un permiso a un rol. */
export interface IPermisoRol {
  rolId: string;
  permisoId: string;
  permiso?: IPermiso;            // Relación incluida en los listados
}

/**
 * Fila de la matriz de permisos de un rol (GET /auth/permisos/rol/matriz).
 * Es un permiso completo más el flag `asignado` que indica si el rol lo tiene.
 */
export interface IPermisoMatriz extends IPermiso {
  asignado: boolean;
}

/**
 * Asignación de un permiso a un usuario.
 * `permitido` permite conceder (true) o denegar explícitamente (false) un permiso
 * a un usuario aunque su rol lo tenga (excepciones por usuario).
 */
export interface IPermisoUsuario {
  usuarioId: string;
  permisoId: string;
  permitido: boolean;
  permiso?: IPermiso;            // Relación incluida en los listados
}


export interface IMenu {
  id?: string;            // UUID del menú (el API lo devuelve como `id`)
  label: string;          // Nombre o etiqueta del menú
  descripcion: string;    // Descripción del menú
  pathApp: string;        // Ruta de la aplicación móvil o cliente
  pathWeb: string;        // Ruta de la aplicación web
  icono: string;          // Nombre del ícono asociado
  color: string;          // Color del ícono o del menú
  principal: boolean;     // Indica si es un menú principal
  activo: boolean;        // Indica si el menú está activo

  // Relaciones
  accesos?: IAcceso[];    // Lista de accesos asociados al menú

  // Metadatos de auditoría
  created_at: Date;       // Fecha de creación
  updated_at?: Date | null; // Fecha de última actualización
  deleted_at?: Date | null; // Fecha de eliminación (soft delete)
}

export enum TipoConfiguracion {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
}
/**
 * Representa una configuración del sistema.
 */
export interface IConfig {
  id?: string;                  // UUID de la configuración (el API lo devuelve como `id`)
  llave: string;                // Clave identificadora de la configuración (ej. "TOKEN_EXPIRATION")
  valor: string;                // Valor de la configuración (almacenado como texto)
  tipo: TipoConfiguracion;      // Tipo de dato (string, number, boolean, array, object)
  descripcion?: string | null;  // Descripción opcional sobre el uso de la configuración
  activo: boolean;              // Indica si la configuración está activa

  // Metadatos de auditoría
  created_at: Date;             // Fecha de creación
  updated_at?: Date | null;     // Fecha de última actualización
  deleted_at?: Date | null;     // Fecha de eliminación lógica
}
