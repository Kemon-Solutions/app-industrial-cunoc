import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CampoFormulario,
  ColumnaTabla,
  LabCrudPageComponent,
} from '../../components/lab-crud-page/lab-crud-page';
import { LabAreaService } from '../../../../services/laboratorio/lab-area.service';
import { LabUbicacionService } from '../../../../services/laboratorio/lab-ubicacion.service';

/** Catálogo lab_area — «Dirección / lado» dentro de cada ubicación. */
@Component({
  selector: 'app-lab-areas-page',
  standalone: true,
  imports: [LabCrudPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-lab-crud-page
      titulo="Áreas"
      subtitulo="Dirección o lado dentro de una ubicación: derecha, izquierda, estantería, área de lavado…"
      entidad="área"
      [columnas]="columnas()"
      [campos]="campos()"
      [servicio]="servicio" />
  `,
})
export default class AreasPageComponent {
  servicio = inject(LabAreaService);
  private ubicacionService = inject(LabUbicacionService);

  columnas = signal<ColumnaTabla[]>([
    { campo: 'nombre', etiqueta: 'Área', ancho: '22%' },
    { campo: 'ubicacion.nombre', etiqueta: 'Ubicación', tipo: 'badge', ancho: '22%' },
    { campo: 'descripcion', etiqueta: 'Descripción' },
    { campo: 'activo', etiqueta: 'Estado', tipo: 'activo', alineacion: 'centro', ancho: '8rem' },
  ]);

  campos = signal<CampoFormulario[]>([
    {
      nombre: 'ubicacion_id',
      etiqueta: 'Ubicación',
      tipo: 'select',
      requerido: true,
      opciones: [],
      ayuda: 'El área siempre pertenece a una ubicación.',
    },
    {
      nombre: 'nombre',
      etiqueta: 'Nombre del área',
      tipo: 'texto',
      requerido: true,
      minLength: 2,
      maxLength: 100,
      placeholder: 'Ej. Derecha',
    },
    {
      nombre: 'descripcion',
      etiqueta: 'Descripción',
      tipo: 'textarea',
      maxLength: 255,
    },
    {
      nombre: 'activo',
      etiqueta: '¿Activa?',
      tipo: 'booleano',
      ancho: 'mitad',
      valorPorDefecto: 1,
    },
  ]);

  async ngOnInit() {
    const ubicaciones = await this.ubicacionService.listarTodos();
    this.campos.update((campos) =>
      campos.map((campo) =>
        campo.nombre === 'ubicacion_id'
          ? {
              ...campo,
              opciones: ubicaciones.map((u) => ({
                valor: u.id ?? '',
                etiqueta: u.nombre,
              })),
            }
          : campo,
      ),
    );
  }
}
