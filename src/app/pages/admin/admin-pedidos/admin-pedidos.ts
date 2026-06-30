import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';
import { ClpPipe } from '../../../shared/pipes/clp-pipe';

/**
 * Gestion de pedidos para el administrador. Lista los pedidos con
 * filtros (ngModel), permite expandir el detalle y cambiar el
 * estado. Protegido por rolGuard(['admin']).
 */
@Component({
  selector: 'app-admin-pedidos',
  imports: [CommonModule, FormsModule, RouterLink, ClpPipe],
  templateUrl: './admin-pedidos.html',
})
export class AdminPedidos implements OnInit {
  private pedidoService = inject(PedidoService);

  /** Pedidos cargados. */
  private pedidos = signal<Pedido[]>([]);
  /** Filtros (ngModel). */
  busqueda = '';
  estado = '';

  /** Estados posibles para el selector. */
  readonly estados: EstadoPedido[] = ['pagado', 'preparando', 'enviado', 'entregado'];

  /**
   * Carga los pedidos al iniciar.
   */
  ngOnInit(): void {
    this.refrescar();
  }

  /**
   * Relee los pedidos.
   */
  private refrescar(): void {
    this.pedidos.set(this.pedidoService.obtenerTodos());
  }

  /**
   * Devuelve los pedidos filtrados, mas recientes primero.
   */
  pedidosFiltrados(): Pedido[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.pedidos()
      .filter((p) => {
        const coincideEstado = !this.estado || p.estado === this.estado;
        const coincideTxt =
          !texto ||
          p.id.toLowerCase().includes(texto) ||
          p.correoCliente.toLowerCase().includes(texto);
        return coincideEstado && coincideTxt;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  /**
   * Cambia el estado de un pedido.
   * @param id Id del pedido.
   * @param valor Nuevo estado (string del select).
   */
  cambiarEstado(id: string, valor: string): void {
    this.pedidoService.cambiarEstado(id, valor as EstadoPedido);
    this.refrescar();
  }

  /**
   * Formatea una fecha ISO al formato local.
   * @param iso Fecha en ISO.
   */
  formatearFecha(iso: string): string {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    );
  }
}
