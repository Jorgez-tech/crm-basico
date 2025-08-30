# CRM Básico

Un sistema de gestión de relaciones con clientes (CRM) básico y funcional para pequeños negocios y freelancers. Desarrollado con Node.js, Express, MySQL y EJS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Características

- ✅ Gestión completa de contactos (CRUD)
- ✅ Interfaz intuitiva y responsive
- ✅ Seguridad implementada (Helmet, CSRF, Cookie hardening)
- ✅ Validación de datos con express-validator
- ✅ Health check endpoint (`/health`)
- ✅ Structured logging con Winston
- ✅ Testing automatizado (Jest + supertest)
- ✅ CI/CD con GitHub Actions
- ✅ Integración con APIs externas
- ✅ Base de datos MySQL
- ✅ Plantillas EJS dinámicas

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [MySQL](https://www.mysql.com/) (versión 8 o superior)
- [Git](https://git-scm.com/)

## 🛠️ Instalación

### Opción 1: Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jzuta/crm-basico.git
   cd crm-basico
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar la base de datos:**
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

4. **Configurar variables de entorno (opcional):**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

5. **Iniciar la aplicación:**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   
   # Tests
   npm test
   npm run test:integration
   
   # Linting y formato
   npm run lint
   npm run format
   ```

6. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

7. **Verificar health check:**
   ```
   http://localhost:3000/health
   ```

## ☁️ Despliegue en Azure

### Opción 2: Producción en Microsoft Azure

Para un despliegue en la nube con servicios gestionados, consulta la [**Guía de Despliegue Azure**](docs/azure-deployment.md).

#### 🚀 Resumen del proceso:
1. **Azure App Service** - Hosting de la aplicación Node.js (tier gratuito disponible)
2. **Azure Database for MySQL** - Base de datos gestionada con backups automáticos  
3. **Variables de entorno** - Configuración segura via Azure App Settings
4. **Health checks** - Verificación de conectividad cloud integrada
5. **CI/CD preparado** - Foundation lista para automatización (Sprint 7)

#### 📊 URLs de ejemplo una vez desplegado:
- 🌐 **Aplicación principal:** `https://tu-app.azurewebsites.net`
- 🔍 **Health Check:** `https://tu-app.azurewebsites.net/health`
- 📈 **Azure Portal:** Gestión completa en [portal.azure.com](https://portal.azure.com)

#### ⏱️ Tiempo estimado de despliegue: **1-2 horas**

> 💡 **Tip:** El proceso está documentado paso a paso con comandos específicos y checklist de validación para garantizar un despliegue exitoso.

## ✅ Checklist de Revisión Funcional

Checklist funcional validado:
 - [x] Crear contacto
 - [x] Listar contactos
 - [x] Editar contacto
 - [x] Eliminar contacto
 - [x] Buscar contacto
 - [x] Validaciones de datos
 - [x] Seguridad (CSRF y sesión)
 - [x] Mensajes de éxito/error
 - [x] Health check endpoint
 - [x] Structured logging
 - [x] Tests automatizados

## 🛡️ Seguridad

- El middleware CSRF (`csurf`) se aplica globalmente.
- Se eliminó el uso duplicado de `csrf()` en rutas POST específicas para evitar conflictos de sesión.
- Los formularios de edición y eliminación ya no están anidados, lo que soluciona errores de validación CSRF.

## 📝 Estado del Proyecto

**Estado actual:** Proyecto funcional y completo para producción.

✅ **Completado (Sprint 1-5):**
- Funcionalidades principales del CRM validadas y estables
- Sistema de seguridad CSRF implementado y probado
- Tests automatizados con cobertura completa
- Health check y monitoreo implementado
- Structured logging para desarrollo y producción
- CI/CD pipeline configurado

🔄 **En desarrollo (Sprint 6):**
- Migración a Azure Cloud (App Service + Database for MySQL)
- Configuración de infraestructura cloud
- Documentación de despliegue Azure

📋 **Próximos pasos (Sprint 7):**
- CI/CD automatizado con GitHub Actions
- Deployment slots y blue-green deployments
- Monitoring avanzado con Application Insights

Consulta la guía de desarrollo detallada en `guia-desarrollo.md`.

## 🏗️ Estructura del Proyecto

```
crm-basico/
├── app/
│   ├── main.js          # Archivo principal del servidor
│   ├── routes.js        # Definición de rutas
│   ├── database.js      # Configuración de base de datos
│   ├── logger.js        # Sistema de logging estructurado
│   └── utils.js         # Funciones utilitarias
├── tests/
│   ├── integration.test.js  # Tests de integración
│   ├── setup.js         # Configuración de Jest
│   ├── csrf-check.js    # Tests CSRF
│   └── e2e-edit.js      # Tests E2E
├── logs/                # Archivos de log (producción)
├── public/
│   ├── css/
│   │   └── styles.css   # Estilos principales
│   ├── js/
│   │   └── main.js      # JavaScript del frontend
│   └── images/          # Imágenes estáticas
├── views/
│   ├── index.ejs        # Página principal
│   ├── edit.ejs         # Formulario de edición
│   └── partials/        # Componentes reutilizables
├── package.json         # Dependencias y scripts
├── .gitignore          # Archivos ignorados por Git
└── README.md           # Documentación
```

## 🗄️ Estructura de la Base de Datos

### Tabla: `contactos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único |
| `nombre` | VARCHAR(255) | Nombre completo |
| `correo` | VARCHAR(255) | Correo electrónico (único) |
| `telefono` | VARCHAR(20) | Número de teléfono |
| `empresa` | VARCHAR(255) | Empresa del contacto |
| `estado` | ENUM | prospecto/cliente/inactivo |
| `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `fecha_actualizacion` | TIMESTAMP | Última actualización |

### 🔮 Extensiones Futuras Sugeridas

```sql
-- Tabla de notas/interacciones
CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contacto_id INT,
    nota TEXT,
    tipo ENUM('llamada', 'email', 'reunion', 'otro'),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contacto_id) REFERENCES contactos(id)
);

-- Tabla de categorías/etiquetas
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff'
);

