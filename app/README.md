# app/

Instrucciones y notas específicas del servidor Express.

Iniciar en desarrollo:

```bash
npm run dev
```

Variables de entorno (ver `.env.example`):
- PORT
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- SESSION_SECRET

Notas:
- `app/main.js` es el punto de entrada.
- `app/database.js` expone funciones para conectar y ejecutar consultas.
- Para pruebas, considera exponer `database.connect()` y `database.close()` desde un helper.
