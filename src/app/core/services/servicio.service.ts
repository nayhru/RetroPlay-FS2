import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Servicio, Solicitud, EstadoSolicitud } from '../models/servicio.model';

/** Clave de localStorage para los servicios. */
const KEY_SERVICIOS = 'retroplay_servicios';
/** Clave de la version del seed de servicios. */
const KEY_SERVICIOS_VERSION = 'retroplay_servicios_version';
/** Version actual del seed de servicios. */
const SERVICIOS_VERSION = '1';
/** Clave de localStorage para las solicitudes. */
const KEY_SOLICITUDES = 'retroplay_solicitudes';

/**
 * Servicios ofrecidos por RetroPlay, sembrados al primer arranque.
 */
const SERVICIOS_SEED: Servicio[] = [
  {
    id: 1,
    tipo: 'restauracion',
    nombre: 'Restauracion de cartuchos',
    descripcion:
      'Limpieza profunda de pines, cambio de bateria interna y reparacion de carcasa para que tus cartuchos vuelvan a funcionar como el primer dia.',
    precioDesde: 9990,
    imagen: 'assets/img/servicios/restauracion.webp',
  },
  {
    id: 2,
    tipo: 'gradeado',
    nombre: 'Gradeado de juegos y cartas',
    descripcion:
      'Evaluacion profesional del estado de tus piezas con certificacion sellada. Ideal para coleccionistas y reventa.',
    precioDesde: 14990,
    imagen: 'assets/img/servicios/gradeo.webp',
  },
  {
    id: 3,
    tipo: 'box',
    nombre: 'Box personalizada',
    descripcion:
      'Armamos una box a tu medida. Tu eliges la tematica, plataforma y presupuesto; nosotros curamos los juegos y articulos retro. Las boxes pre-armadas (NES, SNES, Genesis) estan en el catalogo.',
    precioDesde: 69990,
    imagen: 'assets/img/servicios/box-custom.webp',
  },
];

/**
 * Servicio que administra los servicios ofrecidos y las solicitudes
 * que hacen los clientes. Siembra los servicios iniciales y gestiona
 * el ciclo de vida de las solicitudes (estado y cotizacion).
 */
@Injectable({ providedIn: 'root' })
export class ServicioService {
  private storage = inject(StorageService);

  constructor() {
    this.sembrar();
  }

  /**
   * Siembra los servicios si no existen o si cambio la version.
   */
  private sembrar(): void {
    const version = this.storage.obtenerCrudo(KEY_SERVICIOS_VERSION);
    if (!localStorage.getItem(KEY_SERVICIOS) || version !== SERVICIOS_VERSION) {
      this.storage.guardar(KEY_SERVICIOS, SERVICIOS_SEED);
      this.storage.guardarCrudo(KEY_SERVICIOS_VERSION, SERVICIOS_VERSION);
    }
  }

  /**
   * Obtiene todos los servicios ofrecidos.
   * @returns Lista de servicios.
   */
  obtenerServicios(): Servicio[] {
    return this.storage.obtener<Servicio[]>(KEY_SERVICIOS, []);
  }

  /**
   * Busca un servicio por su tipo.
   * @param tipo Tipo de servicio.
   * @returns El servicio o undefined.
   */
  obtenerPorTipo(tipo: string): Servicio | undefined {
    return this.obtenerServicios().find((s) => s.tipo === tipo);
  }

  /**
   * Obtiene todas las solicitudes.
   * @returns Lista de solicitudes.
   */
  obtenerSolicitudes(): Solicitud[] {
    return this.storage.obtener<Solicitud[]>(KEY_SOLICITUDES, []);
  }

  /**
   * Obtiene las solicitudes de un cliente.
   * @param correo Correo del cliente.
   * @returns Solicitudes del cliente, mas recientes primero.
   */
  obtenerSolicitudesPorCliente(correo: string): Solicitud[] {
    return this.obtenerSolicitudes()
      .filter((s) => s.correoCliente === correo)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  /**
   * Crea y persiste una nueva solicitud.
   * @param solicitud Solicitud completa a guardar.
   */
  crearSolicitud(solicitud: Solicitud): void {
    const solicitudes = this.obtenerSolicitudes();
    solicitudes.push(solicitud);
    this.storage.guardar(KEY_SOLICITUDES, solicitudes);
  }

  /**
   * Actualiza el estado y/o la cotizacion de una solicitud.
   * @param id Id de la solicitud.
   * @param estado Nuevo estado.
   * @param cotizacion Monto cotizado (opcional).
   */
  actualizarSolicitud(id: string, estado: EstadoSolicitud, cotizacion?: number): void {
    const solicitudes = this.obtenerSolicitudes();
    const idx = solicitudes.findIndex((s) => s.id === id);
    if (idx === -1) {
      return;
    }
    solicitudes[idx].estado = estado;
    if (cotizacion && cotizacion > 0) {
      solicitudes[idx].cotizacion = cotizacion;
    } else {
      delete solicitudes[idx].cotizacion;
    }
    this.storage.guardar(KEY_SOLICITUDES, solicitudes);
  }

  /**
   * Genera un id de solicitud con formato SV-XXXXXXXX.
   * @param semilla Numero base para derivar el id.
   * @returns Id formateado.
   */
  generarId(semilla: number): string {
    return 'SV-' + semilla.toString().slice(-8);
  }
}