-- Tabla relacional contacto-categorías
CREATE TABLE contacto_categorias (
    contacto_id INT,
    categoria_id INT,
    PRIMARY KEY (contacto_id, categoria_id),
    FOREIGN KEY (contacto_id) REFERENCES contactos(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

## 🎯 Uso

### Gestión de Contactos

1. **Agregar contacto:** Completa el formulario en la página principal
2. **Ver contactos:** La lista se muestra automáticamente
3. **Editar contacto:** Haz clic en "Editar" junto al contacto
4. **Eliminar contacto:** Haz clic en "Eliminar" (requiere confirmación)

### Funcionalidades Avanzadas

- **Búsqueda:** Usa la barra de búsqueda para filtrar contactos
- **Filtros:** Filtra por estado (prospecto, cliente, inactivo)
- **Health check:** Verifica el estado del sistema en `/health`
- **Logs:** Revisa los logs del sistema (archivos en `logs/` en producción)

## 🧪 Testing

El proyecto incluye un sistema completo de testing:

```bash
# Ejecutar todos los tests
npm test

# Tests de integración
npm run test:integration

# Tests CSRF específicos
node tests/csrf-check.js

# Tests E2E
node tests/e2e-edit.js
```

### Tipos de tests incluidos:
- **Integration tests:** Tests completos de rutas y funcionalidad
- **CSRF tests:** Verificación de protección CSRF
- **API tests:** Tests de endpoints JSON
- **E2E tests:** Tests de flujo completo de usuario

## 🛡️ Seguridad

- **Helmet.js:** Protección contra vulnerabilidades comunes
- **CSRF:** Protección contra ataques de falsificación de peticiones
- **Cookie hardening:** Cookies seguras en producción (secure, sameSite)
- **Validación:** Validación de datos en servidor con express-validator
- **Sanitización:** Limpieza de datos de entrada
- **Structured logging:** Registro de eventos de seguridad

## 🔍 Monitoreo y Observabilidad

- **Health endpoint:** `/health` - Verificación de estado del sistema y base de datos
- **Structured logging:** Sistema de logs con Winston para desarrollo y producción
- **Métricas del sistema:** Información de memoria, uptime y performance
- **Request logging:** Log automático de todas las peticiones HTTP

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Sistema de autenticación de usuarios
- [ ] Dashboard con estadísticas
- [ ] Importación/exportación de contactos
- [ ] Integración con email marketing
- [ ] API REST para integraciones
- [ ] Aplicación móvil
- [ ] Reportes avanzados
- [ ] Integración con CRM populares

## 🐛 Reportar Errores

Si encuentras un error, por favor [crea un issue](https://github.com/jzuta/crm-basico/issues) con:

- Descripción detallada del problema
- Pasos para reproducir el error
- Versión de Node.js y sistema operativo
- Screenshots si es aplicable

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## � Documentación Adicional

- `guia-desarrollo.md` - Guía completa de desarrollo y checklist de tareas
- `CONTRIBUTING.md` - Guía para contribuidores
- `app/README.md` - Documentación específica del servidor
- `.env.production.example` - Ejemplo de configuración para producción

## �👨‍💻 Autor

**Jorge Zuta**
- GitHub: [@Jorgez-tech](https://github.com/Jorgez-tech)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- Inspirado en proyectos académicos de desarrollo web
- Comunidad de Node.js y Express
- Contribuidores de código abierto

---

⭐ **¡Dale una estrella al proyecto si te resultó útil!**
