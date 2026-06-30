import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Producto } from '../models/producto.model';

/** Clave de localStorage para los productos. */
const KEY_PRODUCTOS = 'retroplay_productos';
/** Clave que guarda la version del seed de productos. */
const KEY_PRODUCTOS_VERSION = 'retroplay_productos_version';
/** Version actual del seed. Al subirla, se reescriben los productos. */
const PRODUCTOS_VERSION = '1';

/**
 * Productos iniciales del catalogo. Se siembran la primera vez
 * o cuando cambia PRODUCTOS_VERSION.
 */
const PRODUCTOS_SEED: Producto[] = [
  { id: 1, nombre: 'Super Mario Bros (NES)', categoria: 'juegos', plataforma: 'NES', precio: 24990, stock: 5, descripcion: 'Cartucho original NES en buen estado. El clasico de los clasicos.', imagen: 'assets/img/productos/supermariones.webp', destacado: true, oferta: true },
  { id: 2, nombre: 'Sonic the Hedgehog (Genesis)', categoria: 'juegos', plataforma: 'Sega Genesis', precio: 19990, stock: 4, descripcion: 'Cartucho Genesis. La velocidad del erizo azul en su splendor.', imagen: 'assets/img/productos/Sonic-the-Hedgehog-Genesis.webp', destacado: true, oferta: true },
  { id: 3, nombre: 'The Legend of Zelda (NES)', categoria: 'juegos', plataforma: 'NES', precio: 39990, stock: 2, descripcion: 'Cartucho dorado original. Pieza de coleccion.', imagen: 'assets/img/productos/The-Legend-of-Zelda---Nintendo.webp', destacado: true, oferta: false },
  { id: 4, nombre: 'Game Boy Classic (gris)', categoria: 'consolas', plataforma: 'Game Boy', precio: 89990, stock: 3, descripcion: 'Consola portatil clasica de 1989. Funcional, con pantalla revisada.', imagen: 'assets/img/productos/game-boy-classic.webp', destacado: true, oferta: false },
  { id: 5, nombre: 'Super Nintendo (SNES)', categoria: 'consolas', plataforma: 'SNES', precio: 149990, stock: 2, descripcion: 'Consola SNES con dos controles y cables. Test completo.', imagen: 'assets/img/productos/snes.webp', destacado: false, oferta: false },
  { id: 6, nombre: 'Sega Genesis (Mega Drive)', categoria: 'consolas', plataforma: 'Sega Genesis', precio: 119990, stock: 2, descripcion: 'Consola Sega Genesis modelo 2. Excelente estado estetico.', imagen: 'assets/img/productos/Consola-sega-mega-drive.webp', destacado: false, oferta: true },
  { id: 7, nombre: 'Control NES original', categoria: 'accesorios', plataforma: 'NES', precio: 14990, stock: 8, descripcion: 'Control rectangular clasico de NES. Cable en buen estado.', imagen: 'assets/img/productos/mando-original-nintendo-nes.webp', destacado: false, oferta: false },
  { id: 8, nombre: 'Walkman Sony WM-EX', categoria: 'accesorios', plataforma: 'Audio', precio: 69990, stock: 1, descripcion: 'Walkman a casette estilo 90s. Funciona y trae audifonos retro.', imagen: 'assets/img/productos/Walkman-Sony-WM-EX.webp', destacado: true, oferta: false },
  { id: 9, nombre: 'Poster Street Fighter II', categoria: 'merch', plataforma: 'Decoracion', precio: 9990, stock: 10, descripcion: 'Poster 60x90 estilo arcade 90s. Papel mate de alta calidad.', imagen: 'assets/img/productos/Poster-Street-Fighter-II.webp', destacado: false, oferta: true },
  { id: 10, nombre: 'Box Tematica NES Collector', categoria: 'boxes', plataforma: 'Box', precio: 49990, stock: 6, descripcion: 'Caja sorpresa con 3 juegos NES + poster + llavero coleccionable.', imagen: 'assets/img/productos/box-nes.webp', destacado: true, oferta: false },
];

/**
 * Servicio que administra el catalogo de productos.
 * Siembra los datos iniciales y ofrece operaciones CRUD para
 * el panel de administracion.
 */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private storage = inject(StorageService);

  constructor() {
    this.sembrar();
  }

  /**
   * Siembra el catalogo si no existe o si cambio la version del seed.
   */
  private sembrar(): void {
    const version = this.storage.obtenerCrudo(KEY_PRODUCTOS_VERSION);
    if (!localStorage.getItem(KEY_PRODUCTOS) || version !== PRODUCTOS_VERSION) {
      this.storage.guardar(KEY_PRODUCTOS, PRODUCTOS_SEED);
      this.storage.guardarCrudo(KEY_PRODUCTOS_VERSION, PRODUCTOS_VERSION);
    }
  }

  /**
   * Obtiene todos los productos del catalogo.
   * @returns Lista de productos.
   */
  obtenerTodos(): Producto[] {
    return this.storage.obtener<Producto[]>(KEY_PRODUCTOS, []);
  }

  /**
   * Busca un producto por su id.
   * @param id Identificador del producto.
   * @returns El producto o undefined si no existe.
   */
  obtenerPorId(id: number): Producto | undefined {
    return this.obtenerTodos().find((p) => p.id === id);
  }

  /**
   * Devuelve solo los productos marcados como destacados.
   * @returns Lista de productos destacados.
   */
  obtenerDestacados(): Producto[] {
    return this.obtenerTodos().filter((p) => p.destacado);
  }

  /**
   * Persiste el arreglo completo de productos.
   * @param productos Lista a guardar.
   */
  guardarTodos(productos: Producto[]): void {
    this.storage.guardar(KEY_PRODUCTOS, productos);
  }

  /**
   * Crea un producto nuevo asignandole el siguiente id disponible.
   * @param producto Datos del producto sin id.
   * @returns El producto creado con su id.
   */
  crear(producto: Omit<Producto, 'id'>): Producto {
    const productos = this.obtenerTodos();
    const nuevoId = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
    const nuevo: Producto = { ...producto, id: nuevoId };
    productos.push(nuevo);
    this.guardarTodos(productos);
    return nuevo;
  }

  /**
   * Actualiza un producto existente.
   * @param producto Producto con los datos modificados (incluye id).
   */
  actualizar(producto: Producto): void {
    const productos = this.obtenerTodos();
    const idx = productos.findIndex((p) => p.id === producto.id);
    if (idx !== -1) {
      productos[idx] = producto;
      this.guardarTodos(productos);
    }
  }

  /**
   * Elimina un producto por id.
   * @param id Identificador del producto a eliminar.
   */
  eliminar(id: number): void {
    const productos = this.obtenerTodos().filter((p) => p.id !== id);
    this.guardarTodos(productos);
  }

  /**
   * Descuenta stock de un producto (al confirmar un pedido).
   * @param id Id del producto.
   * @param cantidad Unidades a descontar.
   */
  descontarStock(id: number, cantidad: number): void {
    const productos = this.obtenerTodos();
    const prod = productos.find((p) => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cantidad);
      this.guardarTodos(productos);
    }
  }
}
