import { AfterViewInit, Directive, ElementRef, Renderer2, inject } from '@angular/core';

/**
 * Directiva que agrega un boton VER / OCULTAR a un input de password.
 * Envuelve el input en un contenedor y alterna su tipo entre
 * `password` y `text` al hacer clic, permitiendo al usuario revisar
 * lo que escribio. Reutilizable en cualquier campo de password.
 *
 * @example
 * <input type="password" appPasswordToggle formControlName="password">
 */
@Directive({
  selector: 'input[appPasswordToggle]',
})
export class PasswordToggle implements AfterViewInit {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private renderer = inject(Renderer2);

  /**
   * Tras renderizar la vista, envuelve el input y agrega el boton toggle.
   */
  ngAfterViewInit(): void {
    const input = this.el.nativeElement;
    const padre = input.parentNode as HTMLElement;
    if (!padre) {
      return;
    }

    // Envolver el input en un contenedor posicionado.
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'password-wrapper');
    this.renderer.insertBefore(padre, wrapper, input);
    this.renderer.removeChild(padre, input);
    this.renderer.appendChild(wrapper, input);

    // Crear el boton VER / OCULTAR.
    const boton = this.renderer.createElement('button');
    this.renderer.setAttribute(boton, 'type', 'button');
    this.renderer.addClass(boton, 'password-toggle');
    this.renderer.setAttribute(boton, 'aria-label', 'Mostrar password');
    this.renderer.appendChild(boton, this.renderer.createText('VER'));

    this.renderer.listen(boton, 'click', () => {
      const esPassword = input.type === 'password';
      input.type = esPassword ? 'text' : 'password';
      boton.textContent = esPassword ? 'OCULTAR' : 'VER';
    });

    this.renderer.appendChild(wrapper, boton);
  }
}
