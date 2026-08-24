import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CampoFormulario,
  ColumnaTabla,
  LabCrudPageComponent,
} from '../../components/lab-crud-page/lab-crud-page';
import { LabUbicacionService } from '../../../../services/laboratorio/lab-ubicacion.service';

/** Catálogo lab_ubicacion — lugares físicos del laboratorio. */
@Component({
  selector: 'app-lab-ubicaciones-page',
  standalone: true,
  imports: [LabCrudPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-lab-crud-page
      titulo="Ubicaciones"
      subtitulo="Lugares físicos donde se resguarda el inventario: mueble blanco, cuarto oscuro, salón, stand."
      entidad="ubicación"
      [columnas]="columnas()"
      [campos]="campos()"
      [servicio]="servicio" />
  `,
})
export default class UbicacionesPageComponent {
  servicio = inject(LabUbicacionService);

  columnas = signal<ColumnaTabla[]>([
    { campo: 'nombre', etiqueta: 'Ubicación', ancho: '22%' },
    { campo: 'descripcion', etiqueta: 'Descripción' },
    { campo: 'responsable', etiqueta: 'Responsable', ancho: '18%' },
    { campo: 'activo', etiqueta: 'Estado', tipo: 'activo', alineacion: 'centro', ancho: '8rem' },
  ]);

  campos = signal<CampoFormulario[]>([
    {
      nombre: 'nombre',
      etiqueta: 'Nombre de la ubicación',
      tipo: 'texto',
      requerido: true,
      minLength: 2,
      maxLength: 100,
      placeholder: 'Ej. Mueble blanco',
    },
    {
      nombre: 'descripcion',
      etiqueta: 'Descripción',
      tipo: 'textarea',
      maxLength: 255,
    },
    {
      nombre: 'responsable',
      etiqueta: 'Responsable',
      tipo: 'texto',
      maxLength: 150,
      ancho: 'mitad',
      placeholder: 'Docente o auxiliar a cargo',
    },
    {
      nombre: 'activo',
      etiqueta: '¿Activa?',
      tipo: 'booleano',
      ancho: 'mitad',
      valorPorDefecto: 1,
    },
  ]);
}
