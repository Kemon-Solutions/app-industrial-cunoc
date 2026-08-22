# Prototipo Base

Plantilla base de Angular para iniciar nuevos proyectos. Provee de fábrica la
infraestructura común que casi todo proyecto necesita, para que cada nuevo
desarrollo parta de aquí y solo agregue sus módulos propios.

## Incluye

- **Autenticación / Login** con guard de sesión (`AuthGuard`).
- **Gestión de usuarios** (alta, edición, asignación de rol/puesto/sucursal).
- **Control de accesos por permisos** mediante `AccessGuard` y configuración de
  menús y accesos.
- **Catálogos de configuración**: roles, puestos, sucursales, menús y
  configuración general.
- **Perfil de usuario** (mi perfil) y **dashboard** con layout y side-menu.

> Este repositorio es solo el punto de partida: no contiene lógica de negocio de
> ningún proyecto en particular.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
