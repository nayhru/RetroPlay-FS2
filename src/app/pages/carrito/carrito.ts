import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { ProductoService } from '../../core/services/producto.service';
import { ItemCarrito } from '../../core/models/producto.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';

/**
 * Carrito de compras del cliente. Lista los items, permite
 * ajustar cantidades, eliminar y vaciar. Calcula el total y
 * deja avanzar al checkout. Protegido por rolGuard(['cliente']).
 */
@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink, ClpPipe],
  templateUrl: './carrito.html',
})
export class Carrito implements OnInit {
  private carrito = inject(CarritoService);
  private productoService = inject(ProductoService);

  /** Items actuales del carrito. */
  readonly items = signal<ItemCarrito[]>([]);
  /** Total en CLP del carrito. */
  readonly total = signal<number>(0);

  /**
   * Carga el carrito al iniciar.
   */
  ngOnInit(): void {
    this.refrescar();
  }

  /**
   * Relee el carrito y recalcula el total.
   */
  private refrescar(): void {
    this.items.set(this.carrito.obtener());
    this.total.set(this.carrito.calcularTotal());
  }

  /**
   * Cantidad total de unidades (para el resumen).
   * @returns Suma de cantidades.
   */
  totalUnidades(): number {
    return this.items().reduce((acc, i) => acc + i.cantidad, 0);
  }

  /**
   * Obtiene el stock disponible de un producto (para el max del input).
   * @param productoId Id del producto.
   * @returns Stock disponible o la cantidad actual si no se encuentra.
   */
  stockDisponible(productoId: number): number {
    return this.productoService.obtenerPorId(productoId)?.stock ?? 99;
  }

  /**
   * Cambia la cantidad de un item validando contra el stock.
   * @param productoId Id del producto.
   * @param valor Nuevo valor (string del input).
   */
  cambiarCantidad(productoId: number, valor: string): void {
    const cantidad = parseInt(valor, 10);
    if (!cantidad || cantidad < 1) {
      this.refrescar();
      return;
    }
    const stock = this.stockDisponible(productoId);
    if (cantidad > stock) {
      alert(`Solo hay ${stock} unidades disponibles.`);
      this.refrescar();
      return;
    }
    this.carrito.actualizarCantidad(productoId, cantidad);
    this.refrescar();
  }

  /**
   * Elimina un item del carrito tras confirmar.
   * @param productoId Id del producto a quitar.
   */
  eliminar(productoId: number): void {
    if (!confirm('Quitar este producto del carrito?')) {
      return;
    }
    this.carrito.eliminar(productoId);
    this.refrescar();
  }

  /**
   * Vacia el carrito completo tras confirmar.
   */
  vaciar(): void {
    if (!confirm('Vaciar el carrito completo?')) {
      return;
    }
    this.carrito.vaciar();
    this.refrescar();
  }
}
