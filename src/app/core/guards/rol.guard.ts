import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';

/**
 * Guard funcional que protege rutas segun el rol del usuario.
 * Si no hay sesion, redirige al login. Si el rol no esta permitido,
 * redirige al panel que corresponda (admin o catalogo).
 *
 * @param rolesPermitidos Roles que pueden acceder a la ruta.
 * @returns Un CanActivateFn para usar en la definicion de rutas.
 *
 * @example
 * { path: 'admin', canActivate: [rolGuard(['admin'])], ... }
 */
export function rolGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const sesion = auth.sesion();

    if (!sesion) {
      router.navigate(['/login']);
      return false;
    }

    if (!rolesPermitidos.includes(sesion.rol)) {
      router.navigate([sesion.rol === 'admin' ? '/admin' : '/catalogo']);
      return false;
    }

    return true;
  };
}
