import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Coleccion de validadores reutilizables para los formularios
 * reactivos de RetroPlay. Centraliza las reglas para no
 * repetirlas en login, registro, recuperar, perfil y checkout.
 */

/**
 * Valida que una password sea segura. Aplica 4 reglas de seguridad:
 * - Entre 8 y 16 caracteres.
 * - Al menos una mayuscula y una minuscula.
 * - Al menos un numero.
 * - Al menos un caracter especial (! @ # $ % & * ? . _ -).
 *
 * @returns Un ValidatorFn que retorna `{ passwordInsegura: true }` si no cumple.
 */
export function passwordSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (!valor) {
      return null; // El validador required se encarga del vacio.
    }
    const largoOk = valor.length >= 8 && valor.length <= 16;
    const tieneMayus = /[A-Z]/.test(valor);
    const tieneMin = /[a-z]/.test(valor);
    const tieneNum = /\d/.test(valor);
    const tieneEsp = /[!@#$%&*?._-]/.test(valor);
    const esSegura = largoOk && tieneMayus && tieneMin && tieneNum && tieneEsp;
    return esSegura ? null : { passwordInsegura: true };
  };
}

/**
 * Valida formato basico de telefono chileno o internacional.
 * Acepta numeros, espacios, parentesis, guiones y +, de 8 a 15 caracteres.
 *
 * @returns Un ValidatorFn que retorna `{ telefonoInvalido: true }` si no cumple.
 */
export function telefonoValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (!valor) {
      return null; // Telefono opcional: el vacio lo maneja required si aplica.
    }
    const patron = /^[+\d\s()-]{8,15}$/;
    return patron.test(valor) ? null : { telefonoInvalido: true };
  };
}

/**
 * Validador a nivel de grupo que verifica que dos campos de password
 * coincidan. Marca un error en el grupo si los valores son distintos.
 *
 * @param campoPassword Nombre del control con la password.
 * @param campoConfirmar Nombre del control de confirmacion.
 * @returns Un ValidatorFn de grupo que retorna `{ noCoinciden: true }` si difieren.
 */
export function passwordsCoinciden(
  campoPassword: string,
  campoConfirmar: string
): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const pass = grupo.get(campoPassword)?.value;
    const confirmar = grupo.get(campoConfirmar)?.value;
    if (!confirmar) {
      return null;
    }
    return pass === confirmar ? null : { noCoinciden: true };
  };
}
