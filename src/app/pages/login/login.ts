import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { PasswordToggle } from '../../shared/directives/password-toggle';

/**
 * Pagina de inicio de sesion. Usa un formulario reactivo con
 * validaciones de correo y password. Al autenticar correctamente
 * redirige al panel segun el rol del usuario.
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordToggle],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private carrito = inject(CarritoService);
  private router = inject(Router);

  /** Formulario reactivo de login. */
  formLogin!: FormGroup;

  /** Mensaje de error global (credenciales incorrectas). */
  readonly errorLogin = signal<string>('');

  /**
   * Si ya hay sesion, redirige al panel correspondiente.
   * En caso contrario, construye el formulario reactivo.
   */
  ngOnInit(): void {
    const sesion = this.auth.sesion();
    if (sesion) {
      this.router.navigate([sesion.rol === 'admin' ? '/admin' : '/catalogo']);
      return;
    }
    this.formLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Indica si un campo es invalido y ya fue tocado, para mostrar el error.
   * @param campo Nombre del control.
   * @returns true si debe mostrarse el estado invalido.
   */
  esInvalido(campo: string): boolean {
    const control = this.formLogin.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /**
   * Procesa el envio del formulario: valida, autentica y redirige.
   */
  onSubmit(): void {
    this.errorLogin.set('');
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }
    const { correo, password } = this.formLogin.value;
    const usuario = this.auth.login(correo, password);
    if (!usuario) {
      this.errorLogin.set('Credenciales incorrectas. Revisa tu correo y password.');
      return;
    }
    this.carrito.refrescarContador();
    this.router.navigate([usuario.rol === 'admin' ? '/admin' : '/catalogo']);
  }
}
