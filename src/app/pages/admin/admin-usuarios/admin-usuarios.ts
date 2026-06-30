import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { Usuario } from '../../../core/models/usuario.model';
import { ClpPipe } from '../../../shared/pipes/clp-pipe';

/**
 * Listado de usuarios para el administrador. Muestra todos los
 * registrados con estadisticas calculadas (cantidad de pedidos y
 * total gastado). Filtra por texto y rol con ngModel.
 * Protegido por rolGuard(['admin']).
 */
@Component({
  selector: 'app-admin-usuarios',
  imports: [CommonModule, FormsModule, RouterLink, ClpPipe],
  templateUrl: './admin-usuarios.html',
})
export class AdminUsuarios implements OnInit {
  private auth = inject(AuthService);
  private pedidoService = inject(PedidoService);

  /** Todos los usuarios. */
  private usuarios = signal<Usuario[]>([]);
  /** Filtros (ngModel). */
  busqueda = '';
  rol = '';

  /**
   * Carga los usuarios al iniciar.
   */
  ngOnInit(): void {
    this.usuarios.set(this.auth.obtenerUsuarios());
  }

  /**
   * Devuelve los usuarios filtrados por texto y rol.
   */
  usuariosFiltrados(): Usuario[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.usuarios().filter((u) => {
      const coincideRol = !this.rol || u.rol === this.rol;
      const coincideTxt =
        !texto ||
        u.nombre.toLowerCase().includes(texto) ||
        u.correo.toLowerCase().includes(texto) ||
        u.usuario.toLowerCase().includes(texto);
      return coincideRol && coincideTxt;
    });
  }

  /**
   * Cuenta los pedidos de un usuario.
   * @param correo Correo del usuario.
   */
  cantidadPedidos(correo: string): number {
    return this.pedidoService.obtenerPorCliente(correo).length;
  }

  /**
   * Suma el total gastado por un usuario.
   * @param correo Correo del usuario.
   */
  totalGastado(correo: string): number {
    return this.pedidoService.obtenerPorCliente(correo).reduce((acc, p) => acc + p.total, 0);
  }
}
