# app/

Instrucciones y notas específicas del servidor Express.

Iniciar en desarrollo:

```bash
npm run dev
```


Variables de entorno (ver `.env.production.example`):
- PORT
- DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
- SESSION_SECRET

Configuración Railway:
- Las variables de entorno se configuran en el dashboard de Railway.
- Puedes usar el plugin MySQL de Railway para obtener los datos de conexión.

Notas:
- `app/main.js` es el punto de entrada.
- `app/database.js` expone funciones para conectar y ejecutar consultas.
- Para pruebas, considera exponer `database.connect()` y `database.close()` desde un helper.

Comandos útiles (desde la raíz del proyecto):

```cmd
# Instala dependencias
npm install

# Inicia servidor en dev (nodemon)
npm run dev

# Inicia servidor en producción
npm start

# Ejecutar chequeos automáticos CSRF
node tests/csrf-check.js

# Ejecutar E2E rápido de edición para contacto id=11
node tests/e2e-edit.js
```


Variables de entorno mínimas requeridas (ejemplo):

```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=prod_user
DB_PASS=MySQL2025#Safe!Pass
DB_NAME=crm_basico
SESSION_SECRET=alguna_clave_segura
```
