# CRM Básico

Un sistema de gestión de relaciones con clientes (CRM) básico y funcional para pequeños negocios y freelancers. Desarrollado con Node.js, Express, MySQL y EJS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Características

- ✅ Gestión completa de contactos (CRUD)
- ✅ Interfaz intuitiva y responsive
- ✅ Seguridad implementada (Helmet, CSRF)
- ✅ Validación de datos
- ✅ Integración con APIs externas
- ✅ Base de datos MySQL
- ✅ Plantillas EJS dinámicas

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [MySQL](https://www.mysql.com/) (versión 8 o superior)
- [Git](https://git-scm.com/)

## 🛠️ Instalación

## ✅ Checklist de Revisión Funcional


Esta lista sirve para validar el funcionamiento del CRM como usuario final. Última revisión:

- [x] **Crear contacto:** Completa el formulario principal y verifica que el contacto aparece en la lista.
- [x] **Listar contactos:** Accede a la vista de lista y revisa que todos los contactos se muestran correctamente.
- [x] **Editar contacto:** Haz clic en "Editar" junto a un contacto, modifica datos y guarda. Confirma que los cambios se reflejan.
- [x] **Eliminar contacto:** Haz clic en "Eliminar" y confirma la acción. El contacto debe desaparecer de la lista.
- [x] **Buscar contacto:** Usa la barra de búsqueda para filtrar contactos por nombre, correo, etc.
- [x] **Validaciones de datos:** Intenta enviar formularios con datos inválidos y revisa que se muestren mensajes de error adecuados.
- [ ] **Seguridad:** Verifica que no se puedan enviar formularios sin token CSRF y que la sesión funcione correctamente. _(Pendiente)_
- [ ] **Mensajes de éxito/error:** Asegúrate de que cada acción muestra mensajes claros de éxito o error. _(Pendiente)_

Puedes ejecutar el servicio en modo desarrollo con:
```bash
npm run dev
```

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
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

6. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
crm-basico/
├── app/
│   ├── main.js          # Archivo principal del servidor
│   ├── routes.js        # Definición de rutas
│   ├── database.js      # Configuración de base de datos
│   └── utils.js         # Funciones utilitarias
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
- **Exportación:** Descarga la lista en formato CSV

## 🛡️ Seguridad

- **Helmet.js:** Protección contra vulnerabilidades comunes
- **CSRF:** Protección contra ataques de falsificación de peticiones (implementado con `csurf` y sesiones, incluyendo protección explícita en la ruta de edición de contactos)
- **Validación:** Validación de datos en servidor y cliente
- **Sanitización:** Limpieza de datos de entrada

### Notas técnicas recientes
- El middleware `csurf` se aplica globalmente y también de forma explícita en la ruta `POST /contactos/:id` para asegurar la validación del token antes de los validadores.
- Si tienes problemas con el token CSRF al editar contactos, revisa que el token enviado en el formulario coincida con el de la sesión y que no haya middlewares que alteren el body antes de `csurf`.

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

## 👨‍💻 Autor

**Jorge Zuta**
- GitHub: [@jzuta](https://github.com/jzuta)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- Inspirado en proyectos académicos de desarrollo web
- Comunidad de Node.js y Express
- Contribuidores de código abierto

---

⭐ **¡Dale una estrella al proyecto si te resultó útil!**
