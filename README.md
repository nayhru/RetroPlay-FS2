# RetroPlay (Angular)

Entrega de la Sumativa 2 del ramo Desarrollo Full Stack II (DSY2202, Duoc UC). Es la misma tienda retro de la Sumativa 1, pero ahora reconstruida en **Angular** aplicando calidad: componentes, rutas, formularios reactivos, validaciones, pruebas unitarias y documentacion.

Sigue siendo una tienda de videojuegos y articulos retro de los 80s y 90s, con servicios de restauracion de cartuchos, gradeado y boxes personalizadas. La persistencia sigue simulada con localStorage y sessionStorage (esta etapa del ramo es solo FrontEnd).

## Stack

- Angular 20 (componentes standalone, signals, control de rutas con lazy loading)
- TypeScript
- Bootstrap 5.3.3 (grid de 12 columnas, responsive) por CDN
- Google Fonts: Anton, Special Elite, VT323
- Jasmine + Karma para pruebas unitarias
- Compodoc para la documentacion del codigo
- localStorage / sessionStorage para simular persistencia

## Como correrlo

Primero instalar dependencias (una sola vez):

```bash
npm install
```

Levantar el servidor de desarrollo:

```bash
npm start
```

Luego abrir `http://localhost:4200`. La app recarga sola al guardar cambios.

## Cuentas de prueba

El admin se siembra solo al primer arranque:

- Correo: `admin@retroplay.cl`
- Password: `Admin123*`

Para el rol cliente, crea una cuenta desde la pantalla de registro (queda con rol cliente automaticamente).

## Pruebas unitarias

```bash
npm test
```

Esto ejecuta Karma con Jasmine. Hay 19 pruebas repartidas en:

- `core/validators/validadores.spec.ts`: reglas de password segura, coincidencia de passwords y formato de telefono.
- `pages/login/login.spec.ts`: el componente se crea, el formulario inicia invalido y la validacion de correo funciona.
- `core/services/auth.service.spec.ts`: sembrado del admin, registro + login, rechazo de correos duplicados y logout.
- `app.spec.ts`: el componente raiz se crea.

Para correrlas una sola vez sin modo watch (como en el video):

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Documentacion del codigo

El proyecto usa Compodoc. Todo el codigo (componentes, servicios, modelos, pipes, directivas y guard) esta comentado con JSDoc.

Generar la documentacion:

```bash
npm run docs
```

Generar y abrir en el navegador (sirve en http://localhost:8080):

```bash
npm run docs:serve
```

La documentacion se genera en la carpeta `documentacion/`.

## Estructura del proyecto

```
src/app/
├── core/
│   ├── models/         interfaces (Usuario, Producto, Pedido, Servicio, Solicitud)
│   ├── services/       storage, auth, producto, carrito, pedido, servicio
│   ├── validators/     validadores reactivos reutilizables
│   └── guards/         rolGuard (protege rutas por rol)
├── shared/
│   ├── components/     navbar, footer, producto-card (Input/Output)
│   ├── pipes/          clp (formato de pesos)
│   └── directives/     reveal (fade-in), password-toggle (ver/ocultar)
├── pages/
│   ├── home, login, registro, recuperar
│   ├── catalogo, detalle, carrito, checkout
│   ├── servicios, solicitar-servicio, perfil
│   └── admin/          dashboard, productos, usuarios, pedidos, solicitudes
├── app.routes.ts       rutas con lazy loading + guards
├── app.config.ts
└── app.ts              layout: navbar + router-outlet + footer
```

## Como se cubre la pauta (Semana 6)

| Criterio | Donde |
|---|---|
| Git y trabajo colaborativo | Repositorio del proyecto |
| App en Angular (migrar HTML/CSS/Bootstrap) | Todo el proyecto, estilos en `src/styles.css` |
| Datos estaticos + directivas (*ngIf, *ngFor, ngModel) + paso de datos | Navbar (*ngIf), catalogo (*ngFor + ngModel), producto-card (@Input/@Output) |
| Libreria de documentacion | Compodoc (`npm run docs`) + JSDoc en todo el codigo |
| Formularios reactivos con validaciones | login, registro, recuperar, perfil, checkout, solicitar-servicio |
| Pruebas unitarias | 19 tests con Jasmine/Karma (`npm test`) |
| Video de presentacion | Grabacion en Kaltura |

## Roles

- **admin**: dashboard con metricas, CRUD de productos, ver usuarios, gestionar pedidos y solicitudes.
- **cliente**: catalogo, carrito, checkout simulado, solicitar servicios, editar perfil.

Las rutas privadas estan protegidas con `rolGuard`, que redirige segun el rol.

## Notas

- No hay backend ni base de datos: todo se simula con localStorage / sessionStorage.
- El pago es simulado, no se procesa ningun cobro real (no se usa WebPay ni similares).
- Las passwords se guardan en texto plano solo para la simulacion; en produccion irian hasheadas en un backend.
