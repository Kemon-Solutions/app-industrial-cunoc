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
  ILabAlmacenamiento,
  ILabArea,
  ILabCategoria,
  ILabEstado,
  ILabInsumo,
  ILabUbicacion,
} from '../../../../interfaces/laboratorio';

/** Formulario de alta y edición de un objeto del inventario. */
@Component({
  selector: 'app-upsert-lab-insumo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './upsert-lab-insumo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertLabInsumoComponent {
  private fb = inject(FormBuilder);

  insumo = input.required<ILabInsumo>();
  nuevo = input<boolean>(true);
  guardando = input<boolean>(false);
  /** Cambia para forzar la reconstrucción del formulario desde el padre */
  formKey = input<number>(0);

  categorias = input<ILabCategoria[]>([]);
  ubicaciones = input<ILabUbicacion[]>([]);
  areas = input<ILabArea[]>([]);
  almacenamientos = input<ILabAlmacenamiento[]>([]);
  estados = input<ILabEstado[]>([]);

  guardar = output<ILabInsumo>();
  cancelar = output<void>();

  form = signal<FormGroup>(this.fb.group({}));
  ubicacionSeleccionada = signal<string>('');

  /** Solo se ofrecen las áreas de la ubicación elegida. */
  areasFiltradas = computed(() => {
    const ubicacion = this.ubicacionSeleccionada();
    if (!ubicacion) return this.areas();
    return this.areas().filter((a) => a.ubicacion_id === ubicacion);
  });

  textoBoton = computed(() =>
    this.nuevo() ? 'Agregar al inventario' : 'Guardar cambios',
  );

  constructor() {
    effect(() => {
      const item = this.insumo();
      this.formKey();

      const grupo = this.fb.group({
        codigo: [item?.codigo ?? ''],
        nombre: [
          item?.nombre ?? '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(150)],
        ],
        descripcion: [item?.descripcion ?? '', [Validators.maxLength(255)]],
        categoria_id: [item?.categoria_id ?? ''],
        ubicacion_id: [item?.ubicacion_id ?? ''],
        area_id: [item?.area_id ?? ''],
        almacenamiento_id: [item?.almacenamiento_id ?? ''],
        estado_id: [item?.estado_id ?? ''],
        cantidad: [item?.cantidad ?? 0, [Validators.required, Validators.min(0)]],
        unidad: [item?.unidad ?? 'UNIDAD', [Validators.maxLength(30)]],
        stock_minimo: [item?.stock_minimo ?? 1, [Validators.min(0)]],
        stock_medio: [item?.stock_medio ?? 2, [Validators.min(0)]],
        costo_unitario: [item?.costo_unitario ?? 0, [Validators.min(0)]],
        observaciones: [item?.observaciones ?? ''],
      });

      this.ubicacionSeleccionada.set(item?.ubicacion_id ?? '');

      grupo.get('ubicacion_id')?.valueChanges.subscribe((valor) => {
        const ubicacion = (valor ?? '') as string;
        this.ubicacionSeleccionada.set(ubicacion);
        const areaActual = grupo.get('area_id')?.value as string;
        const sigueSiendoValida = this.areas().some(
          (a) => a.id === areaActual && a.ubicacion_id === ubicacion,
        );
        if (!sigueSiendoValida) grupo.get('area_id')?.setValue('');
      });

      this.form.set(grupo);
    });
  }

  error(campo: string): string | null {
    const control = this.form().get(campo);
    if (!control || !control.touched || control.valid) return null;
    if (control.errors?.['required']) return 'Este campo es obligatorio';
    if (control.errors?.['minlength']) return 'Texto demasiado corto';
    if (control.errors?.['maxlength']) return 'Texto demasiado largo';
    if (control.errors?.['min']) return 'El valor no puede ser negativo';
    return 'Valor inválido';
  }

  onSubmit() {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const valores = form.value as Record<string, unknown>;
    this.guardar.emit({
      ...(this.nuevo() ? {} : { id: this.insumo().id }),
      ...(valores as unknown as ILabInsumo),
      cantidad: Number(valores['cantidad'] ?? 0),
      stock_minimo: Number(valores['stock_minimo'] ?? 0),
      stock_medio: Number(valores['stock_medio'] ?? 0),
      costo_unitario: Number(valores['costo_unitario'] ?? 0),
    });
  }
}
