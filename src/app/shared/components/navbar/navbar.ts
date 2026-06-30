import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';

/**
 * Barra de navegacion principal. Muestra opciones distintas segun
 * el estado de la sesion y el rol del usuario:
 * - Publico: Ingresar / Registrarme.
 * - Cliente: Carrito (con contador) / Perfil / Cerrar sesion.
 * - Admin: Panel Admin / Perfil / Cerrar sesion.
 *
 * Usa la directiva *ngIf para mostrar/ocultar segun rol y los
 * signals del AuthService y CarritoService para reaccionar en vivo.
 */
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
})
export class Navbar {
  /** Servicio de autenticacion (sesion y rol como signals). */
  protected auth = inject(AuthService);
  /** Servicio de carrito (contador de items como signal). */
  protected carrito = inject(CarritoService);

  /**
   * Cierra la sesion actual y recarga la navegacion publica.
   */
  cerrarSesion(): void {
    this.auth.logout();
  }
}
