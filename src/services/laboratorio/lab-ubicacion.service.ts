import { Injectable } from '@angular/core';
import { ILabUbicacion } from '../../interfaces/laboratorio';
import { LabBaseService } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabUbicacionService extends LabBaseService<ILabUbicacion> {
  protected readonly endpoint = '/laboratorio/ubicaciones';
  protected readonly etiqueta = 'las ubicaciones';
}
