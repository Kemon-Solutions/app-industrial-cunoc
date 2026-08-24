import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  ILabMovimiento,
  TIPOS_MOVIMIENTO,
  TipoMovimiento,
} from '../../../../interfaces/laboratorio';
import { LabMovimientoService } from '../../../../services/laboratorio/lab-movimiento.service';

/** Kardex: histórico de entradas, salidas, préstamos y ajustes. */
@Component({
  selector: 'app-lab-movimientos-page',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './movimientos-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MovimientosPageComponent {
  private servicio = inject(LabMovimientoService);

  tipos = TIPOS_MOVIMIENTO;

  movimientos = signal<ILabMovimiento[]>([]);
  isLoading = signal(false);

  busqueda = signal('');
  filtroTipo = signal('');
  desde = signal('');
  hasta = signal('');

  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });

  hayFiltros = computed(
    () => !!this.busqueda() || !!this.filtroTipo() || !!this.desde() || !!this.hasta(),
  );

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const resp = await this.servicio.listar({
      page: this.pagination().page,
      limit: this.pagination().pageSize,
      busqueda: this.busqueda() || undefined,
      tipo: this.filtroTipo() || undefined,
      desde: this.desde() || undefined,
      hasta: this.hasta() || undefined,
    });

    if (resp?.success) {
      this.movimientos.set((resp.data ?? []) as ILabMovimiento[]);
      this.pagination.update((p) => ({
        ...p,
        totalItems: resp.metadata?.total ?? 0,
      }));
    }

    this.isLoading.set(false);
  }

  aplicar() {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.cargar();
  }

  limpiar() {
    this.busqueda.set('');
    this.filtroTipo.set('');
    this.desde.set('');
    this.hasta.set('');
    this.aplicar();
  }

  cambiarPagina(nueva: IPagination) {
    this.pagination.set(nueva);
    this.cargar();
  }

  etiquetaTipo(tipo: TipoMovimiento | string): string {
    return this.tipos.find((t) => t.valor === tipo)?.etiqueta ?? String(tipo);
  }

  claseTipo(tipo: TipoMovimiento | string): string {
    const definicion = this.tipos.find((t) => t.valor === tipo);
    if (!definicion) return 'badge badge-neutral';
    if (definicion.efecto === 'suma') return 'badge badge-success';
    if (definicion.efecto === 'resta') return 'badge badge-danger';
    return 'badge badge-accent';
  }

  signo(tipo: TipoMovimiento | string): string {
    const definicion = this.tipos.find((t) => t.valor === tipo);
    if (!definicion) return '';
    if (definicion.efecto === 'suma') return '+';
    if (definicion.efecto === 'resta') return '−';
    return '=';
  }

  /** El API devuelve 'YYYY-MM-DDTHH:mm:ss' ya en hora de Guatemala. */
  fecha(valor?: string): string {
    if (!valor) return '—';
    const [dia, hora] = valor.split('T');
    if (!dia) return valor;
    const [a, m, d] = dia.split('-');
    return `${d}/${m}/${a}${hora ? ' ' + hora.substring(0, 5) : ''}`;
  }
}
