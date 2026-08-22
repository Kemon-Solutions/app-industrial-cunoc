import { Routes } from '@angular/router';
import { AuthGuard } from '../services/auth/guards/auth-guard';
import { AccessGuard } from '../services/auth/guards/access-guard';
// import { AccessGuard } from './auth/guards/access-guard';

export const routes: Routes = [
    {
        path: '',
        // loadComponent: () => import('./shared/pages/home-page/home-page'),
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
            //     children: [
            //         {
            //             path: '',
            //             loadComponent: () => import('./configuracion/pages/config-page/config-page'),
            //             // canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'config',
            //             loadComponent: () => import('./configuracion/pages/configuraciones-page/configuraciones-page.component'),
            //             canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'user',
            //             loadComponent: () => import('./configuracion/pages/user-page/user-page'),
            //             canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'users',
            //             loadComponent: () => import('./configuracion/pages/users-page/users-page'),
            //             canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'roles',
            //             loadComponent: () => import('./configuracion/pages/rol-page/rol-page'),
            //             canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'metodos',
            //             loadComponent: () => import('./configuracion/pages/metodos-auth-page/metodos-auth-page.component'),
            //             canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'menus',
            //             loadComponent: () => import('./configuracion/pages/menu-page/menu-page.component'),
            //             canActivate: [AccessGuard]
            //         },
            //         {
            //             path: 'accesos',
            //             loadComponent: () => import('./configuracion/pages/acceso-page/acceso-page.component'),
            //             canActivate: [AccessGuard]
            //         }
            //     ]
            // },
            // {
            //     path: 'reportes',
            //     children: [
            //         {
            //             path: '',
            //             loadComponent: () => import('./reportes/pages/home-reporte/home-reporte.component'),
            //         }
            //     ]
            // },
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
