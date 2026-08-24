import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { RolService } from '../../../../services/auth/rol.service';
import { PermisoRolService } from '../../../../services/auth/permiso-rol.service';
import { IRol, IPermisoMatriz } from '../../../../interfaces/auth';

@Component({
  selector: 'app-permisos-rol-page',
  imports: [RouterLink, CustomIconComponent, PaginationComponent],
  templateUrl: './permisos-rol-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PermisosRolPageComponent {
  private rolService = inject(RolService);
  private permisoRolService = inject(PermisoRolService);

  // --- Roles / autocomplete ---
  rolesList = signal<IRol[]>([]);
  rolQuery = signal('');
  showRolDropdown = signal(false);
  selectedRol = signal<IRol | null>(null);

  filteredRoles = computed(() => {
    const q = this.rolQuery().trim().toLowerCase();
    const roles = this.rolesList();
    if (!q) return roles;
    return roles.filter(r => r.nombre.toLowerCase().includes(q));
  });

  // --- Matriz de permisos ---
  matriz = signal<IPermisoMatriz[]>([]);
  isLoading = signal(false);
  // permisoIds que están guardando un cambio (para deshabilitar su switch)
  saving = signal<Set<string>>(new Set());

  // --- Filtros ---
  fCodigo = signal('');
  fModulo = signal('');
  fAccion = signal('');

  pagination = signal<IPagination>({
    page: 1,
    pageSize: 10,
    totalItems: 0
  });

  async ngOnInit() {
    const resp = await this.rolService.getRoles({ all: true, limit: 1000 });
    if (resp?.success) {
      this.rolesList.set(resp.data || []);
    }
  }

  // ---------- Autocomplete de rol ----------
  onRolFocus() {
    this.showRolDropdown.set(true);
  }

  onRolBlur() {
    // Pequeño retraso para permitir el click sobre una opción antes de ocultar
    setTimeout(() => this.showRolDropdown.set(false), 150);
  }

  onRolInput(value: string) {
    this.rolQuery.set(value);
    this.showRolDropdown.set(true);
    // Si el texto deja de coincidir con el rol seleccionado, limpiamos la matriz
    const sel = this.selectedRol();
    if (sel && sel.nombre !== value) {
      this.selectedRol.set(null);
      this.matriz.set([]);
      this.pagination.update(p => ({ ...p, totalItems: 0 }));
    }
  }

  selectRol(rol: IRol) {
    this.selectedRol.set(rol);
    this.rolQuery.set(rol.nombre);
    this.showRolDropdown.set(false);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchMatriz();
  }

  clearRol() {
    this.selectedRol.set(null);
    this.rolQuery.set('');
    this.matriz.set([]);
    this.pagination.update(p => ({ ...p, page: 1, totalItems: 0 }));
  }

  // ---------- Matriz ----------
  async fetchMatriz() {
    const rol = this.selectedRol();
    if (!rol?.id || this.isLoading()) return;

    this.isLoading.set(true);
    const resp = await this.permisoRolService.getMatriz({
      rolId: rol.id,
      codigo: this.fCodigo(),
      modulo: this.fModulo(),
      accion: this.fAccion(),
      page: this.pagination().page,
      limit: this.pagination().pageSize,
    });

    if (resp?.success) {
      this.matriz.set(resp.data || []);
      if (resp.metadata) {
        this.pagination.update(p => ({ ...p, totalItems: resp.metadata?.total || 0 }));
      }
    }
    this.isLoading.set(false);
  }

  onSearch() {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchMatriz();
  }

  onChangePage(newPagination: IPagination) {
    this.matriz.set([]);
    this.pagination.set(newPagination);
    this.fetchMatriz();
  }

  isSaving(permisoId: string): boolean {
    return this.saving().has(permisoId);
  }

  private setSaving(permisoId: string, value: boolean) {
    this.saving.update(set => {
      const next = new Set(set);
      if (value) next.add(permisoId);
      else next.delete(permisoId);
      return next;
    });
  }

  /** Asigna o retira el permiso según el nuevo estado del switch. */
  async togglePermiso(permiso: IPermisoMatriz, asignar: boolean) {
    const rol = this.selectedRol();
    if (!rol?.id || !permiso.id) return;
    const permisoId = permiso.id;

    // Actualización optimista
    this.updateRow(permisoId, asignar);
    this.setSaving(permisoId, true);

    const resp = asignar
      ? await this.permisoRolService.asignar(rol.id, permisoId)
      : await this.permisoRolService.retirar(rol.id, permisoId);

    this.setSaving(permisoId, false);

    if (!resp?.success) {
      // Revertir si falló
      this.updateRow(permisoId, !asignar);
    }
  }

  private updateRow(permisoId: string, asignado: boolean) {
    this.matriz.update(rows =>
      rows.map(r => r.id === permisoId ? { ...r, asignado } : r)
    );
  }
}
