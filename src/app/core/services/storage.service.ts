import { Injectable } from '@angular/core';

/**
 * Servicio generico para leer y escribir en localStorage.
 * Centraliza el acceso al almacenamiento del navegador y
 * maneja la conversion JSON, evitando repetir JSON.parse /
 * JSON.stringify en cada servicio.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /**
   * Obtiene un valor parseado desde localStorage.
   * @param clave Clave bajo la cual se guardo el dato.
   * @param porDefecto Valor a retornar si la clave no existe.
   * @returns El valor parseado o el valor por defecto.
   */
  obtener<T>(clave: string, porDefecto: T): T {
    const crudo = localStorage.getItem(clave);
    if (crudo === null) {
      return porDefecto;
    }
    try {
      return JSON.parse(crudo) as T;
    } catch {
      return porDefecto;
    }
  }

  /**
   * Guarda un valor en localStorage serializandolo a JSON.
   * @param clave Clave bajo la cual se guardara.
   * @param valor Valor a almacenar.
   */
  guardar<T>(clave: string, valor: T): void {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  /**
   * Elimina una clave de localStorage.
   * @param clave Clave a eliminar.
   */
  eliminar(clave: string): void {
    localStorage.removeItem(clave);
  }

  /**
   * Lee un valor simple (string) desde localStorage sin parsear.
   * @param clave Clave a leer.
   * @returns El string almacenado o null.
   */
  obtenerCrudo(clave: string): string | null {
    return localStorage.getItem(clave);
  }

  /**
   * Guarda un valor simple (string) sin serializar.
   * @param clave Clave a escribir.
   * @param valor String a guardar.
   */
  guardarCrudo(clave: string, valor: string): void {
    localStorage.setItem(clave, valor);
  }
}
