import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ServicioService } from '../../core/services/servicio.service';
import { Servicio, Solicitud, TipoServicio } from '../../core/models/servicio.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';

/**
 * Formulario de solicitud de servicio. Segun el tipo elegido
 * muestra campos dinamicos: condicion (1-10) para restauracion y
 * gradeado, o tematica + presupuesto para la box personalizada.
 * Protegido por rolGuard(['cliente']).
 */
@Component({
  selector: 'app-solicitar-servicio',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ClpPipe],
  templateUrl: './solicitar-servicio.html',
})
export class SolicitarServicio implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private servicioService = inject(ServicioService);
  private route = inject(ActivatedRoute);

  /** Formulario reactivo de solicitud. */
  formSolicitud!: FormGroup;
  /** Controla la vista de exito. */
  readonly enviada = signal<boolean>(false);
  /** Numero de solicitud generado. */
  readonly numeroSolicitud = signal<string>('');
  /** Correo de confirmacion. */
  readonly correoConfirmacion = signal<string>('');
  /** Error global. */
  readonly errorGlobal = signal<string>('');
  /** Servicio seleccionado (para el panel lateral). */
  readonly servicioSel = signal<Servicio | undefined>(undefined);

  /** Etiquetas legibles por tipo de servicio. */
  readonly etiquetaTipo: Record<TipoServicio, string> = {
    restauracion: 'Restauracion de cartucho',
    gradeado: 'Gradeado de juego o carta',
    box: 'Box personalizada',
  };

  /**
   * Arma el formulario, aplica el tipo inicial del query param y
   * prellena la direccion del perfil.
   */
  ngOnInit(): void {
    this.formSolicitud = this.fb.group({
      tipoServicio: ['', [Validators.required]],
      nombreItem: ['', [Validators.required, Validators.minLength(3)]],
      detalle: ['', [Validators.required, Validators.minLength(10)]],
      direccion: ['', [Validators.required]],
      condicion: [null],
      tematicaBox: [''],
      presupuestoBox: [null],
    });

    // Prellenar direccion del perfil.
    const usuario = this.auth.usuarioActual();
    if (usuario?.direccion) {
      this.formSolicitud.get('direccion')?.setValue(usuario.direccion);
    }

    // Reaccionar al cambio de tipo para los validadores dinamicos.
    this.formSolicitud.get('tipoServicio')?.valueChanges.subscribe((tipo: string) => {
      this.aplicarValidadoresDinamicos(tipo as TipoServicio);
      this.servicioSel.set(this.servicioService.obtenerPorTipo(tipo));
    });

    // Tipo inicial desde ?tipo=
    const tipoInicial = this.route.snapshot.queryParamMap.get('tipo');
    if (tipoInicial && ['restauracion', 'gradeado', 'box'].includes(tipoInicial)) {
      this.formSolicitud.get('tipoServicio')?.setValue(tipoInicial);
    }
  }

  /**
   * Ajusta los validadores de los campos dinamicos segun el tipo.
   * @param tipo Tipo de servicio elegido.
   */
  private aplicarValidadoresDinamicos(tipo: TipoServicio): void {
    const condicion = this.formSolicitud.get('condicion');
    const tematica = this.formSolicitud.get('tematicaBox');
    const presupuesto = this.formSolicitud.get('presupuestoBox');

    // Reset.
    condicion?.clearValidators();
    tematica?.clearValidators();
    presupuesto?.clearValidators();

    if (tipo === 'restauracion' || tipo === 'gradeado') {
      condicion?.setValidators([Validators.required, Validators.min(1), Validators.max(10)]);
    } else if (tipo === 'box') {
      tematica?.setValidators([Validators.required, Validators.minLength(3)]);
      presupuesto?.setValidators([Validators.required, Validators.min(69990)]);
    }

    condicion?.updateValueAndValidity();
    tematica?.updateValueAndValidity();
    presupuesto?.updateValueAndValidity();
  }

  /** Tipo actualmente seleccionado. */
  get tipoActual(): string {
    return this.formSolicitud?.get('tipoServicio')?.value ?? '';
  }

  /** True si el tipo requiere campo de condicion. */
  get requiereCondicion(): boolean {
    return this.tipoActual === 'restauracion' || this.tipoActual === 'gradeado';
  }

  /** True si el tipo es box personalizada. */
  get esBox(): boolean {
    return this.tipoActual === 'box';
  }

  /**
   * Indica si un campo es invalido y ya fue tocado.
   * @param campo Nombre del control.
   */
  esInvalido(campo: string): boolean {
    const control = this.formSolicitud.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /**
   * Procesa el envio: valida, crea la solicitud y muestra el exito.
   */
  onSubmit(): void {
    this.errorGlobal.set('');
    if (this.formSolicitud.invalid) {
      this.formSolicitud.markAllAsTouched();
      this.errorGlobal.set('Revisa los campos marcados en rojo.');
      return;
    }

    const sesion = this.auth.sesion()!;
    const v = this.formSolicitud.value;
    const tipo = v.tipoServicio as TipoServicio;
    const id = this.servicioService.generarId(Date.now());

    const solicitud: Solicitud = {
      id,
      correoCliente: sesion.correo,
      nombreCliente: sesion.nombre,
      tipo,
      nombreItem: v.nombreItem,
      detalle: v.detalle,
      direccion: v.direccion,
      condicion: this.requiereCondicion ? Number(v.condicion) : null,
      tematicaBox: this.esBox ? v.tematicaBox : null,
      presupuestoBox: this.esBox ? Number(v.presupuestoBox) : null,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
    };
    this.servicioService.crearSolicitud(solicitud);

    this.numeroSolicitud.set(id);
    this.correoConfirmacion.set(sesion.correo);
    this.enviada.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
