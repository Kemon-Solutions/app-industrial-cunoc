import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CampoFormulario,
  ColumnaTabla,
  LabCrudPageComponent,
} from '../../components/lab-crud-page/lab-crud-page';
import { LabEstadoService } from '../../../../services/laboratorio/lab-estado.service';

/** Catálogo lab_estado — situación de cada objeto. */
@Component({
  selector: 'app-lab-estados-page',
  standalone: true,
  imports: [LabCrudPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-lab-crud-page
      titulo="Estados"
      subtitulo="Situación en la que puede encontrarse un objeto: disponible, prestado, dañado, de baja…"
      entidad="estado"
      [columnas]="columnas()"
      [campos]="campos()"
      [servicio]="servicio" />
  `,
})
export default class EstadosPageComponent {
  servicio = inject(LabEstadoService);

  columnas = signal<ColumnaTabla[]>([
    { campo: 'orden', etiqueta: '#', alineacion: 'centro', ancho: '4rem' },
    { campo: 'nombre', etiqueta: 'Estado', ancho: '20%' },
    { campo: 'descripcion', etiqueta: 'Descripción' },
    { campo: 'activo', etiqueta: 'Registro', tipo: 'activo', alineacion: 'centro', ancho: '8rem' },
  ]);

  campos = signal<CampoFormulario[]>([
    {
      nombre: 'nombre',
      etiqueta: 'Nombre del estado',
      tipo: 'texto',
      requerido: true,
      minLength: 2,
      maxLength: 80,
      placeholder: 'Ej. Prestado',
    },
    {
      nombre: 'descripcion',
      etiqueta: 'Descripción',
      tipo: 'textarea',
      maxLength: 255,
    },
    {
      nombre: 'disponible',
      etiqueta: '¿Cuenta como existencia disponible?',
      tipo: 'booleano',
      ancho: 'mitad',
      valorPorDefecto: 1,
      ayuda: 'Marque «No» para estados como Prestado, Dañado o De baja.',
    },
    {
      nombre: 'orden',
      etiqueta: 'Orden de presentación',
      tipo: 'numero',
      min: 0,
      ancho: 'mitad',
      valorPorDefecto: 0,
    },
    {
      nombre: 'activo',
      etiqueta: '¿Activo?',
      tipo: 'booleano',
      ancho: 'mitad',
      valorPorDefecto: 1,
    },
  ]);
}
