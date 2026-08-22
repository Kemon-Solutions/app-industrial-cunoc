# Project Overview: prototipo-app (GrupoCorporativo)

This is a modern web application built with **Angular 21**, focusing on corporate management, specifically for Authentication and Treasury modules. It follows a feature-based architecture and utilizes the latest Angular features like Signals and Standalone Components.

## Main Technologies
- **Framework:** Angular 21 (Standalone Components, Signals, Router)
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Preline UI (v3.2.3)
- **Icons:** Lucide Angular
- **Notifications:** ngx-toastr
- **Testing:** Jasmine & Karma

## Architecture
The project is organized into feature-specific directories within `src/app/`:
- **auth:** Authentication logic, login page, profile management, and RBAC (Role-Based Access Control) configuration (users, roles, permissions, menus).
- **dashboard:** Main layout, navigation bars, and side menus.
- **tesoreria:** Treasury management including banks, bank accounts, companies, currency types, and transaction movements.
- **shared:** Reusable components (pagination, icons), pipes, and error pages (401, 404).
- **services:** Centralized business logic and API communication via `HttpService`.

### Key Services
- **HttpService:** Wraps Angular's `HttpClient` to provide standard methods (`get`, `post`, `put`, `delete`, `patch`) with automatic header management (Authorization Bearer token).
- **AuthService & AccesoService:** Manage user sessions, tokens, and permission-based access control.

## Building and Running

### Development Server
Run the following command for a local development server:
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.

### Build
To build the project for production:
```bash
npm run build
# or
ng build
```
Build artifacts will be stored in the `dist/prototipo-app/` directory.

### Testing
Run unit tests with Karma:
```bash
npm test
# or
ng test
```

### Deployment
Custom deployment scripts are available in `package.json`:
- `npm run deploy:ubuntu`: Deploys to `/var/www/prototipo/`.
- `npm run deploy:amazon`: Deploys to `/usr/share/nginx/html/prototipo`.

## Development Conventions

### Coding Style
- **Standalone Components:** All new components should be standalone.
- **Signals:** Use Angular Signals for reactive state management within components (e.g., `signal()`, `computed()`, `effect()`).
- **Dependency Injection:** Prefer the `inject()` function over constructor injection for cleaner and more modern code.
- **Typing:** Strict TypeScript usage is encouraged. All API responses should have corresponding interfaces in `src/interfaces/`.

### UI & Styling
- Use **Tailwind CSS** for layout and custom styling.
- Leverage **Preline UI** for complex interactive components (modals, dropdowns, etc.).
- Icons should be implemented using **Lucide Angular**.

### API Communication
- Always use `HttpService` for backend requests to ensure consistent header and error handling.
- Base API URL is managed in `src/environments/environment.ts`.

### Route Protection
- Use `AuthGuard` to protect routes requiring authentication.
- Use `AccessGuard` for fine-grained permission control based on user roles and assigned "accesos".
