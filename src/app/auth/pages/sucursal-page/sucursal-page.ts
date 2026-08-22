import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { SucursalService } from '../../../../services/auth/sucursal.service';
import { ISucursal } from '../../../../interfaces/auth';
import { UpsertSucursalComponent } from '../../components/upsert-sucursal/upsert-sucursal';

const emptySucursal: ISucursal = {
  nombre: '',
  municipio: '',
  departamento: '',
  telefono: '',
  direccion: '',
};

@Component({
  selector: 'app-sucursal-page',
  standalone: true,
  imports: [RouterLink, CustomIconComponent, PaginationComponent, UpsertSucursalComponent],
  templateUrl: './sucursal-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SucursalPageComponent {
  private sucursalService = inject(SucursalService);

  sucursalesList = signal<ISucursal[]>([]);
  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });
  isLoading = signal(false);
  buscador = signal('');

  nuevaSucursal = signal(true);
  sucursalEdit = signal<ISucursal>({ ...emptySucursal });
  modal = signal({ titulo: 'Crear Sucursal' });
  guardando = signal(false);

  @ViewChild('upsertModal', { static: true }) upsertModal!: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModal', { static: true }) deleteModal!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    this.fetchData();
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      setTimeout(() => (window as any).HSStaticMethods.autoInit(), 100);
    }
  }

  async fetchData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    const resp = await this.sucursalService.getSucursales({
      page: this.pagination().page,
      limit: this.pagination().pageSize,
      busqueda: this.buscador(),
    });
    if (resp?.success) {
      this.sucursalesList.set(resp.data || []);
      if (resp.metadata) {
        this.pagination.update(p => ({ ...p, totalItems: resp.metadata?.total || 0 }));
      }
    }
    this.isLoading.set(false);
  }

  onSearch(term: string) {
    this.buscador.set(term);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchData();
  }

  onChangePage(newPagination: IPagination) {
    this.pagination.set(newPagination);
    this.fetchData();
  }

  openUpsertModal(nuevo: boolean, sucursal: ISucursal = emptySucursal) {
    this.nuevaSucursal.set(nuevo);
    this.sucursalEdit.set({ ...sucursal });
    this.modal.update(m => ({ ...m, titulo: nuevo ? 'Nueva Sucursal' : 'Editar Sucursal' }));
    const modalEl = this.upsertModal.nativeElement;
    if ((window as any).HSOverlay) new (window as any).HSOverlay(modalEl).open();
  }

  openDeleteModal(sucursal: ISucursal) {
    this.sucursalEdit.set({ ...sucursal });
    const modalEl = this.deleteModal.nativeElement;
    if ((window as any).HSOverlay) new (window as any).HSOverlay(modalEl).open();
  }

  closeModal() {
    if ((window as any).HSOverlay) {
      (window as any).HSOverlay.close(this.upsertModal.nativeElement);
      (window as any).HSOverlay.close(this.deleteModal.nativeElement);
    }
  }

  async upsertSucursal(sucursal: ISucursal) {
    this.guardando.set(true);
    try {
      if (this.nuevaSucursal()) {
        const resp = await this.sucursalService.createSucursal(sucursal);
        if (resp?.success) { this.fetchData(); this.closeModal(); }
      } else {
        const resp = await this.sucursalService.updateSucursal(sucursal.id!, sucursal);
        if (resp?.success) { this.fetchData(); this.closeModal(); }
      }
    } finally {
      this.guardando.set(false);
    }
  }

  async deleteSucursal(sucursal: ISucursal) {
    const resp = await this.sucursalService.deleteSucursal(sucursal.id!);
    if (resp?.success) { this.fetchData(); this.closeModal(); }
  }
}
