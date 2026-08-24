import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CampoFormulario,
  ColumnaTabla,
  LabCrudPageComponent,
} from '../../components/lab-crud-page/lab-crud-page';
import { LabCategoriaService } from '../../../../services/laboratorio/lab-categoria.service';

/** Catálogo lab_categoria — "Clasificación" del inventario. */
@Component({
  selector: 'app-lab-categorias-page',
  standalone: true,
  imports: [LabCrudPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-lab-crud-page
      titulo="Categorías"
      subtitulo="Clasificación de los objetos del laboratorio (columna «Clasificación» del inventario)."
      entidad="categoría"
      [columnas]="columnas()"
      [campos]="campos()"
      [servicio]="servicio" />
  `,
})
export default class CategoriasPageComponent {
  servicio = inject(LabCategoriaService);

  columnas = signal<ColumnaTabla[]>([
    { campo: 'nombre', etiqueta: 'Categoría', ancho: '22%' },
    { campo: 'descripcion', etiqueta: 'Descripción' },
    { campo: 'activo', etiqueta: 'Estado', tipo: 'activo', alineacion: 'centro', ancho: '8rem' },
  ]);

  campos = signal<CampoFormulario[]>([
    {
      nombre: 'nombre',
      etiqueta: 'Nombre de la categoría',
      tipo: 'texto',
      requerido: true,
      minLength: 2,
      maxLength: 100,
      placeholder: 'Ej. Herramientas',
    },
    {
      nombre: 'descripcion',
      etiqueta: 'Descripción',
      tipo: 'textarea',
      maxLength: 255,
      placeholder: 'Qué objetos agrupa esta categoría',
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
