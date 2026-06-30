import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { ProductoService } from '../../core/services/producto.service';
import { PedidoService } from '../../core/services/pedido.service';
import { telefonoValido } from '../../core/validators/validadores';
import { ItemCarrito } from '../../core/models/producto.model';
import { Pedido } from '../../core/models/pedido.model';
import { ClpPipe } from '../../shared/pipes/clp-pipe';

/**
 * Pagina de checkout con pago simulado. Valida datos de envio y de
 * pago mediante un formulario reactivo (con validadores dinamicos
 * para los datos de tarjeta), descuenta stock, crea el pedido y
 * muestra la pantalla de exito. No procesa pagos reales.
 */
@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ClpPipe],
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private carrito = inject(CarritoService);
  private productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);

  /** Formulario reactivo de checkout. */
  formCheckout!: FormGroup;
  /** Items del carrito al momento de pagar. */
  readonly items = signal<ItemCarrito[]>([]);
  /** Total a pagar. */
  readonly total = signal<number>(0);
  /** Controla si se muestra la vista de exito. */
  readonly pagado = signal<boolean>(false);
  /** Numero de orden generado. */
  readonly numeroOrden = signal<string>('');
  /** Correo de confirmacion. */
  readonly correoConfirmacion = signal<string>('');
  /** Error global del formulario. */
  readonly errorGlobal = signal<string>('');

  /**
   * Carga el carrito, prellena datos del perfil y arma el formulario.
   */
  ngOnInit(): void {
    this.items.set(this.carrito.obtener());
    this.total.set(this.carrito.calcularTotal());

    const usuario = this.auth.usuarioActual();

    this.formCheckout = this.fb.group({
      nombreEnvio: [usuario?.nombre ?? '', [Validators.required]],
      telefonoEnvio: [usuario?.telefono ?? '', [Validators.required, telefonoValido()]],
      direccionEnvio: [usuario?.direccion ?? '', [Validators.required]],
      comunaEnvio: ['', [Validators.required]],
      metodoPago: ['', [Validators.required]],
      numTarjeta: [''],
      vencTarjeta: [''],
      cvvTarjeta: [''],
    });

    // Validadores dinamicos: solo exigir tarjeta si el metodo lo requiere.
    this.formCheckout.get('metodoPago')?.valueChanges.subscribe((metodo) => {
      this.aplicarValidadoresTarjeta(metodo === 'credito' || metodo === 'debito');
    });
  }

  /**
   * Agrega o quita los validadores de los campos de tarjeta.
   * @param requiere true si el metodo de pago exige tarjeta.
   */
  private aplicarValidadoresTarjeta(requiere: boolean): void {
    const num = this.formCheckout.get('numTarjeta');
    const venc = this.formCheckout.get('vencTarjeta');
    const cvv = this.formCheckout.get('cvvTarjeta');

    if (requiere) {
      num?.setValidators([Validators.required, Validators.pattern(/^\d{13,19}$/)]);
      venc?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]);
      cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else {
      num?.clearValidators();
      venc?.clearValidators();
      cvv?.clearValidators();
    }
    num?.updateValueAndValidity();
    venc?.updateValueAndValidity();
    cvv?.updateValueAndValidity();
  }

  /** Indica si el metodo de pago elegido requiere datos de tarjeta. */
  get requiereTarjeta(): boolean {
    const m = this.formCheckout?.get('metodoPago')?.value;
    return m === 'credito' || m === 'debito';
  }

  /**
   * Indica si un campo es invalido y ya fue tocado.
   * @param campo Nombre del control.
   */
  esInvalido(campo: string): boolean {
    const control = this.formCheckout.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /**
   * Autoformatea el numero de tarjeta en bloques de 4 digitos.
   * @param valor Valor crudo del input.
   */
  formatearTarjeta(valor: string): void {
    const limpio = valor.replace(/\D/g, '').slice(0, 19);
    const bloques = limpio.match(/.{1,4}/g);
    this.formCheckout.get('numTarjeta')?.setValue(bloques ? bloques.join(' ') : limpio, {
      emitEvent: false,
    });
  }

  /**
   * Autoformatea el vencimiento como MM/AA.
   * @param valor Valor crudo del input.
   */
  formatearVencimiento(valor: string): void {
    let limpio = valor.replace(/\D/g, '').slice(0, 4);
    if (limpio.length > 2) {
      limpio = limpio.slice(0, 2) + '/' + limpio.slice(2);
    }
    this.formCheckout.get('vencTarjeta')?.setValue(limpio, { emitEvent: false });
  }

  /**
   * Procesa el pago simulado: valida, descuenta stock, crea el pedido
   * y muestra la pantalla de exito.
   */
  pagar(): void {
    this.errorGlobal.set('');

    // El numero de tarjeta puede llevar espacios del autoformato.
    const numLimpio = (this.formCheckout.get('numTarjeta')?.value || '').replace(/\s/g, '');
    if (this.requiereTarjeta) {
      this.formCheckout.get('numTarjeta')?.setValue(numLimpio, { emitEvent: false });
    }

    if (this.formCheckout.invalid) {
      this.formCheckout.markAllAsTouched();
      this.errorGlobal.set('Revisa los campos marcados en rojo.');
      return;
    }

    // Revalidar stock antes de confirmar.
    const items = this.carrito.obtener();
    for (const item of items) {
      const prod = this.productoService.obtenerPorId(item.productoId);
      if (!prod || prod.stock < item.cantidad) {
        this.errorGlobal.set(`Stock insuficiente para "${item.nombre}". Ajusta tu carrito.`);
        return;
      }
    }

    // Descontar stock.
    items.forEach((item) => this.productoService.descontarStock(item.productoId, item.cantidad));

    // Crear el pedido.
    const sesion = this.auth.sesion()!;
    const v = this.formCheckout.value;
    const idOrden = this.pedidoService.generarId(Date.now());
    const pedido: Pedido = {
      id: idOrden,
      correoCliente: sesion.correo,
      nombreCliente: v.nombreEnvio,
      telefono: v.telefonoEnvio,
      direccion: `${v.direccionEnvio}, ${v.comunaEnvio}`,
      metodoPago: v.metodoPago,
      items,
      total: this.total(),
      fecha: new Date().toISOString(),
      estado: 'pagado',
    };
    this.pedidoService.crear(pedido);

    // Vaciar carrito y mostrar exito.
    this.carrito.vaciar();
    this.numeroOrden.set(idOrden);
    this.correoConfirmacion.set(sesion.correo);
    this.pagado.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
