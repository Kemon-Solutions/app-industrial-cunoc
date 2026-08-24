import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { UpsertLabInsumoComponent } from '../../components/upsert-lab-insumo/upsert-lab-insumo';
import {
  MovimientoFormulario,
  RegistrarMovimientoComponent,
} from '../../components/registrar-movimiento/registrar-movimiento';
import {
  ILabAlmacenamiento,
  ILabArea,
  ILabCategoria,
  ILabEstado,
  ILabInsumo,
  ILabUbicacion,
} from '../../../../interfaces/laboratorio';
import { LabAlmacenamientoService } from '../../../../services/laboratorio/lab-almacenamiento.service';
import { LabAreaService } from '../../../../services/laboratorio/lab-area.service';
import { LabCategoriaService } from '../../../../services/laboratorio/lab-categoria.service';
import { LabEstadoService } from '../../../../services/laboratorio/lab-estado.service';
import { LabInsumoService } from '../../../../services/laboratorio/lab-insumo.service';
import { LabMovimientoService } from '../../../../services/laboratorio/lab-movimiento.service';
import { LabUbicacionService } from '../../../../services/laboratorio/lab-ubicacion.service';

const INSUMO_VACIO: ILabInsumo = {
  nombre: '',
  descripcion: '',
  cantidad: 0,
  unidad: 'UNIDAD',
  stock_minimo: 1,
  stock_medio: 2,
  costo_unitario: 0,
};

