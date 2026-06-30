import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { passwordSegura, passwordsCoinciden, telefonoValido } from '../../core/validators/validadores';
import { PasswordToggle } from '../../shared/directives/password-toggle';

/**
 * Pagina de registro de clientes. Formulario reactivo con todas
 * las validaciones: nombre, usuario, correo, telefono opcional,
 * password segura (4 reglas) y confirmacion que debe coincidir.
 */
@Component({
  selector: 'app-registro',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordToggle],
  templateUrl: './registro.html',
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** Formulario reactivo de registro. */
  formRegistro!: FormGroup;

  /** Mensaje de exito o error global. */
  readonly mensaje = signal<string>('');

  /**
   * Construye el formulario con sus validaciones.
   */
  ngOnInit(): void {
    this.formRegistro = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        usuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,20}$/)]],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', [telefonoValido()]],
        direccion: [''],
        password: ['', [Validators.required, passwordSegura()]],
        confirmarPassword: ['', [Validators.required]],
      },
      { validators: passwordsCoinciden('password', 'confirmarPassword') }
    );
  }

  /**
   * Indica si un campo es invalido y ya fue tocado.
   * @param campo Nombre del control.
   * @returns true si debe mostrarse el estado invalido.
   */
  esInvalido(campo: string): boolean {
    const control = this.formRegistro.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /**
   * Indica si el grupo marca que las passwords no coinciden
   * (y el campo confirmar ya fue tocado).
   * @returns true si no coinciden.
   */
  get noCoinciden(): boolean {
    const confirmar = this.formRegistro.get('confirmarPassword');
    return (
      this.formRegistro.hasError('noCoinciden') &&
      !!confirmar &&
      (confirmar.touched || confirmar.dirty)
    );
  }

  /**
   * Procesa el envio: valida, registra y redirige al login.
   */
  onSubmit(): void {
    this.mensaje.set('');
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    const { nombre, usuario, correo, telefono, direccion, password } = this.formRegistro.value;
    const resultado = this.auth.registrar({
      nombre,
      usuario,
      correo,
      telefono,
      direccion,
      password,
    });

    if (resultado === true) {
      alert('Cuenta creada con exito. Ahora puedes iniciar sesion.');
      this.router.navigate(['/login']);
    } else {
      // Mensaje de duplicado (correo o usuario).
      this.mensaje.set(resultado);
    }
  }
}
