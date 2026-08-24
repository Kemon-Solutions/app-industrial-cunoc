import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Marca un salto de bloque de páginas. `destino` es la página a la que lleva. */
export interface SaltoPaginas {
  salto: true;
  destino: number;
}

export type ElementoPaginacion = number | SaltoPaginas;

/**
 * Paginación con agrupación: cuando hay muchas páginas no se listan todas,
 * se muestra una ventana alrededor de la actual, siempre con la primera y la
 * última, y los «…» son botones que saltan un bloque completo.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  paginationObj = input.required<IPagination>();
  showText = input<boolean>(true);
  /** Cuántas páginas se listan sin agrupar */
  maxVisibles = input<number>(10);

  changePage = output<IPagination>();

  Math = Math;

  totalPages = computed(() => {
    const { totalItems, pageSize } = this.paginationObj();
    return Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  });

  desde = computed(() => {
    const { page, pageSize, totalItems } = this.paginationObj();
    return totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  });

  hasta = computed(() => {
    const { page, pageSize, totalItems } = this.paginationObj();
    return Math.min(page * pageSize, totalItems);
  });

  /**
   * Elementos a dibujar: números de página y saltos de bloque.
   * Con 22 páginas y estando en la 1 produce: 1 2 3 4 5 … 22
   * Estando en la 12:                          1 … 10 11 12 13 14 … 22
   */
  elementos = computed<ElementoPaginacion[]>(() => {
    const total = this.totalPages();
    const actual = this.paginationObj().page;
    const max = Math.max(5, this.maxVisibles());

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const ventana = 2; // páginas a cada lado de la actual
    let inicio = Math.max(2, actual - ventana);
    let fin = Math.min(total - 1, actual + ventana);

    // Mantener el ancho de la ventana también en los extremos
    if (actual - ventana < 2) fin = Math.min(total - 1, fin + (2 - (actual - ventana)));
    if (actual + ventana > total - 1) {
      inicio = Math.max(2, inicio - (actual + ventana - (total - 1)));
    }

    const salida: ElementoPaginacion[] = [1];

    if (inicio > 2) {
      salida.push({ salto: true, destino: Math.max(1, inicio - ventana - 1) });
    }

    for (let p = inicio; p <= fin; p++) salida.push(p);

    if (fin < total - 1) {
      salida.push({ salto: true, destino: Math.min(total, fin + ventana + 1) });
    }

    salida.push(total);
    return salida;
  });

  esSalto(elemento: ElementoPaginacion): elemento is SaltoPaginas {
    return typeof elemento !== 'number';
  }

  numero(elemento: ElementoPaginacion): number {
    return typeof elemento === 'number' ? elemento : elemento.destino;
  }

  irA(page: number): void {
    const destino = Math.min(Math.max(1, page), this.totalPages());
    if (destino === this.paginationObj().page) return;
    this.changePage.emit({ ...this.paginationObj(), page: destino });
  }

  anterior(): void {
    this.irA(this.paginationObj().page - 1);
  }

  siguiente(): void {
    this.irA(this.paginationObj().page + 1);
  }

  primera(): void {
    this.irA(1);
  }

  ultima(): void {
    this.irA(this.totalPages());
  }

  cambiarTamano(pageSize: number = 10): void {
    this.changePage.emit({ ...this.paginationObj(), pageSize, page: 1 });
  }

  // ---- Compatibilidad con el API anterior del componente ----
  get totalPagesValue(): number {
    return this.totalPages();
  }

  totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.irA(page);
  }

  nextPage(): void {
    this.siguiente();
  }

  previousPage(): void {
    this.anterior();
  }

  changePageSize(pageSize: number = 10): void {
    this.cambiarTamano(pageSize);
  }
}
