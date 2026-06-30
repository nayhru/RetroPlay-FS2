import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';
import { ClpPipe } from '../../pipes/clp-pipe';

/**
 * Tarjeta de producto reutilizable (estilo polaroid).
 * Recibe el producto por @Input y emite un evento por @Output
 * cuando el usuario quiere agregarlo al carrito. Demuestra el
 * paso de datos entre componentes (padre -> hijo y hijo -> padre).
 */
@Component({
  selector: 'app-producto-card',
  imports: [CommonModule, RouterLink, ClpPipe],
  templateUrl: './producto-card.html',
})
export class ProductoCard {
  /** Producto a mostrar (dato que baja del componente padre). */
  @Input({ required: true }) producto!: Producto;

  /** Evento que sube al padre cuando se pide agregar al carrito. */
  @Output() agregar = new EventEmitter<Producto>();

  /**
   * Emite el evento de agregar con el producto de esta tarjeta.
   */
  onAgregar(): void {
    this.agregar.emit(this.producto);
  }
}
