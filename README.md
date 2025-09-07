# CRM Básico

Sistema CRM simple para gestión de contactos y clientes, desarrollado con Node.js, Express y MySQL.

## 🚀 Tecnologías Principales
- **Backend:** Node.js, Express
- **Base de Datos:** MySQL (con `mysql2`)
- **Frontend:** EJS (Embedded JavaScript templates)
- **Seguridad:** Helmet, csurf (CSRF protection), express-validator
- **Sesiones:** cookie-session

## 🏁 Inicio Rápido Local
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

## ⚡ Despliegue en Railway
La aplicación está configurada para despliegue en Railway.
1.  Crea un proyecto en Railway y conéctalo a este repositorio.
2.  Añade un servicio de base de datos MySQL.
3.  Railway inyectará automáticamente las variables de entorno (`MYSQLHOST`, `MYSQLUSER`, etc.). El código está adaptado para usarlas.
4.  El comando de inicio `npm start` se ejecutará automáticamente.

## 📝 Estado Final del Proyecto (Septiembre 2025)

Este proyecto fue migrado y estabilizado en la plataforma Railway. A continuación se resume su estado final y los aprendizajes clave del proceso.

### Estado Actual
-   **Despliegue:** La aplicación está en línea y las vistas se renderizan correctamente.
-   **Base de Datos:** La conexión a la base de datos es estable gracias a la implementación de un **pool de conexiones**, que resuelve errores de "conexión cerrada".
-   **Incidencia Conocida:** La funcionalidad para **crear nuevos contactos no está operativa**. Aunque la conexión a la base de datos es exitosa, las operaciones de escritura fallan. La causa más probable es una configuración incorrecta de permisos en la base de datos de Railway o un problema con las variables de entorno que impide la escritura.

### Aprendizajes Clave
1.  **Pool de Conexiones:** El uso de un pool (`createPool`) es fundamental para la resiliencia de la conexión a la base de datos en un entorno de producción, evitando caídas por conexiones cerradas.
2.  **Depuración en la Nube:** La inserción de logs de diagnóstico detallados es crucial para identificar problemas específicos del entorno de despliegue que no ocurren localmente.
3.  **Variables de Entorno:** Es vital adaptar el código para que sea compatible con las variables específicas de la plataforma (ej. `MYSQLHOST` de Railway) para optimizar la conexión y evitar costos.
4.  **Caché de Despliegue:** Las plataformas de despliegue pueden usar cachés que causan inconsistencias. Forzar una limpieza de caché es una técnica efectiva para asegurar un despliegue limpio.

---
**Autor:** Jorge Zuta — [@Jorgez-tech](https://github.com/Jorgez-tech)
