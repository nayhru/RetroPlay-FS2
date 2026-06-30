import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

/**
 * Pruebas unitarias del AuthService. Verifican el sembrado del
 * admin, el registro de clientes (evitando duplicados) y el flujo
 * de login / logout. Se limpia el almacenamiento antes de cada test.
 */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('debe crearse e iniciar sin sesion activa', () => {
    expect(service).toBeTruthy();
    expect(service.logueado()).toBeFalse();
  });

  it('debe sembrar el usuario admin al iniciar', () => {
    const admin = service.obtenerUsuarios().find((u) => u.correo === 'admin@retroplay.cl');
    expect(admin).toBeTruthy();
    expect(admin?.rol).toBe('admin');
  });

  it('debe registrar un cliente nuevo y permitir su login', () => {
    const resultado = service.registrar({
      nombre: 'Pedro Lopez',
      usuario: 'pedro.lopez',
      correo: 'pedro@test.cl',
      password: 'Retro123*',
      telefono: '',
      direccion: '',
    });
    expect(resultado).toBeTrue();

    const usuario = service.login('pedro@test.cl', 'Retro123*');
    expect(usuario).toBeTruthy();
    expect(usuario?.rol).toBe('cliente');
    expect(service.logueado()).toBeTrue();
  });

  it('debe rechazar el registro con un correo duplicado', () => {
    const datos = {
      nombre: 'Ana Soto',
      usuario: 'ana.soto',
      correo: 'ana@test.cl',
      password: 'Retro123*',
      telefono: '',
      direccion: '',
    };
    service.registrar(datos);
    const segundo = service.registrar({ ...datos, usuario: 'ana.soto2' });
    expect(segundo).toBe('Este correo ya esta registrado.');
  });

  it('debe cerrar la sesion correctamente', () => {
    service.registrar({
      nombre: 'Luis Diaz',
      usuario: 'luis.diaz',
      correo: 'luis@test.cl',
      password: 'Retro123*',
      telefono: '',
      direccion: '',
    });
    service.login('luis@test.cl', 'Retro123*');
    expect(service.logueado()).toBeTrue();
    service.logout();
    expect(service.logueado()).toBeFalse();
  });
});
