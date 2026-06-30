import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';
import { RevealOnScroll } from '../../shared/directives/reveal';

/**
 * Pagina de inicio (landing). Muestra el hero, las categorias
 * rapidas, los productos destacados (leidos del ProductoService
 * con *ngFor) y un resumen de los servicios.
 */
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ClpPipe, RevealOnScroll],
  templateUrl: './home.html',
})
export class Home {
  private productoService = inject(ProductoService);

  /** Productos marcados como destacados para la grilla del home. */
  readonly destacados = signal<Producto[]>(this.productoService.obtenerDestacados());
}
