import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { passwordSegura, passwordsCoinciden } from '../../core/validators/validadores';
import { PasswordToggle } from '../../shared/directives/password-toggle';

/**
 * Pagina de recuperacion de password (simulada). Verifica que el
 * correo exista y reemplaza la password por una nueva que cumpla
 * las reglas de seguridad. Formulario reactivo.
 */
@Component({
  selector: 'app-recuperar',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordToggle],
  templateUrl: './recuperar.html',
})
export class Recuperar implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** Formulario reactivo de recuperacion. */
  formRecuperar!: FormGroup;

  /** Mensaje de error global. */
  readonly errorGlobal = signal<string>('');

  /**
   * Construye el formulario con sus validaciones.
   */
  ngOnInit(): void {
    this.formRecuperar = this.fb.group(
      {
        correo: ['', [Validators.required, Validators.email]],
        nuevoPassword: ['', [Validators.required, passwordSegura()]],
        confirmarPassword: ['', [Validators.required]],
      },
      { validators: passwordsCoinciden('nuevoPassword', 'confirmarPassword') }
    );
  }

  /**
   * Indica si un campo es invalido y ya fue tocado.
   * @param campo Nombre del control.
   */
  esInvalido(campo: string): boolean {
    const control = this.formRecuperar.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /**
   * Indica si las passwords no coinciden y confirmar fue tocado.
   */
  get noCoinciden(): boolean {
    const confirmar = this.formRecuperar.get('confirmarPassword');
    return (
      this.formRecuperar.hasError('noCoinciden') &&
      !!confirmar &&
      (confirmar.touched || confirmar.dirty)
    );
  }

  /**
   * Procesa el envio: valida, verifica el correo y actualiza la password.
   */
  onSubmit(): void {
    this.errorGlobal.set('');
    if (this.formRecuperar.invalid) {
      this.formRecuperar.markAllAsTouched();
      return;
    }
    const { correo, nuevoPassword } = this.formRecuperar.value;
    const ok = this.auth.recuperarPassword(correo, nuevoPassword);
    if (!ok) {
      this.errorGlobal.set('Este correo no esta registrado.');
      return;
    }
    alert('Password actualizada con exito. Ahora puedes iniciar sesion.');
    this.router.navigate(['/login']);
  }
}
