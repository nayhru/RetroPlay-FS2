import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

/**
 * Pruebas unitarias del componente Login. Verifican que el
 * componente se cree, que el formulario inicie invalido al estar
 * vacio y que la validacion de correo funcione correctamente.
 */
describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe ser invalido cuando esta vacio', () => {
    expect(component.formLogin.valid).toBeFalse();
  });

  it('debe marcar invalido un correo con formato incorrecto', () => {
    const correo = component.formLogin.get('correo');
    correo?.setValue('correo-malo');
    expect(correo?.valid).toBeFalse();
  });

  it('debe aceptar un correo con formato valido', () => {
    const correo = component.formLogin.get('correo');
    correo?.setValue('persona@correo.cl');
    expect(correo?.valid).toBeTrue();
  });

  it('el formulario debe ser valido con correo y password correctos', () => {
    component.formLogin.setValue({ correo: 'persona@correo.cl', password: 'Retro123*' });
    expect(component.formLogin.valid).toBeTrue();
  });
});
