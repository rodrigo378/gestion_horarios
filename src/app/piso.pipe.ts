import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pisoLabel',
  standalone: false,
})
export class PisoPipe implements PipeTransform {
  private pisoMap: Record<number, string> = {
    [-1]: 'SÓTANO',
    1: 'PISO 1',
    2: 'PISO 2',
    3: 'PISO 3',
    4: 'PISO 4',
    5: 'PISO 5',
    6: 'PISO 6',
    7: 'PISO 7',
  };

  transform(value: number): string {
    return this.pisoMap[value] || `PISO ${value}`;
  }
}
