import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ILabResumen } from '../../../../interfaces/laboratorio';
import { LabDashboardService } from '../../../../services/laboratorio/lab-dashboard.service';

/** Panel de indicadores del inventario del laboratorio. */
@Component({
  selector: 'app-lab-inventario-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inventario-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioPageComponent {
  private servicio = inject(LabDashboardService);

  resumen = signal<ILabResumen | null>(null);
  isLoading = signal(true);

  /** Escala para las barras del desglose por categoría. */
  maximoCategoria = computed(() =>
    Math.max(1, ...(this.resumen()?.por_categoria ?? []).map((c) => c.registros)),
  );

  maximoUbicacion = computed(() =>
    Math.max(1, ...(this.resumen()?.por_ubicacion ?? []).map((u) => u.registros)),
  );

  async ngOnInit() {
    this.isLoading.set(true);
    this.resumen.set(await this.servicio.resumen());
    this.isLoading.set(false);
  }

  porcentaje(valor: number, maximo: number): number {
    return Math.round((valor / Math.max(1, maximo)) * 100);
  }

  fecha(valor?: string): string {
    if (!valor) return '—';
    const [dia, hora] = valor.split('T');
    if (!dia) return valor;
    const [a, m, d] = dia.split('-');
    return `${d}/${m}/${a}${hora ? ' ' + hora.substring(0, 5) : ''}`;
  }
}
