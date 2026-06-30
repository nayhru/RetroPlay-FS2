/**
 * Categorias de productos del catalogo RetroPlay.
 */
export type CategoriaProducto =
  | 'juegos'
  | 'consolas'
  | 'accesorios'
  | 'merch'
  | 'boxes';

/**
 * Representa un producto del catalogo.
 * Se persiste en localStorage bajo la clave `retroplay_productos`.
 */
export interface Producto {
  /** Identificador unico del producto. */
  id: number;
  /** Nombre visible del producto. */
  nombre: string;
  /** Categoria a la que pertenece. */
  categoria: CategoriaProducto;
  /** Plataforma o tipo (NES, SNES, Game Boy, Audio, etc.). */
  plataforma: string;
  /** Precio en pesos chilenos (CLP). */
  precio: number;
  /** Unidades disponibles en inventario. */
  stock: number;
  /** Descripcion breve del producto. */
  descripcion: string;
  /** Ruta de la imagen del producto. */
  imagen: string;
  /** Si aparece en la seccion de destacados del home. */
  destacado: boolean;
  /** Si se muestra con sticker de oferta. */
  oferta: boolean;
}

/**
 * Item dentro del carrito de compras.
 * Guarda una copia de los datos del producto al momento de agregarlo.
 */
export interface ItemCarrito {
  /** Id del producto agregado. */
  productoId: number;
  /** Nombre del producto. */
  nombre: string;
  /** Precio unitario al momento de agregar. */
  precio: number;
  /** Imagen del producto. */
  imagen: string;
  /** Cantidad de unidades en el carrito. */
  cantidad: number;
}