/** Inventario del laboratorio: listado, filtros, alta/edición y movimientos. */
@Component({
  selector: 'app-lab-insumos-page',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    PaginationComponent,
    UpsertLabInsumoComponent,
    RegistrarMovimientoComponent,
  ],
  templateUrl: './insumos-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InsumosPageComponent {
  private insumoService = inject(LabInsumoService);
  private movimientoService = inject(LabMovimientoService);
  private categoriaService = inject(LabCategoriaService);
  private ubicacionService = inject(LabUbicacionService);
  private areaService = inject(LabAreaService);
  private almacenamientoService = inject(LabAlmacenamientoService);
  private estadoService = inject(LabEstadoService);

  // ------------------------------------------------------------------ Estado
  insumos = signal<ILabInsumo[]>([]);
  categorias = signal<ILabCategoria[]>([]);
  ubicaciones = signal<ILabUbicacion[]>([]);
  areas = signal<ILabArea[]>([]);
  almacenamientos = signal<ILabAlmacenamiento[]>([]);
  estados = signal<ILabEstado[]>([]);

  isLoading = signal(false);
  guardando = signal(false);
  formKey = signal(Date.now());
  esNuevo = signal(true);
  insumoActivo = signal<ILabInsumo>({ ...INSUMO_VACIO });

  busqueda = signal('');
  filtroCategoria = signal('');
  filtroUbicacion = signal('');
  filtroEstado = signal('');
  filtroAlerta = signal(0);

  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });

  hayFiltros = computed(
    () =>
      !!this.busqueda() ||
      !!this.filtroCategoria() ||
      !!this.filtroUbicacion() ||
      !!this.filtroEstado() ||
      this.filtroAlerta() !== 0,
  );

  @ViewChild('modalDetalle', { static: true })
  modalDetalle!: ElementRef<HTMLDivElement>;
  @ViewChild('modalUpsert', { static: true })
  modalUpsert!: ElementRef<HTMLDivElement>;
  @ViewChild('modalMovimiento', { static: true })
  modalMovimiento!: ElementRef<HTMLDivElement>;
  @ViewChild('modalEliminar', { static: true })
  modalEliminar!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    await Promise.all([this.cargarCatalogos(), this.cargar()]);
  }

  ngAfterViewInit() {
    this.initPreline();
  }

  // ------------------------------------------------------------------- Datos
  private async cargarCatalogos() {
    const [categorias, ubicaciones, areas, almacenamientos, estados] =
      await Promise.all([
        this.categoriaService.listarTodos(),
        this.ubicacionService.listarTodos(),
        this.areaService.listarTodos(),
        this.almacenamientoService.listarTodos(),
        this.estadoService.listarTodos(),
      ]);

    this.categorias.set(categorias);
    this.ubicaciones.set(ubicaciones);
    this.areas.set(areas);
    this.almacenamientos.set(almacenamientos);
    this.estados.set(estados);
  }

  async cargar() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const resp = await this.insumoService.listarInventario({
      page: this.pagination().page,
      limit: this.pagination().pageSize,
      busqueda: this.busqueda() || undefined,
      categoriaId: this.filtroCategoria() || undefined,
      ubicacionId: this.filtroUbicacion() || undefined,
      estadoId: this.filtroEstado() || undefined,
      alerta: this.filtroAlerta() || undefined,
    });

    if (resp?.success) {
      this.insumos.set(resp.data ?? []);
      this.pagination.update((p) => ({
        ...p,
        totalItems: resp.metadata?.total ?? 0,
      }));
    }

    this.isLoading.set(false);
    this.initPreline();
  }

  buscar(termino: string) {
    this.busqueda.set(termino);
    this.reiniciarPagina();
  }

  cambiarFiltro(
    filtro: 'categoria' | 'ubicacion' | 'estado' | 'alerta',
    valor: string,
  ) {
    if (filtro === 'categoria') this.filtroCategoria.set(valor);
    if (filtro === 'ubicacion') this.filtroUbicacion.set(valor);
    if (filtro === 'estado') this.filtroEstado.set(valor);
    if (filtro === 'alerta') this.filtroAlerta.set(Number(valor));
    this.reiniciarPagina();
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroCategoria.set('');
    this.filtroUbicacion.set('');
    this.filtroEstado.set('');
    this.filtroAlerta.set(0);
    this.reiniciarPagina();
  }

  private reiniciarPagina() {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.cargar();
  }

  cambiarPagina(nueva: IPagination) {
    this.pagination.set(nueva);
    this.cargar();
  }

  // ------------------------------------------------------------------ Alertas
  nivelAlerta(insumo: ILabInsumo): 1 | 2 | 3 {
    if (insumo.alerta) return insumo.alerta;
    const cantidad = Number(insumo.cantidad ?? 0);
    if (cantidad <= Number(insumo.stock_minimo ?? 0)) return 1;
    if (cantidad <= Number(insumo.stock_medio ?? 0)) return 2;
    return 3;
  }

  claseAlerta(insumo: ILabInsumo): string {
    const nivel = this.nivelAlerta(insumo);
    if (nivel === 1) return 'badge badge-danger';
    if (nivel === 2) return 'badge badge-accent';
    return 'badge badge-success';
  }

  /** Punto de color usado en la columna de existencias. */
  claseIndicador(insumo: ILabInsumo): string {
    const nivel = this.nivelAlerta(insumo);
    if (nivel === 1) return 'bg-danger-500';
    if (nivel === 2) return 'bg-terciary-400';
    return 'bg-success-500';
  }

  /** El API entrega 'YYYY-MM-DDTHH:mm:ss' ya en hora de Guatemala. */
  fecha(valor?: string): string {
    if (!valor) return '—';
    const [dia] = valor.split('T');
    if (!dia) return valor;
    const [a, m, d] = dia.split('-');
    return `${d}/${m}/${a}`;
  }

  textoAlerta(insumo: ILabInsumo): string {
    const nivel = this.nivelAlerta(insumo);
    if (nivel === 1) return 'Crítico';
    if (nivel === 2) return 'Bajo';
    return 'Normal';
  }

  // ----------------------------------------------------------------- Acciones
  abrirUpsert(nuevo: boolean, insumo: ILabInsumo = { ...INSUMO_VACIO }) {
    this.esNuevo.set(nuevo);
    this.insumoActivo.set({ ...insumo });
    this.formKey.set(Date.now());
    this.abrirModal(this.modalUpsert.nativeElement);
  }

  abrirDetalle(insumo: ILabInsumo) {
    this.insumoActivo.set({ ...insumo });
    this.abrirModal(this.modalDetalle.nativeElement);
  }

  abrirMovimiento(insumo: ILabInsumo) {
    this.insumoActivo.set({ ...insumo });
    this.formKey.set(Date.now());
    this.abrirModal(this.modalMovimiento.nativeElement);
  }

  abrirEliminar(insumo: ILabInsumo) {
    this.insumoActivo.set({ ...insumo });
    this.abrirModal(this.modalEliminar.nativeElement);
  }

  async guardarInsumo(insumo: ILabInsumo) {
    this.guardando.set(true);
    try {
      const resp = await this.insumoService.guardar(insumo);
      if (resp?.success) {
        this.cerrarModales();
        await this.cargar();
      }
    } finally {
      this.guardando.set(false);
    }
  }

  async registrarMovimiento(movimiento: MovimientoFormulario) {
    this.guardando.set(true);
    try {
      const resp = await this.movimientoService.registrar(movimiento);
      if (resp?.success) {
        this.cerrarModales();
        await this.cargar();
      }
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminarInsumo() {
    const id = this.insumoActivo().id;
    if (!id) return;

    this.guardando.set(true);
    try {
      const resp = await this.insumoService.eliminar(id);
      if (resp?.success) {
        this.cerrarModales();
        await this.cargar();
      }
    } finally {
      this.guardando.set(false);
    }
  }

  // ------------------------------------------------------------------ Modales
  private abrirModal(elemento: HTMLDivElement) {
    const overlay = (window as unknown as { HSOverlay?: any }).HSOverlay;
    if (overlay) {
      new overlay(elemento).open();
    } else {
      elemento.classList.remove('hidden');
      elemento.classList.add('pointer-events-auto');
    }
  }

  cerrarModales() {
    const overlay = (window as unknown as { HSOverlay?: any }).HSOverlay;
    for (const el of [
      this.modalDetalle?.nativeElement,
      this.modalUpsert?.nativeElement,
      this.modalMovimiento?.nativeElement,
      this.modalEliminar?.nativeElement,
    ]) {
      if (!el) continue;
      if (overlay) {
        overlay.close(el);
      } else {
        el.classList.add('hidden');
        el.classList.remove('open', 'pointer-events-auto');
      }
    }
  }

  private initPreline() {
    const metodos = (window as unknown as { HSStaticMethods?: any })
      .HSStaticMethods;
    if (metodos) setTimeout(() => metodos.autoInit(), 100);
  }
}
