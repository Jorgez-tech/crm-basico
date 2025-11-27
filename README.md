# CRM Básico

Sistema CRM simple para gestión de contactos y clientes, desarrollado con Node.js, Express y MySQL.

## Tecnologías Principales
- **Backend:** Node.js, Express
- **Base de Datos:** MySQL (con `mysql2`)
- **Frontend:** EJS (Embedded JavaScript templates)
- **Seguridad:** Helmet, csurf (CSRF protection), express-validator
- **Sesiones:** cookie-session

## Inicio Rápido Local
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Jorgez-tech/crm-basico.git
    cd crm-basico
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar la base de datos local:**
    - Asegúrate de tener un servidor MySQL corriendo.
    - Ejecuta el script `database_setup.sql` para crear la base de datos y la tabla `contactos`.
4.  **Iniciar la aplicación:**
    ```bash
    npm start
    ```
5.  Accede a `http://localhost:3000` en tu navegador.

## Despliegue en Railway
La aplicación está configurada para despliegue en Railway.
1.  Crea un proyecto en Railway y conéctalo a este repositorio.
2.  Añade un servicio de base de datos MySQL.
3.  Railway inyectará automáticamente las variables de entorno (`MYSQLHOST`, `MYSQLUSER`, etc.). El código está adaptado para usarlas.
4.  El comando de inicio `npm start` se ejecutará automáticamente.

## Estado del Proyecto y Aprendizajes (Octubre 2025)

### Problemas Críticos con Railway

Después de múltiples intentos de despliegue en Railway, se identificaron **problemas críticos e irresolubles**:

#### Problemas Encontrados
1. **Sesiones no persistentes:** `SessionID` siempre queda `undefined` a pesar de configurar correctamente `express-session` y `cookie-session`
2. **CSRF tokens inválidos:** Los tokens CSRF no se validan correctamente debido a las sesiones rotas
3. **Reinicios constantes del contenedor:** Railway mata el proceso con `SIGTERM` sin razón aparente
4. **Trust proxy no funciona:** Configurar `app.set('trust proxy', 1)` no resuelve el problema de sesiones
5. **Operaciones de escritura fallan:** No se pueden crear contactos aunque la conexión a la base de datos es exitosa

#### Acciones Intentadas (sin éxito)
- Configuración de variables de entorno MySQL (`MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQL_DATABASE`, `MYSQLPORT`)
- Uso de `MYSQL_URL` con pool de conexiones configurado
- Cambio entre `express-session` y `cookie-session`
- Configuración de `trust proxy` para proxies reversos
- Ajuste de configuración de cookies (`secure`, `httpOnly`, `sameSite`)
- Forzar inicialización de sesiones con middleware
- Múltiples redespliegues y limpiezas de caché

### Aprendizajes Clave

1. **Railway NO es adecuado para aplicaciones Node.js con:**
   - Sesiones persistentes (express-session/cookie-session)
   - CSRF protection (csurf)
   - Operaciones de escritura en base de datos que requieren sesiones

2. **Pool de conexiones es esencial:** El uso de `createPool` con `MYSQL_URL` mejora la estabilidad de conexiones a la base de datos

3. **Variables de entorno en Railway:** Requieren referencias explícitas entre servicios (`${{MySQL.MYSQL_URL}}`)

4. **Alternativas recomendadas para este tipo de aplicación:**
   - **Render.com:** Más estable para Node.js + MySQL
   - **DigitalOcean App Platform:** Control y estabilidad probados
   - **Vercel + PostgreSQL:** Si se migra de MySQL a PostgreSQL

### Recomendación Final

**No usar Railway para aplicaciones con sesiones y CSRF.** El código está listo para desplegar en plataformas más confiables como Render.com o DigitalOcean.

### Estado del Código
- **Funciona perfectamente en local**
- **Base de Datos configurada correctamente**
- **Pool de conexiones optimizado**
- **Código preparado para despliegue**
- **Railway no es compatible con esta arquitectura**
---
**Autor:** Jorge Zuta — [@Jorgez-tech](https://github.com/Jorgez-tech)
