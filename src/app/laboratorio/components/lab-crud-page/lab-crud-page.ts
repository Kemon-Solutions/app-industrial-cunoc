import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ApiResponse } from '../../../../interfaces/api-response';

/** Columna de la tabla. `campo` admite rutas anidadas: 'ubicacion.nombre'. */
export interface ColumnaTabla {
  campo: string;
  etiqueta: string;
  tipo?: 'texto' | 'numero' | 'badge' | 'activo';
  alineacion?: 'izquierda' | 'centro' | 'derecha';
  ancho?: string;
}

export interface OpcionCampo {
  valor: string | number;
  etiqueta: string;
}

/** Campo del formulario de alta / edición. */
export interface CampoFormulario {
  nombre: string;
  etiqueta: string;
  tipo: 'texto' | 'textarea' | 'numero' | 'select' | 'booleano';
  requerido?: boolean;
  placeholder?: string;
  ayuda?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  opciones?: OpcionCampo[];
  /** Ancho dentro de la rejilla del formulario (por defecto 'completo') */
  ancho?: 'completo' | 'mitad';
  valorPorDefecto?: string | number;
}

type Registro = Record<string, unknown> & { id?: string };

/**
 * Contrato mínimo que debe cumplir un servicio para poder usarse en esta
 * página. Lo satisfacen todos los servicios que extienden LabBaseService.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ServicioCatalogo {
  listar(filtros?: Record<string, unknown>): Promise<ApiResponse<any[]> | null>;
  guardar(item: any): Promise<ApiResponse<any> | null>;
  eliminar(id: string): Promise<ApiResponse<any> | null>;
}

/**
 * Página CRUD reutilizable para los catálogos del laboratorio.
 * Encapsula tabla, buscador, paginación, modal de alta/edición y confirmación
 * de borrado, para que cada catálogo solo declare sus columnas y sus campos.
 */
@Component({
  selector: 'app-lab-crud-page',
  standalone: true,
  imports: [ReactiveFormsModule, PaginationComponent],
  templateUrl: './lab-crud-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabCrudPageComponent {
  private fb = inject(FormBuilder);

  // ---------------------------------------------------------------- Entradas
  titulo = input.required<string>();
  subtitulo = input<string>('');
  /** Etiqueta en singular usada en botones y mensajes: "categoría" */
  entidad = input.required<string>();
  columnas = input.required<ColumnaTabla[]>();
  campos = input.required<CampoFormulario[]>();
  servicio = input.required<ServicioCatalogo>();
  /** Filtros fijos que se envían siempre al listar (p. ej. { ubicacionId }) */
  filtrosFijos = input<Record<string, unknown>>({});

  // ------------------------------------------------------------------ Estado
  registros = signal<Registro[]>([]);
  isLoading = signal(false);
  guardando = signal(false);
  buscador = signal('');
  esNuevo = signal(true);
  registroActivo = signal<Registro>({});
  form = signal<FormGroup>(this.fb.group({}));

  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });

  tituloModal = computed(() =>
    this.esNuevo() ? `Nueva ${this.entidad()}` : `Editar ${this.entidad()}`,
  );
  textoBoton = computed(() => (this.esNuevo() ? 'Crear' : 'Guardar cambios'));

  @ViewChild('modalUpsert', { static: true })
  modalUpsert!: ElementRef<HTMLDivElement>;
  @ViewChild('modalEliminar', { static: true })
  modalEliminar!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    await this.cargar();
  }

  ngAfterViewInit() {
    this.initPreline();
  }

  // ------------------------------------------------------------------- Datos
  async cargar() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const resp = await this.servicio().listar({
      ...this.filtrosFijos(),
      page: this.pagination().page,
      limit: this.pagination().pageSize,
      busqueda: this.buscador(),
    });

    if (resp?.success) {
      this.registros.set(resp.data ?? []);
      this.pagination.update((p) => ({
        ...p,
        totalItems: resp.metadata?.total ?? 0,
      }));
    }

    this.isLoading.set(false);
    this.initPreline();
  }

  buscar(termino: string) {
    this.buscador.set(termino);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.cargar();
  }

  cambiarPagina(nueva: IPagination) {
    this.pagination.set(nueva);
    this.cargar();
  }

  /** Lee 'ubicacion.nombre' desde el registro. */
  valor(registro: Registro, ruta: string): unknown {
    return ruta
      .split('.')
      .reduce<unknown>(
        (acc, clave) =>
          acc && typeof acc === 'object'
            ? (acc as Record<string, unknown>)[clave]
            : undefined,
        registro,
      );
  }

  texto(registro: Registro, columna: ColumnaTabla): string {
    const v = this.valor(registro, columna.campo);
    if (v === null || v === undefined || v === '') return '—';
    return String(v);
  }

  /** La alineación solo aplica desde `md`: en móvil la tabla se apila. */
  claseAlineacion(columna: ColumnaTabla): string {
    if (columna.alineacion === 'centro') return 'md:text-center';
    if (columna.alineacion === 'derecha') return 'md:text-right';
    return '';
  }

  esActivo(registro: Registro): boolean {
    return Number(registro['activo'] ?? 1) === 1;
  }

  // ------------------------------------------------------------- Formularios
  private construirForm(registro: Registro) {
    const grupo: Record<string, unknown[]> = {};

    for (const campo of this.campos()) {
      const validadores = [];
      if (campo.requerido) validadores.push(Validators.required);
      if (campo.minLength) validadores.push(Validators.minLength(campo.minLength));
      if (campo.maxLength) validadores.push(Validators.maxLength(campo.maxLength));
      if (campo.min !== undefined) validadores.push(Validators.min(campo.min));

      const actual = registro[campo.nombre];
      const inicial =
        actual !== undefined && actual !== null
          ? actual
          : (campo.valorPorDefecto ?? (campo.tipo === 'booleano' ? 1 : ''));

      grupo[campo.nombre] = [inicial, validadores];
    }

    this.form.set(this.fb.group(grupo));
  }

  abrirUpsert(nuevo: boolean, registro: Registro = {}) {
    this.esNuevo.set(nuevo);
    this.registroActivo.set({ ...registro });
    this.construirForm(nuevo ? {} : registro);
    this.abrirModal(this.modalUpsert.nativeElement);
  }

  abrirEliminar(registro: Registro) {
    this.registroActivo.set({ ...registro });
    this.abrirModal(this.modalEliminar.nativeElement);
  }

  async guardar() {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    try {
      const payload: Registro = {
        ...(this.esNuevo() ? {} : { id: this.registroActivo()['id'] as string }),
        ...(form.value as Registro),
      };

      const resp = await this.servicio().guardar(payload);

      if (resp?.success) {
        this.cerrarModales();
        await this.cargar();
      }
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar() {
    const id = this.registroActivo()['id'] as string | undefined;
    if (!id) return;

    this.guardando.set(true);
    try {
      const resp = await this.servicio().eliminar(id);
      if (resp?.success) {
        this.cerrarModales();
        await this.cargar();
      }
    } finally {
      this.guardando.set(false);
    }
  }

  errorDe(nombre: string): string | null {
    const control = this.form().get(nombre);
    if (!control || !control.touched || control.valid) return null;
    if (control.errors?.['required']) return 'Este campo es obligatorio';
    if (control.errors?.['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors?.['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors?.['min']) return 'El valor no puede ser negativo';
    return 'Valor inválido';
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
      this.modalUpsert?.nativeElement,
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
    if (metodos) {
      setTimeout(() => metodos.autoInit(), 100);
    }
  }
}
