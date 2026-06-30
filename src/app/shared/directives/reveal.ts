import { Directive, ElementRef, OnInit, inject } from '@angular/core';

/**
 * Directiva de atributo que aplica una animacion de aparicion
 * (fade-in + desplazamiento) cuando el elemento entra en el viewport.
 * Usa IntersectionObserver para no depender de librerias externas.
 *
 * @example
 * <div appReveal>Aparezco al hacer scroll</div>
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealOnScroll implements OnInit {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Al iniciar, marca el elemento con la clase `reveal` y observa
   * su entrada al viewport para agregar la clase `revealed`.
   */
  ngOnInit(): void {
    const nodo = this.el.nativeElement;
    nodo.classList.add('reveal');

    if (!('IntersectionObserver' in window)) {
      nodo.classList.add('revealed');
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            nodo.classList.add('revealed');
            observador.unobserve(nodo);
          }
        });
      },
      { threshold: 0.12 }
    );

    observador.observe(nodo);
  }
}
