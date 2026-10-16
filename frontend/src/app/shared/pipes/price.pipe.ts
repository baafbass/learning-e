import { Pipe, PipeTransform } from '@angular/core';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** 0 → "Free", otherwise a USD amount. */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value ? currency.format(value) : 'Free';
  }
}
