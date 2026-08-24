import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CampoFormulario,
  ColumnaTabla,
  LabCrudPageComponent,
} from '../../components/lab-crud-page/lab-crud-page';
import { LabAlmacenamientoService } from '../../../../services/laboratorio/lab-almacenamiento.service';
import { LabUbicacionService } from '../../../../services/laboratorio/lab-ubicacion.service';
import { TIPOS_ALMACENAMIENTO } from '../../../../interfaces/laboratorio';

/** Catálogo lab_almacenamiento — cajas, organizadores y estanterías. */
@Component({
  selector: 'app-lab-almacenamientos-page',
  standalone: true,
  imports: [LabCrudPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-lab-crud-page
      titulo="Almacenamientos"
      subtitulo="Contenedores donde se guarda el inventario: cajas Sterilite, organizadores, botiquín, estanterías."
      entidad="contenedor"
      [columnas]="columnas()"
      [campos]="campos()"
      [servicio]="servicio" />
  `,
})
export default class AlmacenamientosPageComponent {
  servicio = inject(LabAlmacenamientoService);
  private ubicacionService = inject(LabUbicacionService);

  columnas = signal<ColumnaTabla[]>([
    { campo: 'nombre', etiqueta: 'Contenedor', ancho: '30%' },
    { campo: 'codigo', etiqueta: 'Código', alineacion: 'centro', ancho: '7rem' },
    { campo: 'tipo', etiqueta: 'Tipo', tipo: 'badge', alineacion: 'centro', ancho: '9rem' },
    { campo: 'ubicacion.nombre', etiqueta: 'Ubicación', ancho: '18%' },
    { campo: 'activo', etiqueta: 'Estado', tipo: 'activo', alineacion: 'centro', ancho: '8rem' },
  ]);

  campos = signal<CampoFormulario[]>([
    {
      nombre: 'nombre',
      etiqueta: 'Nombre del contenedor',
      tipo: 'texto',
      requerido: true,
      minLength: 2,
      maxLength: 150,
      placeholder: 'Ej. Herramienta (caja Sterilite tapa negra)',
    },
    {
      nombre: 'codigo',
      etiqueta: 'Código',
      tipo: 'texto',
      maxLength: 30,
      ancho: 'mitad',
      placeholder: 'Ej. B3',
    },
    {
      nombre: 'tipo',
      etiqueta: 'Tipo de contenedor',
      tipo: 'select',
      ancho: 'mitad',
      valorPorDefecto: 'OTRO',
      opciones: TIPOS_ALMACENAMIENTO.map((t) => ({
        valor: t.valor,
        etiqueta: t.etiqueta,
      })),
    },
    {
      nombre: 'ubicacion_id',
      etiqueta: 'Ubicación habitual',
      tipo: 'select',
      opciones: [],
    },
    {
      nombre: 'descripcion',
      etiqueta: 'Descripción',
      tipo: 'textarea',
      maxLength: 255,
    },
    {
      nombre: 'activo',
      etiqueta: '¿Activo?',
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
