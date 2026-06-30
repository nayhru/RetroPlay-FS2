import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ServicioService } from '../../core/services/servicio.service';
import { passwordSegura, passwordsCoinciden, telefonoValido } from '../../core/validators/validadores';
import { Usuario } from '../../core/models/usuario.model';
import { Pedido } from '../../core/models/pedido.model';
import { Solicitud, TipoServicio } from '../../core/models/servicio.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';
import { PasswordToggle } from '../../shared/directives/password-toggle';

/**
 * Pagina de perfil. Permite editar datos personales y cambiar la
 * password (verificando la actual) con formularios reactivos. Si el
 * usuario es cliente, muestra ademas su historial de pedidos y
 * solicitudes. Protegida por rolGuard(['cliente', 'admin']).
 */
@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ClpPipe, PasswordToggle],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private pedidoService = inject(PedidoService);
  private servicioService = inject(ServicioService);

  /** Usuario en sesion. */
  readonly usuario = signal<Usuario | undefined>(undefined);
  /** Formulario de datos personales. */
  formPerfil!: FormGroup;
  /** Formulario de cambio de password. */
  formPassword!: FormGroup;
  /** Mensajes de exito. */
  readonly msgPerfil = signal<string>('');
  readonly msgPassword = signal<string>('');
  /** Pedidos del cliente. */
  readonly pedidos = signal<Pedido[]>([]);
  /** Solicitudes del cliente. */
  readonly solicitudes = signal<Solicitud[]>([]);

  /** Etiquetas por tipo de servicio. */
  readonly etiquetaTipo: Record<TipoServicio, string> = {
    restauracion: 'Restauracion de cartucho',
    gradeado: 'Gradeado de juego o carta',
    box: 'Box personalizada',
  };

  /**
   * Carga el usuario y arma los formularios. Si es cliente, carga
   * su historial de pedidos y solicitudes.
   */
  ngOnInit(): void {
    const usuario = this.auth.usuarioActual();
    this.usuario.set(usuario);

    this.formPerfil = this.fb.group({
      nombre: [usuario?.nombre ?? '', [Validators.required, Validators.minLength(3)]],
      telefono: [usuario?.telefono ?? '', [telefonoValido()]],
      direccion: [usuario?.direccion ?? ''],
    });

    this.formPassword = this.fb.group(
      {
        actual: ['', [Validators.required]],
        nueva: ['', [Validators.required, passwordSegura()]],
        confirmar: ['', [Validators.required]],
      },
      { validators: passwordsCoinciden('nueva', 'confirmar') }
    );

    if (usuario?.rol === 'cliente') {
      this.pedidos.set(this.pedidoService.obtenerPorCliente(usuario.correo));
      this.solicitudes.set(this.servicioService.obtenerSolicitudesPorCliente(usuario.correo));
    }
  }

  /** True si el usuario en sesion es cliente. */
  get esCliente(): boolean {
    return this.usuario()?.rol === 'cliente';
  }

  /**
   * Indica si un campo de un formulario es invalido y fue tocado.
   * @param form Formulario a consultar.
   * @param campo Nombre del control.
   */
  esInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /** True si las nuevas passwords no coinciden y confirmar fue tocado. */
  get noCoinciden(): boolean {
    const confirmar = this.formPassword.get('confirmar');
    return (
      this.formPassword.hasError('noCoinciden') &&
      !!confirmar &&
      (confirmar.touched || confirmar.dirty)
    );
  }

  /**
   * Guarda los datos personales editados.
   */
  guardarPerfil(): void {
    this.msgPerfil.set('');
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }
    this.auth.actualizarPerfil(this.formPerfil.value);
    this.usuario.set(this.auth.usuarioActual());
    this.msgPerfil.set('Datos actualizados correctamente.');
  }

  /**
   * Cambia la password verificando la actual.
   */
  guardarPassword(): void {
    this.msgPassword.set('');
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    const { actual, nueva } = this.formPassword.value;
    const resultado = this.auth.cambiarPassword(actual, nueva);
    if (resultado === true) {
      this.formPassword.reset();
      this.msgPassword.set('Password actualizada correctamente.');
    } else {
      this.msgPassword.set(resultado);
    }
  }

  /**
   * Formatea una fecha ISO a formato local chileno.
   * @param iso Fecha en formato ISO.
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
