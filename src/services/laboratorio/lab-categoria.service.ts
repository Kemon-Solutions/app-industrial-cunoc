import { Injectable } from '@angular/core';
import { ILabCategoria } from '../../interfaces/laboratorio';
import { LabBaseService } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabCategoriaService extends LabBaseService<ILabCategoria> {
  protected readonly endpoint = '/laboratorio/categorias';
  protected readonly etiqueta = 'las categorías';
}
