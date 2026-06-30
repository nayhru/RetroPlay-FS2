import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { ClpPipe } from '../../../shared/pipes/clp-pipe';

/** Referencia al modal de Bootstrap cargado por CDN. */
declare const bootstrap: any;

/**
 * CRUD de productos para el administrador. Lista en tabla con
 * filtros (ngModel), y crea / edita / elimina mediante un modal
 * de Bootstrap con formulario reactivo y validaciones.
 * Protegido por rolGuard(['admin']).
 */
@Component({
  selector: 'app-admin-productos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ClpPipe],
  templateUrl: './admin-productos.html',
})
export class AdminProductos implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);

  /** Referencia al elemento del modal. */
  @ViewChild('modalProducto') modalRef!: ElementRef<HTMLElement>;
  /** Instancia del modal de Bootstrap. */
  private modal: any;

  /** Lista de productos. */
  readonly productos = signal<Producto[]>([]);
  /** Filtros (ngModel). */
  busqueda = '';
  categoria = '';
  /** Titulo del modal segun crear/editar. */
  readonly tituloModal = signal<string>('Nuevo producto');
  /** Formulario reactivo del producto. */
  formProducto!: FormGroup;
  /** Error dentro del modal. */
  readonly errorModal = signal<string>('');

  /** Categorias para el select de filtro y del formulario. */
  readonly categorias = ['juegos', 'consolas', 'accesorios', 'merch', 'boxes'];

  /**
   * Carga los productos y arma el formulario del modal.
   */
  ngOnInit(): void {
    this.refrescar();
    this.formProducto = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['juegos', [Validators.required]],
      plataforma: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      imagen: ['', [Validators.required, Validators.pattern(/^(https?:\/\/|assets\/).+/)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      destacado: [false],
      oferta: [false],
    });
  }

  /**
   * Relee los productos desde el servicio.
   */
  private refrescar(): void {
    this.productos.set(this.productoService.obtenerTodos());
  }

  /**
   * Devuelve los productos filtrados por busqueda y categoria.
   */
  productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.productos().filter((p) => {
      const coincideCat = !this.categoria || p.categoria === this.categoria;
      const coincideTxt =
        !texto ||
        p.nombre.toLowerCase().includes(texto) ||
        p.plataforma.toLowerCase().includes(texto);
      return coincideCat && coincideTxt;
    });
  }

  /**
   * Indica si un campo del formulario es invalido y fue tocado.
   * @param campo Nombre del control.
   */
  esInvalido(campo: string): boolean {
    const control = this.formProducto.get(campo);
    return !!control && control.invalid && control.touched;
  }

  /**
   * Abre el modal en modo creacion.
   */
  abrirCrear(): void {
    this.tituloModal.set('Nuevo producto');
    this.errorModal.set('');
    this.formProducto.reset({ categoria: 'juegos', destacado: false, oferta: false });
    this.abrirModal();
  }

  /**
   * Abre el modal en modo edicion con los datos del producto.
   * @param producto Producto a editar.
   */
  abrirEditar(producto: Producto): void {
    this.tituloModal.set('Editar producto');
    this.errorModal.set('');
    this.formProducto.setValue({
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      plataforma: producto.plataforma,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      destacado: producto.destacado,
      oferta: producto.oferta,
    });
    this.abrirModal();
  }

  /**
   * Muestra el modal de Bootstrap.
   */
  private abrirModal(): void {
    if (!this.modal) {
      this.modal = new bootstrap.Modal(this.modalRef.nativeElement);
    }
    this.modal.show();
  }

  /**
   * Guarda el producto (crea o actualiza segun tenga id).
   */
  guardar(): void {
    this.errorModal.set('');
    if (this.formProducto.invalid) {
      this.formProducto.markAllAsTouched();
      this.errorModal.set('Revisa los campos marcados en rojo.');
      return;
    }
    const v = this.formProducto.value;
    if (v.id) {
      this.productoService.actualizar(v as Producto);
    } else {
      const { id, ...sinId } = v;
      this.productoService.crear(sinId as Omit<Producto, 'id'>);
    }
    this.modal?.hide();
    this.refrescar();
  }

  /**
   * Elimina un producto tras confirmar.
   * @param id Id del producto.
   */
  eliminar(id: number): void {
    if (!confirm('Eliminar este producto del catalogo?')) {
      return;
    }
    this.productoService.eliminar(id);
    this.refrescar();
  }

  /**
   * Limpia los filtros de la tabla.
   */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoria = '';
  }
}
