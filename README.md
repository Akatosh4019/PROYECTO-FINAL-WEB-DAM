# INDUMOTOS — Sistema web DAM

Responsable del avance: Roberto Samuel Valencia Saavedra.

Cliente Angular 21 conectado al mismo backend y base de datos que el móvil. Extiende las pantallas del Sprint 1 con operaciones de logística; conserva roles y autorización en el servidor.

- Backend: https://github.com/Akatosh4019/backend-DAM-final
- Móvil: https://github.com/Akatosh4019/PROYECTO-FINAL-DAM

## Ejecutar con Docker

1. Inicia primero el repositorio del backend con sus scripts `Configurar.ps1` e `Iniciar.ps1`. Debe responder en http://localhost:8088/api/health.
2. En esta carpeta ejecuta `./Iniciar-Web.ps1` o `docker compose up --build -d`.
3. Abre **http://localhost:8085**.

La API se redirige desde Nginx al backend mediante `http://host.docker.internal:8088`. Si el backend vive en otro servidor, define `API_UPSTREAM` con su URL al iniciar Compose. No incluyas `/api` al final de esa URL.

## Ejecutar sin Docker para desarrollar

Requiere Node.js 24 y npm.

```powershell
cd frontendIndumotos
npm ci
npm start
```

Abre http://localhost:4200. El proxy de desarrollo apunta al backend en el puerto 8088. No requiere iniciar el gateway anterior.

## Ingreso

Usa los mismos usuarios del backend y del móvil. En una instalación nueva, el administrador es `roberto` y su contraseña es el valor de `ADMIN_PASSWORD` del `.env` **del backend**. Este web no crea cuentas ni contraseñas de demostración automáticamente.

Las contraseñas no están en Git. Cambiar `.env` después de crear al administrador no modifica su contraseña almacenada. La sesión web guarda temporalmente el token en `sessionStorage`, carga los permisos efectivos y cierra el acceso ante respuestas 401. El cierre de sesión solicita revocación al backend.

## Módulos

- Inicio con accesos según permisos.
- Registro y consulta de llegadas y sus fichas.
- Registro de motocicletas y búsqueda de inventario con paginación del servidor.
- Ubicaciones y movimientos.
- Solicitudes: creación, cambio de estado, asignación de unidades e historial.
- Disponibilidad y su historial.
- Inconsistencias: reporte, revisión, corrección de ficha e historial.
- Creación de trabajadores, directorio, seis roles y excepciones de permisos.

Las acciones se muestran según permisos efectivos; el backend vuelve a comprobar cada autorización. Las listas de logística consultan hasta 500 registros y usan filtro/paginación local. No se borran eventos históricos ni se agregan ventas o compras de motos en este avance.

## Prueba manual de integración

1. Ingresa como administrador y crea una ubicación de tipo ALMACEN.
2. Registra una llegada con guía y cantidades válidas. Abre Fichas y registra una unidad vinculada a esa llegada.
3. Encuéntrala en Inventario y revisa su ficha.
4. Registra un movimiento hacia la ubicación creada; comprueba el destino en Disponibilidad.
5. Crea una solicitud con la misma marca, modelo y color. Pásala a EN_PREPARACION, asigna la unidad y márcala ATENDIDA.
6. Reporta una inconsistencia, pásala a EN_REVISION, corrige la ficha y verifica RESUELTA e historial.
7. Crea una cuenta COMERCIAL, comprueba sus accesos y cierra sesión.

Los errores 400, 403 y 409 se muestran sin simular operaciones exitosas. Este repositorio no contiene datos locales del equipo. Consulta `VALIDACION.md` para distinguir comprobaciones ejecutadas y pendientes.
