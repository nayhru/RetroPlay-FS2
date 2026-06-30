import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../../core/services/servicio.service';
import { Solicitud, EstadoSolicitud, TipoServicio } from '../../../core/models/servicio.model';
import { ClpPipe } from '../../../shared/pipes/clp-pipe';

/**
 * Gestion de solicitudes de servicio para el administrador. Lista
 * con filtros (ngModel), permite ver el detalle, ingresar una
 * cotizacion y cambiar el estado. Protegido por rolGuard(['admin']).
 */
@Component({
  selector: 'app-admin-solicitudes',
  imports: [CommonModule, FormsModule, RouterLink, ClpPipe],
  templateUrl: './admin-solicitudes.html',
})
export class AdminSolicitudes implements OnInit {
  private servicioService = inject(ServicioService);

  /** Solicitudes cargadas. */
  private solicitudes = signal<Solicitud[]>([]);
  /** Filtros (ngModel). */
  busqueda = '';
  tipo = '';
  estado = '';

  /** Estados posibles. */
  readonly estados: EstadoSolicitud[] = [
    'pendiente', 'cotizada', 'aceptada', 'en proceso', 'completada', 'rechazada',
  ];
  /** Etiquetas por tipo. */
  readonly etiquetaTipo: Record<TipoServicio, string> = {
    restauracion: 'Restauracion de cartucho',
    gradeado: 'Gradeado de juego o carta',
    box: 'Box personalizada',
  };

  /**
   * Carga las solicitudes al iniciar.
   */
  ngOnInit(): void {
    this.refrescar();
  }

  /**
   * Relee las solicitudes.
   */
  private refrescar(): void {
    this.solicitudes.set(this.servicioService.obtenerSolicitudes());
  }

  /**
   * Devuelve las solicitudes filtradas; pendientes primero.
   */
  solicitudesFiltradas(): Solicitud[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.solicitudes()
      .filter((s) => {
        const coincideTipo = !this.tipo || s.tipo === this.tipo;
        const coincideEstado = !this.estado || s.estado === this.estado;
        const coincideTxt =
          !texto ||
          s.id.toLowerCase().includes(texto) ||
          s.correoCliente.toLowerCase().includes(texto) ||
          s.nombreItem.toLowerCase().includes(texto);
        return coincideTipo && coincideEstado && coincideTxt;
      })
      .sort((a, b) => {
        if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
        if (b.estado === 'pendiente' && a.estado !== 'pendiente') return 1;
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });
  }

  /**
   * Guarda la cotizacion y el estado de una solicitud.
   * @param id Id de la solicitud.
   * @param cotizacion Monto cotizado (string del input).
   * @param estado Nuevo estado.
   */
  guardar(id: string, cotizacion: string, estado: string): void {
    const monto = parseInt(cotizacion, 10);
    this.servicioService.actualizarSolicitud(
      id,
      estado as EstadoSolicitud,
      isNaN(monto) ? undefined : monto
    );
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
