# Proyecto Venta Panificados V5

Esta es la versión 5 del sistema de gestión de panificados.

## Mejoras incluidas

- Centralización de rutas de backend mediante `config.js` (variable `API_URL`).
- Separación de funcionalidades en módulos ES6 (`import/export`).
- Correcciones en gestión de productos (crear, editar, eliminar).
- Integración de carrito (`carrito` con user_id, product_id, quantity).
- Restricciones de acceso por rol (usuario / administrador).
- Reportes con uso de `chart-utils.js`.
- Preparado para despliegue con `serviceWorker` y `manifest.json`.

## Archivos clave

- `config.js`: configuración de la API.
- `index.html`: página principal.
- `styles.css`: estilos globales.
- `*.js`: scripts modulares.

## Cómo ejecutar

1. Clonar o descomprimir el proyecto.
2. Ajustar `API_URL` en `config.js` según tu backend.
3. Abrir `index.html` en el navegador (o servir con un servidor local).
