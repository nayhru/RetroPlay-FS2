import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { ItemCarrito, Producto } from '../models/producto.model';

/** Prefijo de la clave de carrito; se concatena el correo del usuario. */
const KEY_CARRITO = 'retroplay_carrito_';

/**
 * Servicio del carrito de compras. El carrito se guarda por usuario
 * (una clave de localStorage por correo). Expone un signal con el
 * total de items para que la navbar muestre el contador en vivo.
 */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);

  /** Signal con la cantidad total de items en el carrito actual. */
  readonly totalItems = signal<number>(0);

  constructor() {
    this.refrescarContador();
  }

  /**
   * Construye la clave de localStorage del carrito de un usuario.
   * @param correo Correo del usuario.
   * @returns Clave completa.
   */
  private clave(correo: string): string {
    return KEY_CARRITO + correo;
  }

  /**
   * Obtiene el correo del usuario en sesion, o null.
   */
  private correoActual(): string | null {
    return this.auth.sesion()?.correo ?? null;
  }

  /**
   * Obtiene los items del carrito del usuario en sesion.
   * @returns Lista de items (vacia si no hay sesion).
   */
  obtener(): ItemCarrito[] {
    const correo = this.correoActual();
    if (!correo) {
      return [];
    }
    return this.storage.obtener<ItemCarrito[]>(this.clave(correo), []);
  }

  /**
   * Guarda los items del carrito y actualiza el contador.
   * @param items Lista de items a persistir.
   */
  private guardar(items: ItemCarrito[]): void {
    const correo = this.correoActual();
    if (!correo) {
      return;
    }
    this.storage.guardar(this.clave(correo), items);
    this.refrescarContador();
  }

  /**
   * Recalcula el signal totalItems segun el carrito actual.
   */
  refrescarContador(): void {
    const total = this.obtener().reduce((acc, i) => acc + i.cantidad, 0);
    this.totalItems.set(total);
  }

  /**
   * Agrega un producto al carrito respetando el stock disponible.
   * @param producto Producto a agregar.
   * @param cantidad Unidades a agregar (por defecto 1).
   * @returns true si se agrego, o un string con el motivo del error.
   */
  agregar(producto: Producto, cantidad = 1): true | string {
    if (producto.stock === 0) {
      return 'Producto agotado.';
    }
    const items = this.obtener();
    const existente = items.find((i) => i.productoId === producto.id);
    const yaEnCarrito = existente ? existente.cantidad : 0;

    if (yaEnCarrito + cantidad > producto.stock) {
      return `Solo quedan ${producto.stock} unidades disponibles.`;
    }

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad,
      });
    }
    this.guardar(items);
    return true;
  }

  /**
   * Cambia la cantidad de un item del carrito.
   * @param productoId Id del producto.
   * @param cantidad Nueva cantidad.
   */
  actualizarCantidad(productoId: number, cantidad: number): void {
    const items = this.obtener();
    const item = items.find((i) => i.productoId === productoId);
    if (item && cantidad >= 1) {
      item.cantidad = cantidad;
      this.guardar(items);
    }
  }

  /**
   * Elimina un item del carrito.
   * @param productoId Id del producto a quitar.
   */
  eliminar(productoId: number): void {
    const items = this.obtener().filter((i) => i.productoId !== productoId);
    this.guardar(items);
  }

  /**
   * Vacia completamente el carrito del usuario en sesion.
   */
  vaciar(): void {
    const correo = this.correoActual();
    if (!correo) {
      return;
    }
    this.storage.eliminar(this.clave(correo));
    this.refrescarContador();
  }

  /**
   * Calcula el total en CLP del carrito actual.
   * @returns Suma de precio * cantidad de todos los items.
   */
  calcularTotal(): number {
    return this.obtener().reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  }
}
