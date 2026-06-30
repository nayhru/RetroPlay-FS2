import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { CarritoService } from '../../core/services/carrito.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto } from '../../core/models/producto.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';

/**
 * Pagina de detalle de un producto. Lee el id desde la ruta,
 * muestra la ficha completa y permite elegir cantidad (ngModel)
 * y agregar al carrito respetando el stock.
 */
@Component({
  selector: 'app-detalle',
  imports: [CommonModule, FormsModule, RouterLink, ClpPipe],
  templateUrl: './detalle.html',
})
export class Detalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private carrito = inject(CarritoService);
  private auth = inject(AuthService);

  /** Producto encontrado (o null si no existe). */
  readonly producto = signal<Producto | null>(null);
  /** Cantidad elegida (enlazada con ngModel). */
  cantidad = 1;
  /** Mensaje de feedback al agregar. */
  readonly mensaje = signal<string>('');
  /** Tipo de mensaje para estilizar el alert (ok / warn). */
  readonly mensajeTipo = signal<'ok' | 'warn'>('ok');

  /**
   * Carga el producto segun el id de la ruta.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const prod = this.productoService.obtenerPorId(id);
    this.producto.set(prod ?? null);
  }

  /**
   * Agrega el producto al carrito con la cantidad elegida.
   * Controla los casos sin sesion, rol admin y stock insuficiente.
   */
  agregar(): void {
    const prod = this.producto();
    if (!prod) {
      return;
    }
    const sesion = this.auth.sesion();
    if (!sesion) {
      this.mostrar('warn', 'Para comprar necesitas iniciar sesion o crear una cuenta.');
      return;
    }
    if (sesion.rol === 'admin') {
      this.mostrar('warn', 'El admin no compra. Inicia sesion como cliente.');
      return;
    }
    if (this.cantidad < 1) {
      this.mostrar('warn', 'La cantidad debe ser al menos 1.');
      return;
    }
    const resultado = this.carrito.agregar(prod, this.cantidad);
    if (resultado === true) {
      this.mostrar('ok', 'Agregado al carrito.');
    } else {
      this.mostrar('warn', resultado);
    }
  }

  /**
   * Helper para fijar mensaje y su tipo.
   * @param tipo ok o warn.
   * @param texto Mensaje a mostrar.
   */
  private mostrar(tipo: 'ok' | 'warn', texto: string): void {
    this.mensajeTipo.set(tipo);
    this.mensaje.set(texto);
  }

  /**
   * Navega de vuelta al catalogo.
   */
  volverCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }
}
