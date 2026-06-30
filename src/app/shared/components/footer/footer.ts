import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Pie de pagina comun a toda la aplicacion. Muestra la marca,
 * enlaces de navegacion y datos de contacto. Es estatico salvo
 * los enlaces de routing.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class Footer {}
