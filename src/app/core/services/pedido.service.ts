import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Pedido, EstadoPedido } from '../models/pedido.model';

/** Clave de localStorage para los pedidos. */
const KEY_PEDIDOS = 'retroplay_pedidos';

/**
 * Servicio que administra los pedidos confirmados.
 * Persiste en localStorage y ofrece consultas por cliente y
 * cambio de estado para el panel de administracion.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private storage = inject(StorageService);

  /**
   * Obtiene todos los pedidos.
   * @returns Lista de pedidos.
   */
  obtenerTodos(): Pedido[] {
    return this.storage.obtener<Pedido[]>(KEY_PEDIDOS, []);
  }

  /**
   * Obtiene los pedidos de un cliente especifico.
   * @param correo Correo del cliente.
   * @returns Pedidos del cliente, mas recientes primero.
   */
  obtenerPorCliente(correo: string): Pedido[] {
    return this.obtenerTodos()
      .filter((p) => p.correoCliente === correo)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  /**
   * Crea y persiste un nuevo pedido.
   * @param pedido Pedido completo a guardar.
   */
  crear(pedido: Pedido): void {
    const pedidos = this.obtenerTodos();
    pedidos.push(pedido);
    this.storage.guardar(KEY_PEDIDOS, pedidos);
  }

  /**
   * Cambia el estado de un pedido.
   * @param id Id del pedido.
   * @param estado Nuevo estado.
   */
  cambiarEstado(id: string, estado: EstadoPedido): void {
    const pedidos = this.obtenerTodos();
    const idx = pedidos.findIndex((p) => p.id === id);
    if (idx !== -1) {
      pedidos[idx].estado = estado;
      this.storage.guardar(KEY_PEDIDOS, pedidos);
    }
  }

  /**
   * Suma los ingresos totales de todos los pedidos.
   * @returns Total acumulado en CLP.
   */
  calcularIngresos(): number {
    return this.obtenerTodos().reduce((acc, p) => acc + p.total, 0);
  }

  /**
   * Genera un id de pedido con formato RP-XXXXXXXX.
   * @param semilla Numero base para derivar el id (ej: timestamp).
   * @returns Id formateado.
   */
  generarId(semilla: number): string {
    return 'RP-' + semilla.toString().slice(-8);
  }
}
