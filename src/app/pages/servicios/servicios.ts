import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../core/services/servicio.service';
import { Servicio } from '../../core/models/servicio.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';
import { RevealOnScroll } from '../../shared/directives/reveal';

/**
 * Pagina publica de servicios. Lista los servicios ofrecidos
 * (restauracion, gradeado, box personalizada) con *ngFor, mas una
 * seccion de preguntas frecuentes y un llamado a la accion.
 */
@Component({
  selector: 'app-servicios',
  imports: [CommonModule, RouterLink, ClpPipe, RevealOnScroll],
  templateUrl: './servicios.html',
})
export class Servicios {
  private servicioService = inject(ServicioService);

  /** Servicios ofrecidos. */
  readonly servicios = signal<Servicio[]>(this.servicioService.obtenerServicios());
}
