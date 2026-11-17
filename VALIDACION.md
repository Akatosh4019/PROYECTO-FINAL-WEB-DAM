# Validación del avance web

## Ejecutado

- Instalación de dependencias con el archivo package-lock.json mediante npm ci.
- Compilación Angular de producción: aprobada. Tamaño inicial aproximado 273 kB, dentro de los presupuestos configurados.
- Pruebas Angular: 10 aprobadas en tres archivos. Incluyen filtros y paginación del inventario, restricciones de transición, envío al identificador seleccionado, persistencia del formulario ante 409 y rechazo de motivos vacíos.
- Los tests HTTP utilizan HttpTestingController: validan el cliente con respuestas simuladas y no sustituyen la integración con Java/PostgreSQL.

## Pendiente

- Ejecutar la imagen Docker/Nginx y recorrer el flujo con el backend real. Docker Desktop no estaba iniciado durante la preparación.
- Revisar visualmente en navegador y ejecutar las operaciones con cuentas reales de cada rol. El intento automatizado con Edge no pudo iniciar el navegador en este entorno; no se declara aprobado.
- Acreditar los requisitos académicos finales del conjunto web/móvil/backend; esta publicación es un avance y no acredita por sí sola todos los sprints ni la entrega final.

## Repetir

```powershell
cd frontendIndumotos
npm ci
npm run build
npm test -- --watch=false
```

El workflow de GitHub Actions ejecutará estos comandos al publicar y en pull requests; su resultado remoto todavía no se ha verificado.
