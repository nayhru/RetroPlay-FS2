import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { CarritoService } from '../../core/services/carrito.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto } from '../../core/models/producto.model';
import { ProductoCard } from '../../shared/components/producto-card/producto-card';

/**
 * Catalogo publico de productos. Permite filtrar por categoria y
 * buscar por nombre/plataforma usando ngModel (formulario template).
 * Renderiza tarjetas reutilizables y agrega al carrito reaccionando
 * al evento @Output de cada tarjeta.
 */
@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule, ProductoCard],
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  private productoService = inject(ProductoService);
  private carrito = inject(CarritoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Texto de busqueda (enlazado con ngModel). */
  busqueda = '';
  /** Categoria seleccionada (enlazado con ngModel). */
  categoria = '';

  /** Mensaje de feedback al agregar al carrito. */
  readonly feedback = signal<string>('');

  /** Lista completa de productos. */
  private todos: Producto[] = [];

  /** Categorias disponibles para los chips/select. */
  readonly categorias = [
    { valor: '', etiqueta: 'Todas' },
    { valor: 'juegos', etiqueta: 'Juegos' },
    { valor: 'consolas', etiqueta: 'Consolas' },
    { valor: 'accesorios', etiqueta: 'Accesorios' },
    { valor: 'merch', etiqueta: 'Merch' },
    { valor: 'boxes', etiqueta: 'Boxes' },
  ];

  /**
   * Carga los productos y aplica el filtro de categoria inicial
   * que venga por query param (?cat=).
   */
  ngOnInit(): void {
    this.todos = this.productoService.obtenerTodos();
    const cat = this.route.snapshot.queryParamMap.get('cat');
    if (cat) {
      this.categoria = cat;
    }
  }

  /**
   * Devuelve los productos que cumplen el filtro de texto y categoria.
   * @returns Lista filtrada de productos.
   */
  productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.todos.filter((p) => {
      const coincideCat = !this.categoria || p.categoria === this.categoria;
      const coincideTxt =
        !texto ||
        p.nombre.toLowerCase().includes(texto) ||
        p.plataforma.toLowerCase().includes(texto);
      return coincideCat && coincideTxt;
    });
  }

  /**
   * Fija la categoria activa al hacer clic en un chip.
   * @param valor Valor de la categoria.
   */
  filtrarPorChip(valor: string): void {
    this.categoria = valor;
  }

  /**
   * Limpia los filtros de busqueda y categoria.
   */
  limpiar(): void {
    this.busqueda = '';
    this.categoria = '';
  }

  /**
   * Maneja el evento de agregar al carrito emitido por una tarjeta.
   * Controla los casos sin sesion y de rol admin.
   * @param producto Producto a agregar.
   */
  onAgregar(producto: Producto): void {
    const sesion = this.auth.sesion();
    if (!sesion) {
      if (confirm('Para comprar necesitas tu cuenta. Vamos al login?')) {
        this.router.navigate(['/login']);
      }
      return;
    }
    if (sesion.rol === 'admin') {
      this.feedback.set('El admin no puede comprar. Inicia sesion como cliente.');
      return;
    }
    const resultado = this.carrito.agregar(producto, 1);
    this.feedback.set(resultado === true ? `"${producto.nombre}" agregado al carrito.` : resultado);
    setTimeout(() => this.feedback.set(''), 3500);
  }
}
