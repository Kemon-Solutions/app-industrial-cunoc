import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISucursal } from '../../../../interfaces/auth';

@Component({
  selector: 'app-upsert-sucursal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './upsert-sucursal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertSucursalComponent {
  private fb = inject(FormBuilder);

  sucursal = input.required<ISucursal>();
  nuevo = input<boolean>(true);
  isLoading = input<boolean>(false);

  @Output() save = new EventEmitter<ISucursal>();
  @Output() cancel = new EventEmitter<void>();

  form = signal<FormGroup>(this.fb.group({}));

  constructor() {
    effect(() => {
      const s = this.sucursal();

      this.form.set(
        this.fb.group({
          nombre: [s?.nombre ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
          municipio: [s?.municipio ?? '', [Validators.required, Validators.maxLength(100)]],
          departamento: [s?.departamento ?? '', [Validators.required, Validators.maxLength(100)]],
          telefono: [s?.telefono ?? '', [Validators.maxLength(20)]],
          direccion: [s?.direccion ?? '', [Validators.maxLength(255)]],
        })
      );
    });
  }

  onSubmit() {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }
    const value: ISucursal = {
      ...this.sucursal(),
      ...this.form().value,
    };
    this.save.emit(value);
  }

  onCancel() {
    this.cancel.emit();
  }
}
