# 🚀 Railway Deployment - Guía Rápida

## ⚡ Pasos Inmediatos para Solucionar el Problema

### 1️⃣ Actualizar el Código (2 minutos)

```bash
# Hacer commit de los cambios corregidos
git add .
git commit -m "fix: corregir configuración de DB y puerto para Railway"
git push origin main
```

### 2️⃣ Configurar Variables en Railway (3 minutos)

Accede a Railway → Tu Proyecto → Variables y agrega:

```env
NODE_ENV=production
SESSION_SECRET=<genera_clave_segura_32_caracteres>
```

**Generar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3️⃣ Verificar Variables de MySQL (1 minuto)

Railway debe tener automáticamente (si agregaste el plugin MySQL):
- ✅ `MYSQLHOST`
- ✅ `MYSQLUSER`
- ✅ `MYSQLPASSWORD`
- ✅ `MYSQL_DATABASE`
- ✅ `MYSQLPORT`
- ✅ `MYSQL_URL`

### 4️⃣ Crear Tabla en Base de Datos (2 minutos)

Railway → MySQL → Data → Ejecutar:

```sql
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    empresa VARCHAR(255),
    estado ENUM('prospecto', 'cliente', 'inactivo') DEFAULT 'prospecto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5️⃣ Verificar Deployment (1 minuto)

Railway redespliegará automáticamente. Verifica los logs:

**Busca estos mensajes de éxito:**
```
✅ Conexión a base de datos establecida
📊 Pool de conexiones a MySQL creado y verificado
🚀 Servidor CRM Básico ejecutándose
```

### 6️⃣ Probar la Aplicación (2 minutos)

1. Accede a tu URL: `https://crm-basico-production.up.railway.app/`
2. Click en "Agregar Contacto"
3. Llena el formulario y guarda
4. ✅ Debería funcionar correctamente

---

## 🔧 ¿Qué se Corrigió?

### ✅ Archivo: `app/database.js`
- Soporte para múltiples formatos de variables de entorno
- SSL automático en producción
- Pool de conexiones optimizado
- Logs seguros (sin exponer credenciales)

### ✅ Archivo: `app/main.js`
- Puerto con fallback: `const PORT = process.env.PORT || 3000`

### ✅ Archivo: `.env.production.example`
- Documentación actualizada con variables de Railway

---

## 🆘 Troubleshooting Rápido

### ❌ Error: "Cannot connect to database"
→ Verifica que el plugin MySQL esté activo en Railway

### ❌ Error: "Table doesn't exist"
→ Ejecuta el SQL de creación de tabla (Paso 4)

### ❌ Error: "CSRF token invalid"
→ Configura `SESSION_SECRET` en Railway (Paso 2)

### ❌ La app no responde
→ Revisa los logs de Railway para ver errores específicos

---

## 📚 Documentación Completa

Para más detalles, consulta: **`AUDITORIA-RAILWAY-DEPLOYMENT.md`**

---

**Tiempo Total Estimado:** 10-15 minutos  
**Dificultad:** ⭐⭐ Fácil
