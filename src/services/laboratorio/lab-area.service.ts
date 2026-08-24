import { Injectable } from '@angular/core';
import { ILabArea } from '../../interfaces/laboratorio';
import { LabBaseService } from './lab-base.service';

@Injectable({ providedIn: 'root' })
export class LabAreaService extends LabBaseService<ILabArea> {
  protected readonly endpoint = '/laboratorio/areas';
  protected readonly etiqueta = 'las áreas';

  /** Áreas de una ubicación concreta (para los combos dependientes). */
  async listarPorUbicacion(ubicacionId: string): Promise<ILabArea[]> {
    if (!ubicacionId) return [];
    return this.listarTodos({ ubicacionId });
  }
}
