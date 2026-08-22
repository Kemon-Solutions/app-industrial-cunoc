import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  effect,
  signal
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { IPermiso } from '../../../../interfaces/auth';

@Component({
  selector: 'app-upsert-permiso',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './upsert-permiso.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertPermisoComponent {
  fb = inject(FormBuilder);

  permiso = input.required<IPermiso>();

  nuevo = input<boolean>(true);
  isLoading = input<boolean>(false);
  key = input<number>(0);

  @Output() save = new EventEmitter<IPermiso>();
  @Output() cancel = new EventEmitter<void>();

  form = signal<FormGroup>(this.fb.group({}));

  constructor() {
    effect(() => {
      const isNuevo = this.nuevo();
      const permiso = this.permiso();
      const _ = this.key();

      const newForm = this.fb.group({
        codigo: [permiso.codigo, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        modulo: [permiso.modulo, [Validators.required, Validators.maxLength(50)]],
        accion: [permiso.accion, [Validators.required, Validators.maxLength(50)]],
        descripcion: [permiso.descripcion ?? '', [Validators.maxLength(250)]],
        activo: [permiso.activo],
      });

      if (isNuevo) {
        newForm.reset({
          codigo: '',
          modulo: '',
          accion: '',
          descripcion: '',
          activo: true,
        });
      }

      this.form.set(newForm);
    });
  }

  get btnText(): string {
    return this.nuevo() ? 'Crear Permiso' : 'Actualizar Permiso';
  }

  onSubmit() {
    if (this.form().valid) {
      const value: IPermiso = {
        ...this.permiso(),
        ...this.form().value,
        // El código se normaliza a mayúsculas para mantener consistencia
        codigo: String(this.form().value.codigo || '').trim().toUpperCase(),
      };
      this.save.emit(value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
