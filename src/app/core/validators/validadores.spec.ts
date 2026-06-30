import { FormControl, FormGroup } from '@angular/forms';
import { passwordSegura, passwordsCoinciden, telefonoValido } from './validadores';

/**
 * Pruebas unitarias de los validadores reactivos de RetroPlay.
 * Verifican las reglas de password segura, coincidencia de
 * passwords y formato de telefono.
 */
describe('Validadores reactivos', () => {
  // ---- passwordSegura ----
  describe('passwordSegura', () => {
    const validar = passwordSegura();

    it('debe rechazar una password debil (sin mayuscula, numero ni especial)', () => {
      const control = new FormControl('password');
      expect(validar(control)).toEqual({ passwordInsegura: true });
    });

    it('debe rechazar una password corta aunque tenga variedad', () => {
      const control = new FormControl('Ab1*');
      expect(validar(control)).toEqual({ passwordInsegura: true });
    });

    it('debe aceptar una password que cumple las 4 reglas', () => {
      const control = new FormControl('Retro123*');
      expect(validar(control)).toBeNull();
    });
  });

  // ---- passwordsCoinciden ----
  describe('passwordsCoinciden', () => {
    const grupoValidador = passwordsCoinciden('password', 'confirmar');

    it('debe marcar error si las passwords no coinciden', () => {
      const grupo = new FormGroup({
        password: new FormControl('Retro123*'),
        confirmar: new FormControl('Otra123*'),
      });
      expect(grupoValidador(grupo)).toEqual({ noCoinciden: true });
    });

    it('debe pasar si las passwords son iguales', () => {
      const grupo = new FormGroup({
        password: new FormControl('Retro123*'),
        confirmar: new FormControl('Retro123*'),
      });
      expect(grupoValidador(grupo)).toBeNull();
    });
  });

  // ---- telefonoValido ----
  describe('telefonoValido', () => {
    const validar = telefonoValido();

    it('debe aceptar un telefono vacio (campo opcional)', () => {
      expect(validar(new FormControl(''))).toBeNull();
    });

    it('debe rechazar un telefono con letras', () => {
      expect(validar(new FormControl('telefono'))).toEqual({ telefonoInvalido: true });
    });

    it('debe aceptar un telefono chileno valido', () => {
      expect(validar(new FormControl('+56 9 1234 5678'))).toBeNull();
    });
  });
});
