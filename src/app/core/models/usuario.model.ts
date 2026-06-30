/**
 * Roles disponibles en RetroPlay.
 * - `admin`: gestiona productos, usuarios, pedidos y solicitudes.
 * - `cliente`: compra y solicita servicios.
 */
export type Rol = 'admin' | 'cliente';

/**
 * Representa un usuario registrado en la aplicacion.
 * Se persiste en localStorage bajo la clave `retroplay_usuarios`.
 */
export interface Usuario {
  /** Nombre completo del usuario. */
  nombre: string;
  /** Nombre de usuario unico (login alternativo). */
  usuario: string;
  /** Correo electronico, usado como identificador principal. */
  correo: string;
  /** Password en texto plano (solo simulacion FrontEnd, no es seguro real). */
  password: string;
  /** Rol que define los privilegios del usuario. */
  rol: Rol;
  /** Direccion de despacho (opcional). */
  direccion?: string;
  /** Telefono de contacto (opcional). */
  telefono?: string;
}

/**
 * Datos de la sesion activa, persistida en sessionStorage.
 * Es una version reducida del usuario, sin la password.
 */
export interface Sesion {
  /** Indica si hay una sesion iniciada. */
  logueado: boolean;
  /** Nombre del usuario en sesion. */
  nombre: string;
  /** Nombre de usuario en sesion. */
  usuario: string;
  /** Correo del usuario en sesion. */
  correo: string;
  /** Rol del usuario en sesion. */
  rol: Rol;
}
