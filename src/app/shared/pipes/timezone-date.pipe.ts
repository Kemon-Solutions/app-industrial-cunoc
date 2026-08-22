import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'tzDate',
  standalone: true,
})
export class TimezoneDatePipe implements PipeTransform {
  private locale = inject(LOCALE_ID);
  private datePipe = new DatePipe(this.locale);

  // El API devuelve timestamps en UTC sin sufijo Z.
  // Se fuerza interpretación UTC añadiendo Z, luego se muestra en Guatemala (UTC-6).
  transform(value: any, format: string = 'medium', timezone: string = '-0600', locale?: string): string | null {
    const loc = locale || this.locale;
    if (typeof value === 'string' && !/Z$|[+-]\d{2}:\d{2}$/.test(value)) {
      value = value + 'Z';
    }
    return this.datePipe.transform(value, format, timezone, loc);
  }
}
