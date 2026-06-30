import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProductoService } from '../../../core/services/producto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { Pedido } from '../../../core/models/pedido.model';
import { Solicitud } from '../../../core/models/servicio.model';
import { ClpPipe } from '../../../shared/pipes/clp-pipe';

/** Estructura de una tarjeta de metrica del dashboard. */
interface Metrica {
  titulo: string;
  valor: string | number;
  link: string;
  color: string;
}

/**
 * Dashboard del administrador. Muestra metricas calculadas del
 * sistema (clientes, productos, pedidos, ingresos, solicitudes
 * pendientes y stock bajo) y los ultimos movimientos.
 * Protegido por rolGuard(['admin']).
 */
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, ClpPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private auth = inject(AuthService);
  private productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);
  private servicioService = inject(ServicioService);

  /** Nombre del admin en sesion. */
  readonly nombreAdmin = signal<string>('');
  /** Metricas a mostrar en tarjetas. */
  readonly metricas = signal<Metrica[]>([]);
  /** Ultimos 5 pedidos. */
  readonly ultimosPedidos = signal<Pedido[]>([]);
  /** Ultimas 5 solicitudes. */
  readonly ultimasSolicitudes = signal<Solicitud[]>([]);

  /** Etiquetas cortas por tipo de servicio. */
  readonly etiquetaTipo: Record<string, string> = {
    restauracion: 'Restauracion',
    gradeado: 'Gradeado',
    box: 'Box personalizada',
  };

  /**
   * Calcula las metricas y carga los ultimos movimientos.
   */
  ngOnInit(): void {
    this.nombreAdmin.set(this.auth.sesion()?.nombre ?? 'Admin');

    const clientes = this.auth.obtenerUsuarios().filter((u) => u.rol === 'cliente').length;
    const productos = this.productoService.obtenerTodos();
    const pedidos = this.pedidoService.obtenerTodos();
    const solicitudes = this.servicioService.obtenerSolicitudes();
    const ingresos = this.pedidoService.calcularIngresos();
    const pendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;
    const stockBajo = productos.filter((p) => p.stock <= 2).length;

    this.metricas.set([
      { titulo: 'Clientes', valor: clientes, link: '/admin/usuarios', color: 'var(--rp-red)' },
      { titulo: 'Productos', valor: productos.length, link: '/admin/productos', color: 'var(--rp-ink)' },
      { titulo: 'Pedidos', valor: pedidos.length, link: '/admin/pedidos', color: 'var(--rp-cyan)' },
      { titulo: 'Ingresos', valor: new ClpPipe().transform(ingresos), link: '/admin/pedidos', color: 'var(--rp-red)' },
      { titulo: 'Solic. pendientes', valor: pendientes, link: '/admin/solicitudes', color: 'var(--rp-yellow)' },
      { titulo: 'Stock bajo', valor: stockBajo, link: '/admin/productos', color: 'var(--rp-red)' },
    ]);

    this.ultimosPedidos.set(
      [...pedidos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)
    );
    this.ultimasSolicitudes.set(
      [...solicitudes].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)
    );
  }
}
