# CRM Básico

# CRM Básico

Sistema CRM simple para gestión de contactos y clientes. Desarrollado con Node.js, Express, MySQL y EJS.

## 🚀 Tecnologías
- Node.js >=16
- Express
- MySQL2
- EJS
- cookie-session
- Helmet, CSRF, express-validator

## ⚡ Despliegue en Railway
1. Clona el repositorio y sube a Railway.
2. Configura las variables de entorno en Railway:
   - DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, DB_SSL, SESSION_SECRET, PORT
3. Agrega el plugin MySQL en Railway y usa los datos de conexión.
4. El comando de inicio es `node app/main.js` (ya configurado en package.json).
5. Accede a la URL pública de Railway para ver la app.
6. Verifica el endpoint `/status` para comprobar el estado de la app y la base de datos.

## 🗄️ Inicializar base de datos
Ejecuta este SQL en tu MySQL:
```sql
CREATE DATABASE crm_basico;
USE crm_basico;
CREATE TABLE contactos (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nombre VARCHAR(255) NOT NULL,
   correo VARCHAR(255) NOT NULL UNIQUE,
   telefono VARCHAR(20),
   empresa VARCHAR(255),
   estado ENUM('prospecto', 'cliente', 'inactivo') DEFAULT 'prospecto',
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🏁 Inicio rápido
```bash
npm install
npm start
```
Accede a la app en tu navegador:
```
http://localhost:3000
```
o la URL pública de Railway.

## � Endpoints útiles
- `/` — Interfaz principal CRM
- `/status` — Estado de la app y base de datos (JSON)

## ✅ Estado final
- Proyecto funcional, listo para producción y archivado/escalado.
- Última URL pública: [https://tu-app.railway.app/](https://tu-app.railway.app/) (actualiza según tu deploy)

---
**Autor:** Jorge Zuta — [@Jorgez-tech](https://github.com/Jorgez-tech)
