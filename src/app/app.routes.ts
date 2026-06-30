import { Routes } from '@angular/router';
import { rolGuard } from './core/guards/rol.guard';

/**
 * Definicion de rutas de la aplicacion. Usa carga diferida
 * (loadComponent) para cada pagina y protege las rutas privadas
 * con rolGuard segun el rol requerido.
 */
export const routes: Routes = [
  // Publicas
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'RetroPlay | Inicio',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'RetroPlay | Ingresar',
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
    title: 'RetroPlay | Crear cuenta',
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/recuperar/recuperar').then((m) => m.Recuperar),
    title: 'RetroPlay | Recuperar password',
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo),
    title: 'RetroPlay | Catalogo',
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./pages/detalle/detalle').then((m) => m.Detalle),
    title: 'RetroPlay | Detalle',
  },
  {
    path: 'servicios',
    loadComponent: () => import('./pages/servicios/servicios').then((m) => m.Servicios),
    title: 'RetroPlay | Servicios',
  },

  // Cliente
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then((m) => m.Carrito),
    canActivate: [rolGuard(['cliente'])],
    title: 'RetroPlay | Mi carrito',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
    canActivate: [rolGuard(['cliente'])],
    title: 'RetroPlay | Pagar',
  },
  {
    path: 'solicitar-servicio',
    loadComponent: () =>
      import('./pages/solicitar-servicio/solicitar-servicio').then((m) => m.SolicitarServicio),
    canActivate: [rolGuard(['cliente'])],
    title: 'RetroPlay | Solicitar servicio',
  },

  // Cliente o admin
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
    canActivate: [rolGuard(['cliente', 'admin'])],
    title: 'RetroPlay | Mi perfil',
  },

  // Admin
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [rolGuard(['admin'])],
    title: 'RetroPlay | Panel admin',
  },
  {
    path: 'admin/productos',
    loadComponent: () =>
      import('./pages/admin/admin-productos/admin-productos').then((m) => m.AdminProductos),
    canActivate: [rolGuard(['admin'])],
    title: 'RetroPlay | Admin Productos',
  },
  {
    path: 'admin/usuarios',
    loadComponent: () =>
      import('./pages/admin/admin-usuarios/admin-usuarios').then((m) => m.AdminUsuarios),
    canActivate: [rolGuard(['admin'])],
    title: 'RetroPlay | Admin Usuarios',
  },
  {
    path: 'admin/pedidos',
    loadComponent: () =>
      import('./pages/admin/admin-pedidos/admin-pedidos').then((m) => m.AdminPedidos),
    canActivate: [rolGuard(['admin'])],
    title: 'RetroPlay | Admin Pedidos',
  },
  {
    path: 'admin/solicitudes',
    loadComponent: () =>
      import('./pages/admin/admin-solicitudes/admin-solicitudes').then((m) => m.AdminSolicitudes),
    canActivate: [rolGuard(['admin'])],
    title: 'RetroPlay | Admin Solicitudes',
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
