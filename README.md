# Synergy ERP

Synergy ERP es una aplicación web construida con Vite + React que ofrece un panel de gestión empresarial offline-ready sin dependencias externas. El proyecto ahora incluye autenticación local, gestión de usuarios, configuración de módulos y datos de ejemplo persistidos en almacenamiento local.

## Características destacadas

- Inicio de sesión con credenciales locales firmadas con JWT y contraseñas derivadas mediante PBKDF2.
- Registro de nuevos usuarios, solicitud de restablecimiento y cambio de contraseña sin servicios de terceros.
- Panel administrativo para actualizar roles y módulos activos del ERP.
- Conjunto de datos iniciales para productos, clientes, impuestos, documentos y stock.

## Requisitos previos

- Node.js >= 22
- npm >= 10

## Configuración

1. Copia el archivo de ejemplo de variables de entorno y ajusta la clave JWT:

   ```bash
   cp .env.example .env
   ```

2. Instala las dependencias (se usa `npm ci` si existe `package-lock.json`, de lo contrario `npm install`).

   ```bash
   npm install
   ```

3. Inicia el entorno de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación quedará disponible en `http://localhost:5173`.

## Credenciales por defecto

El entorno viene precargado con un usuario administrador para facilitar las pruebas:

- **Email:** `admin@synergy-erp.local`
- **Contraseña:** `admin123`

Se recomienda cambiar la contraseña tras el primer acceso.

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la build de producción.
- `npm run preview`: sirve la build generada.
- `npm run lint`: ejecuta ESLint.
- `npm test`: lanza la batería de pruebas unitarias (`node --test`).

## Pruebas

El paquete incluye pruebas para el flujo de autenticación local en `tests/unit/api/localAuth.test.js`.

```bash
npm test
```

## Recuperación y restablecimiento de contraseña

- El flujo de **“¿Olvidaste tu contraseña?”** genera un token temporal que se muestra en pantalla.
- El token debe copiarse manualmente en la página de restablecimiento (`/reset-password`).
- Cada token expira a los 30 minutos.

## Persistencia de datos

Los datos se almacenan en `localStorage`. Para reiniciar el estado puedes limpiar el almacenamiento del navegador o usar las utilidades de desarrollo del propio navegador.

## Seguridad

- Las contraseñas se derivan con PBKDF2 (SHA-256, 310 000 iteraciones) antes de guardarse.
- Los JWT se firman con HMAC-SHA256 empleando la clave definida en `VITE_APP_JWT_SECRET`.
- No se realizan llamadas a servicios externos; toda la autenticación es local.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
