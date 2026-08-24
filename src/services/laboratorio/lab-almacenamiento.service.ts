import { Injectable } from '@angular/core';
import { ILabAlmacenamiento } from '../../interfaces/laboratorio';
import { LabBaseService } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabAlmacenamientoService extends LabBaseService<ILabAlmacenamiento> {
  protected readonly endpoint = '/laboratorio/almacenamientos';
  protected readonly etiqueta = 'los almacenamientos';
}
