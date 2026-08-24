import { Routes } from '@angular/router';
import { AuthGuard } from '../services/auth/guards/auth-guard';
import { AccessGuard } from '../services/auth/guards/access-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./auth/pages/login/login')
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/pages/login/login'),
    },
    {
        path: 'test',
        loadComponent: () => import('./test/pages/test-page/test-page'),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/pages/dashboard-page/dashboard-page'),
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./shared/pages/home-page/home-page'),
            },
            {
                path: 'test',
                loadComponent: () => import('./test/pages/test-page/test-page'),
            },
            {
                path: 'mi-perfil',
                loadComponent: () => import('./auth/pages/mi-perfil-page/mi-perfil-page'),
            },
            /* ================= Laboratorio de Ingeniería Industrial =================
             * Para exigir permiso por rol (tabla Acceso) agregue en este bloque:
             *     canActivate: [AccessGuard],
             * después de ejecutar la sección 9 de database/lab-inventario.sql,
             * que registra los menús y accesos del módulo.
             * ====================================================================== */
            {
                path: 'laboratorio',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./laboratorio/pages/inventario-page/inventario-page'),
                    },
                    {
                        path: 'insumos',
                        loadComponent: () => import('./laboratorio/pages/insumos-page/insumos-page'),
                    },
                    {
                        path: 'movimientos',
                        loadComponent: () => import('./laboratorio/pages/movimientos-page/movimientos-page'),
                    },
                    {
                        path: 'categorias',
                        loadComponent: () => import('./laboratorio/pages/categorias-page/categorias-page'),
                    },
                    {
                        path: 'ubicaciones',
                        loadComponent: () => import('./laboratorio/pages/ubicaciones-page/ubicaciones-page'),
                    },
                    {
                        path: 'areas',
                        loadComponent: () => import('./laboratorio/pages/areas-page/areas-page'),
                    },
                    {
                        path: 'almacenamientos',
                        loadComponent: () => import('./laboratorio/pages/almacenamientos-page/almacenamientos-page'),
                    },
                    {
                        path: 'estados',
                        loadComponent: () => import('./laboratorio/pages/estados-page/estados-page'),
                    },
                ]
            },
            {
                path: 'config',
                canActivate: [AccessGuard],
                children: [
                    {
                        path: 'menus',
                        loadComponent: () => import('./auth/pages/menu-page/menu-page'),
                    },
                    {
                        path: 'accesos',
                        loadComponent: () => import('./auth/pages/acceso-page/acceso-page'),
                    },
                    {
                        path: 'general',
                        loadComponent: () => import('./auth/pages/configuraciones-page/configuraciones-page'),
                    },
                    {
                        path: 'roles',
                        loadComponent: () => import('./auth/pages/rol-page/rol-page'),
                    },
                    {
                        path: 'puestos',
                        loadComponent: () => import('./auth/pages/puesto-page/puesto-page'),
                    },
                    {
                        path: 'permisos',
                        loadComponent: () => import('./auth/pages/permiso-page/permiso-page'),
                    },
                    {
                        path: 'permisos-rol',
                        loadComponent: () => import('./auth/pages/permisos-rol-page/permisos-rol-page'),
                    },
                    {
                        path: 'sucursales',
                        loadComponent: () => import('./auth/pages/sucursal-page/sucursal-page'),
                    },
                    {
                        path: 'usuarios',
                        loadComponent: () => import('./auth/pages/usuarios-page/usuarios-page'),
                    },
                ]
            },
        ]
    },
    {
        path: '404',
        loadComponent: () => import('./shared/pages/404-page/404-page'),
    },
    {
        path: '401',
        loadComponent: () => import('./shared/pages/401-page/401-page'),
    },
    {
        path: '**',
        loadComponent: () => import('./shared/pages/404-page/404-page'),
    }
];
