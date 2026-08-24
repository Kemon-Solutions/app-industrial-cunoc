import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ILabInsumo,
  TIPOS_MOVIMIENTO,
  TipoMovimiento,
} from '../../../../interfaces/laboratorio';

export interface MovimientoFormulario {
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string;
  responsable?: string;
}

/** Formulario para registrar entradas, salidas, préstamos y ajustes. */
@Component({
  selector: 'app-registrar-movimiento',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registrar-movimiento.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrarMovimientoComponent {
  private fb = inject(FormBuilder);

  insumo = input.required<ILabInsumo>();
  guardando = input<boolean>(false);
  formKey = input<number>(0);

  registrar = output<MovimientoFormulario>();
  cancelar = output<void>();

  tipos = TIPOS_MOVIMIENTO;
  form = signal<FormGroup>(this.fb.group({}));
  tipoSeleccionado = signal<TipoMovimiento>('SALIDA');
  cantidadActual = signal<number>(1);

  /** Cantidad que quedará tras aplicar el movimiento. */
  resultado = computed(() => {
    const actual = Number(this.insumo()?.cantidad ?? 0);
    const cantidad = Number(this.cantidadActual() ?? 0);
    const tipo = this.tipoSeleccionado();
    const definicion = this.tipos.find((t) => t.valor === tipo);

    if (!definicion) return actual;
    if (definicion.efecto === 'suma') return actual + cantidad;
    if (definicion.efecto === 'resta') return actual - cantidad;
    return cantidad;
  });

  resultadoNegativo = computed(() => this.resultado() < 0);

  constructor() {
    effect(() => {
      this.insumo();
      this.formKey();

      const grupo = this.fb.group({
        tipo: ['SALIDA', [Validators.required]],
        cantidad: [1, [Validators.required, Validators.min(0)]],
        motivo: ['', [Validators.maxLength(255)]],
        responsable: ['', [Validators.maxLength(150)]],
      });

      grupo.get('tipo')?.valueChanges.subscribe((valor) => {
        this.tipoSeleccionado.set((valor ?? 'SALIDA') as TipoMovimiento);
      });

      grupo.get('cantidad')?.valueChanges.subscribe((valor) => {
        this.cantidadActual.set(Number(valor ?? 0));
      });

      this.tipoSeleccionado.set('SALIDA');
      this.cantidadActual.set(1);
      this.form.set(grupo);
    });
  }

  onSubmit() {
    const form = this.form();
    if (form.invalid || this.resultadoNegativo()) {
      form.markAllAsTouched();
      return;
    }

    const valores = form.value as Record<string, unknown>;
    this.registrar.emit({
      insumo_id: this.insumo().id ?? '',
      tipo: valores['tipo'] as TipoMovimiento,
      cantidad: Number(valores['cantidad'] ?? 0),
      motivo: (valores['motivo'] as string) || undefined,
      responsable: (valores['responsable'] as string) || undefined,
    });
  }
}
