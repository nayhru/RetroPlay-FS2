import { Injectable, computed, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Usuario, Sesion, Rol } from '../models/usuario.model';

/** Clave de localStorage para el arreglo de usuarios. */
const KEY_USUARIOS = 'retroplay_usuarios';
/** Clave de sessionStorage para la sesion activa. */
const KEY_SESION = 'retroplay_sesion';

/**
 * Usuario administrador sembrado al primer arranque de la app.
 * Permite demostrar la diferencia de roles sin registrar uno a mano.
 */
const ADMIN_INICIAL: Usuario = {
  nombre: 'Administrador RetroPlay',
  usuario: 'admin',
  correo: 'admin@retroplay.cl',
  password: 'Admin123*',
  rol: 'admin',
  direccion: '',
  telefono: '',
};

/**
 * Servicio de autenticacion y manejo de usuarios.
 * Simula el backend con localStorage (usuarios) y sessionStorage
 * (sesion activa). Expone la sesion como signal para que la UI
 * reaccione automaticamente a login/logout.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);

  /** Signal interno con la sesion activa (o null si no hay). */
  private sesionInterna = signal<Sesion | null>(null);

  /** Signal de solo lectura con la sesion activa. */
  readonly sesion = this.sesionInterna.asReadonly();

  /** Signal computado: true si hay una sesion iniciada. */
  readonly logueado = computed(() => this.sesionInterna() !== null);

  /** Signal computado: true si el usuario en sesion es admin. */
  readonly esAdmin = computed(() => this.sesionInterna()?.rol === 'admin');

  /** Signal computado: true si el usuario en sesion es cliente. */
  readonly esCliente = computed(() => this.sesionInterna()?.rol === 'cliente');

  constructor() {
    this.sembrarAdmin();
    this.cargarSesion();
  }

  /**
   * Crea el usuario admin inicial si aun no existe en localStorage.
   */
  private sembrarAdmin(): void {
    const usuarios = this.obtenerUsuarios();
    const existe = usuarios.some((u) => u.correo === ADMIN_INICIAL.correo);
    if (!existe) {
      usuarios.push(ADMIN_INICIAL);
      this.guardarUsuarios(usuarios);
    }
  }

  /**
   * Carga la sesion guardada en sessionStorage hacia el signal.
   */
  private cargarSesion(): void {
    const crudo = sessionStorage.getItem(KEY_SESION);
    if (crudo) {
      try {
        this.sesionInterna.set(JSON.parse(crudo) as Sesion);
      } catch {
        this.sesionInterna.set(null);
      }
    }
  }

  /**
   * Obtiene el arreglo de usuarios desde localStorage.
   * @returns Lista de usuarios registrados.
   */
  obtenerUsuarios(): Usuario[] {
    return this.storage.obtener<Usuario[]>(KEY_USUARIOS, []);
  }

  /**
   * Guarda el arreglo de usuarios en localStorage.
   * @param usuarios Lista completa a persistir.
   */
  guardarUsuarios(usuarios: Usuario[]): void {
    this.storage.guardar(KEY_USUARIOS, usuarios);
  }

  /**
   * Intenta iniciar sesion con correo y password.
   * @param correo Correo ingresado.
   * @param password Password ingresada.
   * @returns El usuario autenticado, o null si las credenciales fallan.
   */
  login(correo: string, password: string): Usuario | null {
    const correoNorm = correo.trim().toLowerCase();
    const usuario = this.obtenerUsuarios().find(
      (u) => u.correo === correoNorm && u.password === password
    );
    if (!usuario) {
      return null;
    }
    const sesion: Sesion = {
      logueado: true,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    sessionStorage.setItem(KEY_SESION, JSON.stringify(sesion));
    this.sesionInterna.set(sesion);
    return usuario;
  }

  /**
   * Cierra la sesion activa.
   */
  logout(): void {
    sessionStorage.removeItem(KEY_SESION);
    this.sesionInterna.set(null);
  }

  /**
   * Registra un nuevo usuario con rol cliente.
   * @param usuario Datos del nuevo usuario (sin rol).
   * @returns true si se registro, o un string con el motivo del error.
   */
  registrar(usuario: Omit<Usuario, 'rol'>): true | string {
    const usuarios = this.obtenerUsuarios();
    const correoNorm = usuario.correo.trim().toLowerCase();

    if (usuarios.some((u) => u.correo === correoNorm)) {
      return 'Este correo ya esta registrado.';
    }
    if (usuarios.some((u) => u.usuario.toLowerCase() === usuario.usuario.toLowerCase())) {
      return 'Este nombre de usuario ya esta en uso.';
    }

    const nuevo: Usuario = {
      ...usuario,
      correo: correoNorm,
      rol: 'cliente',
    };
    usuarios.push(nuevo);
    this.guardarUsuarios(usuarios);
    return true;
  }

  /**
   * Comprueba si un correo ya esta registrado.
   * @param correo Correo a verificar.
   * @returns true si existe.
   */
  existeCorreo(correo: string): boolean {
    const correoNorm = correo.trim().toLowerCase();
    return this.obtenerUsuarios().some((u) => u.correo === correoNorm);
  }

  /**
   * Actualiza la password de un usuario (recuperacion simulada).
   * @param correo Correo del usuario.
   * @param nuevaPassword Nueva password ya validada.
   * @returns true si se actualizo, false si el correo no existe.
   */
  recuperarPassword(correo: string, nuevaPassword: string): boolean {
    const usuarios = this.obtenerUsuarios();
    const correoNorm = correo.trim().toLowerCase();
    const idx = usuarios.findIndex((u) => u.correo === correoNorm);
    if (idx === -1) {
      return false;
    }
    usuarios[idx].password = nuevaPassword;
    this.guardarUsuarios(usuarios);
    return true;
  }

  /**
   * Obtiene el usuario completo de la sesion activa.
   * @returns El usuario, o undefined si no hay sesion.
   */
  usuarioActual(): Usuario | undefined {
    const correo = this.sesionInterna()?.correo;
    if (!correo) {
      return undefined;
    }
    return this.obtenerUsuarios().find((u) => u.correo === correo);
  }

  /**
   * Actualiza los datos editables del perfil del usuario en sesion.
   * @param datos Nombre, telefono y direccion nuevos.
   */
  actualizarPerfil(datos: Pick<Usuario, 'nombre' | 'telefono' | 'direccion'>): void {
    const correo = this.sesionInterna()?.correo;
    if (!correo) {
      return;
    }
    const usuarios = this.obtenerUsuarios();
    const idx = usuarios.findIndex((u) => u.correo === correo);
    if (idx === -1) {
      return;
    }
    usuarios[idx] = { ...usuarios[idx], ...datos };
    this.guardarUsuarios(usuarios);

    // Refrescar el nombre en la sesion para que la navbar lo muestre.
    const sesion = this.sesionInterna();
    if (sesion) {
      const actualizada: Sesion = { ...sesion, nombre: datos.nombre };
      sessionStorage.setItem(KEY_SESION, JSON.stringify(actualizada));
      this.sesionInterna.set(actualizada);
    }
  }

  /**
   * Cambia la password del usuario en sesion, verificando la actual.
   * @param actual Password actual ingresada.
   * @param nueva Nueva password ya validada.
   * @returns true si se cambio, o un string con el motivo del error.
   */
  cambiarPassword(actual: string, nueva: string): true | string {
    const usuario = this.usuarioActual();
    if (!usuario) {
      return 'No hay sesion activa.';
    }
    if (usuario.password !== actual) {
      return 'La password actual es incorrecta.';
    }
    if (nueva === actual) {
      return 'La nueva password debe ser distinta a la actual.';
    }
    const usuarios = this.obtenerUsuarios();
    const idx = usuarios.findIndex((u) => u.correo === usuario.correo);
    usuarios[idx].password = nueva;
    this.guardarUsuarios(usuarios);
    return true;
  }
}
