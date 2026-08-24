import { Injectable } from '@angular/core';
import { ILabEstado } from '../../interfaces/laboratorio';
import { LabBaseService } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabEstadoService extends LabBaseService<ILabEstado> {
  protected readonly endpoint = '/laboratorio/estados';
  protected readonly etiqueta = 'los estados';
}
