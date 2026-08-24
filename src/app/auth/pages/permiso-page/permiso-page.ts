import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PermisoService } from '../../../../services/auth/permiso.service';
import { IPermiso } from '../../../../interfaces/auth';
import { TimezoneDatePipe } from '../../../shared/pipes/timezone-date.pipe';
import { ToastrService } from 'ngx-toastr';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { UpsertPermisoComponent } from '../../components/upsert-permiso/upsert-permiso';

const emptyPermiso: IPermiso = {
  id: '',
  codigo: '',
  modulo: '',
  accion: '',
  descripcion: '',
  activo: true,
  created_at: new Date(),
};

@Component({
  selector: 'app-permiso-page',
  imports: [RouterLink, CustomIconComponent, TimezoneDatePipe, PaginationComponent, UpsertPermisoComponent],
  templateUrl: './permiso-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PermisoPageComponent {
  permisoService = inject(PermisoService);
  permisosList = signal<IPermiso[]>([]);
  nuevoPermiso = signal(true);
  permisoEdit = signal<IPermiso>({ ...emptyPermiso });

  pagination = signal<IPagination>({
    page: 1,
    pageSize: 10,
    totalItems: 0
  });

  isLoading = signal(false);
  guardando = signal(false);
  formKey = signal(Date.now());
  modal = signal({
    titulo: 'Crear Permiso',
    visible: false,
    boton: 'Guardar Permiso'
  });

  buscador = signal('');

  // Para usar Math en el template
  Math = Math;

  // Referencia a los contenedores de los modales
  @ViewChild('upsertModal', { static: true }) upsertModal!: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModal', { static: true }) deleteModal!: ElementRef<HTMLDivElement>;

  constructor(private toastr: ToastrService) { }

  async ngOnInit() {
    this.permisosList.set([]);
    this.fetchData();
  }

  ngAfterViewInit() {
    this.initializePreline();
  }

  private initializePreline() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      setTimeout(() => {
        (window as any).HSStaticMethods.autoInit();
      }, 100);
    }
  }

  async fetchData() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    const response = await this.permisoService.getPermisos({
      page: this.pagination().page,
      limit: this.pagination().pageSize,
      busqueda: this.buscador()
    });

    if (response?.success) {
      this.permisosList.set(response.data);
      if (response.metadata) {
        this.pagination.update(p => ({
          ...p,
          totalItems: response.metadata?.total || 0
        }));
      }
      setTimeout(() => {
        if ((window as any).HSStaticMethods) {
          (window as any).HSStaticMethods.autoInit();
        }
      }, 100);
    }
    this.isLoading.set(false);
  }

  onSearch(searchTerm: string) {
    this.buscador.set(searchTerm);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchData();
  }

  /** Alterna el estado activo/inactivo de un permiso */
  async togglePermisoStatus(permiso: IPermiso, status: boolean) {
    const updatedPermiso: IPermiso = {
      ...permiso,
      activo: status
    };
    this.updatePermiso(updatedPermiso);
  }

  onChangePage(newPagination: IPagination) {
    this.permisosList.set([]);
    this.pagination.set(newPagination);
    this.fetchData();
  }

  openUpsertModal(nuevo: boolean, permiso: IPermiso = emptyPermiso) {
    this.formKey.set(Date.now());
    this.nuevoPermiso.set(nuevo);
    this.permisoEdit.set({ ...permiso });

    this.modal.update(m => ({
      ...m,
      titulo: nuevo ? 'Crear Permiso' : 'Editar Permiso',
      boton: nuevo ? 'Crear Permiso' : 'Actualizar Permiso',
      visible: true
    }));

    const modalEl = this.upsertModal.nativeElement;

    if ((window as any).HSOverlay) {
      new (window as any).HSOverlay(modalEl).open();
    } else {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('pointer-events-auto');
    }
  }

  openDeleteModal(permiso: IPermiso) {
    this.permisoEdit.set({ ...permiso });
    const modalEl = this.deleteModal.nativeElement;

    if ((window as any).HSOverlay) {
      new (window as any).HSOverlay(modalEl).open();
    } else {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('pointer-events-auto');
    }
  }

  /** Cierra los modales */
  closeModal() {
    const modalEl = this.upsertModal.nativeElement;
    const modalDEl = this.deleteModal.nativeElement;

    if ((window as any).HSOverlay) {
      (window as any).HSOverlay.close(modalEl);
      (window as any).HSOverlay.close(modalDEl);
    } else {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('open', 'pointer-events-auto');
      modalDEl.classList.add('hidden');
      modalDEl.classList.remove('open', 'pointer-events-auto');
    }
  }

  async upsertPermiso(permiso: IPermiso) {
    this.guardando.set(true);
    try {
      if (!permiso.id) { await this.createPermiso(permiso); }
      else { await this.updatePermiso(permiso); }
    } finally {
      this.guardando.set(false);
    }
  }

  async createPermiso(permiso: IPermiso) {
    let resp = await this.permisoService.createPermiso(permiso);
    if (resp?.success) {
      const nuevoPermiso = resp.data;
      this.permisosList.update(permisos => [nuevoPermiso, ...permisos]);

      this.pagination.update(p => ({
        ...p,
        totalItems: p.totalItems + 1
      }));

      this.closeModal();
      this.permisoEdit.set({ ...emptyPermiso });
      this.nuevoPermiso.set(true);
    }
  }

  async updatePermiso(permiso: IPermiso) {
    let resp = await this.permisoService.updatePermiso(permiso);
    if (resp?.success) {
      const permisoActualizado = resp.data;
      this.permisosList.update(permisos =>
        permisos.map(p => p.id === permisoActualizado.id ? permisoActualizado : p)
      );

      this.closeModal();
    }
  }

  async deletePermiso(permiso: IPermiso) {
    const response = await this.permisoService.deletePermiso(permiso.id || '');
    if (response?.success) {
      this.fetchData();
      this.closeModal();
      this.permisoEdit.set({ ...emptyPermiso });
      this.nuevoPermiso.set(true);
    }
  }

}
