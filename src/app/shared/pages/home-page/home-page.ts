import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { CustomIconComponent } from '../../components/custom-icon/custom-icon.component';

/** Tarjeta de acceso directo mostrada en la portada del panel. */
export interface AccesoDirecto {
  ruta: string;
  icono: string;
  titulo: string;
  descripcion: string;
}

/** Portada del panel: presenta el sistema y agrupa los accesos del laboratorio. */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CustomIconComponent],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {
  private authService = inject(AuthService);

  /** Debe coincidir con la versión declarada en package.json. */
  readonly version = '1.0.0';
  readonly anio = new Date().getFullYear();

  usuario = this.authService.user;
  esAdmin = computed(() => this.authService.user()?.rol?.esAdmin ?? false);

  /** Primer nombre y primer apellido; si faltan, el nombre de usuario. */
  nombre = computed(() => {
    const u = this.usuario();
    const partes = [u?.nombre1, u?.apellido1].filter(Boolean);
    return partes.join(' ') || u?.userName || '';
  });

  saludo = computed(() => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  /** Trabajo diario del laboratorio. */
  operacion: AccesoDirecto[] = [
    {
      ruta: '/dashboard/laboratorio',
      icono: 'layout-dashboard',
      titulo: 'Panel del inventario',
      descripcion: 'Indicadores de existencias, faltantes y últimos movimientos.',
    },
    {
      ruta: '/dashboard/laboratorio/insumos',
      icono: 'package',
      titulo: 'Insumos y equipo',
      descripcion: 'Catálogo completo de objetos, existencias y niveles mínimos.',
    },
    {
      ruta: '/dashboard/laboratorio/movimientos',
      icono: 'arrow-left-right',
      titulo: 'Movimientos',
      descripcion: 'Registro de entradas, salidas y traslados del inventario.',
    },
  ];

  /** Catálogos que alimentan al inventario. */
  catalogos: AccesoDirecto[] = [
    {
      ruta: '/dashboard/laboratorio/categorias',
      icono: 'tags',
      titulo: 'Categorías',
      descripcion: 'Clasificación de los insumos.',
    },
    {
      ruta: '/dashboard/laboratorio/ubicaciones',
      icono: 'map-pin',
      titulo: 'Ubicaciones',
      descripcion: 'Dónde se resguarda cada objeto.',
    },
    {
      ruta: '/dashboard/laboratorio/areas',
      icono: 'map',
      titulo: 'Áreas',
      descripcion: 'Zonas de trabajo del laboratorio.',
    },
    {
      ruta: '/dashboard/laboratorio/almacenamientos',
      icono: 'warehouse',
      titulo: 'Almacenamientos',
      descripcion: 'Estantes, gavetas y bodegas.',
    },
    {
      ruta: '/dashboard/laboratorio/estados',
      icono: 'badge-check',
      titulo: 'Estados',
      descripcion: 'Condición física del insumo.',
    },
  ];

  /** Configuración del sistema (solo administradores). */
  administracion: AccesoDirecto[] = [
    {
      ruta: '/dashboard/config/usuarios',
      icono: 'users',
      titulo: 'Usuarios',
      descripcion: 'Cuentas de acceso al sistema.',
    },
    {
      ruta: '/dashboard/config/roles',
      icono: 'shield',
      titulo: 'Roles',
      descripcion: 'Perfiles y privilegios.',
    },
    {
      ruta: '/dashboard/config/accesos',
      icono: 'key-round',
      titulo: 'Accesos',
      descripcion: 'Permisos por menú y acción.',
    },
    {
      ruta: '/dashboard/config/menus',
      icono: 'menu',
      titulo: 'Menús',
      descripcion: 'Opciones que muestra el panel.',
    },
    {
      ruta: '/dashboard/config/puestos',
      icono: 'briefcase',
      titulo: 'Puestos',
      descripcion: 'Cargos del personal.',
    },
    {
      ruta: '/dashboard/config/sucursales',
      icono: 'building-2',
      titulo: 'Sucursales',
      descripcion: 'Sedes registradas.',
    },
    {
      ruta: '/dashboard/config/permisos',
      icono: 'clipboard-list',
      titulo: 'Permisos',
      descripcion: 'Acciones disponibles del sistema.',
    },
    {
      ruta: '/dashboard/config/general',
      icono: 'settings',
      titulo: 'Configuración general',
      descripcion: 'Parámetros globales del sistema.',
    },
  ];
}
