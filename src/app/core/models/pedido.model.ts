import { ItemCarrito } from './producto.model';

/**
 * Estados posibles de un pedido a lo largo de su ciclo de vida.
 */
export type EstadoPedido = 'pagado' | 'preparando' | 'enviado' | 'entregado';

/**
 * Representa un pedido confirmado tras el checkout.
 * Se persiste en localStorage bajo la clave `retroplay_pedidos`.
 */
export interface Pedido {
  /** Identificador del pedido, formato RP-XXXXXXXX. */
  id: string;
  /** Correo del cliente que realizo el pedido. */
  correoCliente: string;
  /** Nombre del cliente para el despacho. */
  nombreCliente: string;
  /** Telefono de contacto. */
  telefono: string;
  /** Direccion de despacho completa. */
  direccion: string;
  /** Metodo de pago elegido (credito, debito, transferencia). */
  metodoPago: string;
  /** Items comprados. */
  items: ItemCarrito[];
  /** Total pagado en CLP. */
  total: number;
  /** Fecha de creacion en formato ISO. */
  fecha: string;
  /** Estado actual del pedido. */
  estado: EstadoPedido;
}
