import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que formatea un numero como precio en pesos chilenos (CLP).
 * Ejemplo: 24990 -> "$24.990".
 *
 * @example
 * {{ producto.precio | clp }}
 */
@Pipe({
  name: 'clp',
})
export class ClpPipe implements PipeTransform {
  /**
   * Transforma un valor numerico en texto con formato CLP.
   * @param valor Monto a formatear.
   * @returns El monto con simbolo $ y separador de miles, o "$0" si es invalido.
   */
  transform(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return '$0';
    }
    return '$' + Number(valor).toLocaleString('es-CL');
  }
}
