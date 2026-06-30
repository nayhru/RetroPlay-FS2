/**
 * Tipos de servicio que ofrece RetroPlay.
 */
export type TipoServicio = 'restauracion' | 'gradeado' | 'box';

/**
 * Estados posibles de una solicitud de servicio.
 */
export type EstadoSolicitud =
  | 'pendiente'
  | 'cotizada'
  | 'aceptada'
  | 'en proceso'
  | 'completada'
  | 'rechazada';

/**
 * Representa un servicio ofrecido (restauracion, gradeado, box).
 * Se persiste en localStorage bajo la clave `retroplay_servicios`.
 */
export interface Servicio {
  /** Identificador unico del servicio. */
  id: number;
  /** Tipo de servicio. */
  tipo: TipoServicio;
  /** Nombre visible del servicio. */
  nombre: string;
  /** Descripcion del servicio. */
  descripcion: string;
  /** Precio base desde el cual parte el servicio (CLP). */
  precioDesde: number;
  /** Imagen ilustrativa del servicio. */
  imagen: string;
}

/**
 * Representa una solicitud de servicio hecha por un cliente.
 * Se persiste en localStorage bajo la clave `retroplay_solicitudes`.
 */
export interface Solicitud {
  /** Identificador de la solicitud, formato SV-XXXXXXXX. */
  id: string;
  /** Correo del cliente solicitante. */
  correoCliente: string;
  /** Nombre del cliente solicitante. */
  nombreCliente: string;
  /** Tipo de servicio solicitado. */
  tipo: TipoServicio;
  /** Nombre del item a intervenir (cartucho, juego, carta). */
  nombreItem: string;
  /** Detalle o comentario del cliente. */
  detalle: string;
  /** Direccion de recoleccion o entrega. */
  direccion: string;
  /** Condicion actual del item, 1 a 10 (solo restauracion/gradeado). */
  condicion?: number | null;
  /** Tematica deseada (solo box personalizada). */
  tematicaBox?: string | null;
  /** Presupuesto aproximado en CLP (solo box personalizada). */
  presupuestoBox?: number | null;
  /** Fecha de creacion en formato ISO. */
  fecha: string;
  /** Estado actual de la solicitud. */
  estado: EstadoSolicitud;
  /** Monto cotizado por el admin (opcional). */
  cotizacion?: number;
}
