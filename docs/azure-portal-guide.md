# Guía Visual: Despliegue CRM Básico en Azure Portal

## 🎓 Primera vez en Azure - Tutorial Visual

Esta guía te llevará paso a paso usando la interfaz web de Azure, ideal para principiantes.

### 🎯 Nuestros nombres únicos para este proyecto:
- **Resource Group:** `rg-crm-jz2025`
- **MySQL Server:** `mysql-crm-jz2025`
- **App Service:** `crm-app-jz2025`
- **Database:** `crm_basico`
- **Admin User:** `crmadmin`

---

## 📋 PASO 1: Acceder a Azure Portal

1. **Abre tu navegador** y ve a: https://portal.azure.com
2. **Inicia sesión** con tu cuenta de estudiante
3. **Verifica tus créditos** - debería aparecer en la parte superior

### ✅ Checkpoint 1:
- [ ] Estás logueado en Azure Portal
- [ ] Puedes ver tu suscripción "Azure for Students"
- [ ] Tienes créditos disponibles ($100 aprox.)

---

## 📋 PASO 2: Crear Resource Group (Contenedor del proyecto)

### 🎯 ¿Qué es un Resource Group?
Es como una "carpeta" que contiene todos los recursos de tu proyecto CRM.

### 📝 Pasos:
1. **Busca "Resource groups"** en la barra de búsqueda superior
2. **Haz clic en "Create"** (botón azul)
3. **Llena el formulario:**
   - **Subscription:** Tu suscripción de estudiante
   - **Resource group name:** `rg-crm-jz2025`
   - **Region:** `East US` (recomendado para estudiantes)
4. **Haz clic en "Review + Create"**
5. **Haz clic en "Create"**

### ✅ Checkpoint 2:
- [ ] Resource Group `rg-crm-jz2025` creado exitosamente
- [ ] Status: "Deployment succeeded"

---

## 📋 PASO 3: Crear Azure Database for MySQL

### 🎯 ¿Qué es esto?
Tu base de datos MySQL gestionada por Microsoft. No necesitas instalar ni configurar nada.

### 📝 Pasos:
1. **Busca "Azure Database for MySQL"** en la barra superior
2. **Selecciona "Azure Database for MySQL flexible servers"**
3. **Haz clic en "Create"**
4. **Llena el formulario básico:**
   - **Subscription:** Tu suscripción de estudiante
   - **Resource group:** `rg-crm-jz2025` (selecciona el que creaste)
   - **Server name:** `mysql-crm-jz2025`
   - **Region:** `East US`
   - **MySQL version:** `8.0`
   - **Workload type:** `Development` (más barato)

5. **En la sección "Authentication":**
   - **Admin username:** `crmadmin`
   - **Password:** `MiCrm2025#SecurePass!`
   - **Confirm password:** `MiCrm2025#SecurePass!`

6. **En "Networking":**
   - **Connectivity method:** `Public access (allowed IP addresses)`
   - **Add current client IP address:** ✅ (marca esta casilla)
   - **Allow public access from any Azure service:** ✅ (marca esta casilla)

7. **Haz clic en "Review + Create"**
8. **Haz clic en "Create"**

### ⏱️ Tiempo estimado: 5-10 minutos

### ✅ Checkpoint 3:
- [ ] MySQL Server `mysql-crm-jz2025` en proceso de creación
- [ ] Aparece en tu Resource Group
- [ ] Status cambia a "Running" cuando termine

---

## 📋 PASO 4: Configurar la Base de Datos

### 🎯 Crear la base de datos específica
Una vez que el servidor MySQL esté listo, necesitamos crear la base de datos para nuestro CRM.

### 📝 Pasos:
1. **Ve a tu MySQL server** `mysql-crm-jz2025`
2. **En el menú izquierdo, busca "Databases"**
3. **Haz clic en "Add database"**
4. **Database name:** `crm_basico`
5. **Charset:** `utf8mb4`
6. **Collation:** `utf8mb4_unicode_ci`
7. **Haz clic en "Save"**

### ✅ Checkpoint 4:
- [ ] Base de datos `crm_basico` creada
- [ ] Puedes verla en la lista de databases

---

## 📋 PASO 5: Crear App Service (Servidor para tu aplicación)

### 🎯 ¿Qué es App Service?
El servidor web donde correrá tu aplicación Node.js CRM.

### 📝 Pasos:
1. **Busca "App Services"** en la barra superior
2. **Haz clic en "Create"**
3. **Selecciona "Web App"**
4. **Llena el formulario:**
   - **Subscription:** Tu suscripción de estudiante
   - **Resource Group:** `rg-crm-jz2025`
   - **Name:** `crm-app-jz2025`
   - **Publish:** `Code`
   - **Runtime stack:** `Node 18 LTS`
   - **Operating System:** `Linux`
   - **Region:** `East US`

5. **En "App Service Plan":**
   - **Linux Plan:** Crear nuevo
   - **Name:** `plan-crm-jz2025`
   - **Pricing tier:** `Free F1` (¡GRATIS!)

6. **Haz clic en "Review + Create"**
7. **Haz clic en "Create"**

### ⏱️ Tiempo estimado: 3-5 minutos

### ✅ Checkpoint 5:
- [ ] App Service `crm-app-jz2025` creado
- [ ] Status: "Running"
- [ ] Tienes una URL: `https://crm-app-jz2025.azurewebsites.net`

---

## 📋 PASO 6: Configurar Variables de Entorno

### 🎯 ¿Para qué?
Tu aplicación necesita saber cómo conectarse a la base de datos Azure.

### 📝 Pasos:
1. **Ve a tu App Service** `crm-app-jz2025`
2. **En el menú izquierdo, busca "Configuration"**
3. **En la pestaña "Application settings"**
4. **Haz clic en "New application setting"** para cada variable:

### 🔧 Variables a agregar (una por una):

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `DB_HOST` | `mysql-crm-jz2025.mysql.database.azure.com` |
| `DB_USER` | `crmadmin` |
| `DB_PASS` | `MiCrm2025#SecurePass!` |
| `DB_NAME` | `crm_basico` |
| `DB_SSL` | `true` |
| `SESSION_SECRET` | `mi-secreto-super-seguro-para-sesiones-2025` |

5. **Después de agregar todas, haz clic en "Save"**
6. **Espera a que se reinicie** (automático)

### ✅ Checkpoint 6:
- [ ] 8 variables de entorno configuradas
- [ ] App Service reiniciado exitosamente

---

## 📋 PASO 7: Deploy desde GitHub

### 🎯 Conectar tu código con Azure
Le diremos a Azure que tome el código directamente de tu GitHub.

### 📝 Pasos:
1. **En tu App Service, ve a "Deployment Center"**
2. **Source:** Selecciona `GitHub`
3. **Autoriza** el acceso a GitHub (si no está autorizado)
4. **Organization:** `Jorgez-tech`
5. **Repository:** `crm-basico`
6. **Branch:** `feature/azure-deployment`
7. **Haz clic en "Save"**

### ⏱️ Tiempo estimado: 5-10 minutos (primer deploy)

### ✅ Checkpoint 7:
- [ ] Deployment configurado
- [ ] Status: "Success" en el primer deploy
- [ ] Tu app está disponible en: `https://crm-app-jz2025.azurewebsites.net`

---

## 📋 PASO 8: Crear las tablas de la base de datos

### 🎯 ¿Por qué?
Tu base de datos está vacía, necesitamos crear la tabla `contactos`.

### 📝 Opción A: Usando Azure Portal
1. **Ve a tu MySQL server** `mysql-crm-jz2025`
2. **En el menú izquierdo, busca "Query editor (preview)"**
3. **Conecta** usando `crmadmin` y tu password
4. **Ejecuta este SQL:**

```sql
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

### ✅ Checkpoint 8:
- [ ] Tabla `contactos` creada exitosamente
- [ ] Query ejecutado sin errores

---

## 🎉 PASO 9: ¡Verificar que todo funciona!

### 📝 Tests finales:
1. **Abre tu app:** `https://crm-app-jz2025.azurewebsites.net`
2. **Verifica el health check:** `https://crm-app-jz2025.azurewebsites.net/health`
3. **Prueba crear un contacto**
4. **Verifica que se guarde en la base de datos**

### ✅ Checkpoint Final:
- [ ] Aplicación carga correctamente
- [ ] Health check responde OK
- [ ] Puedes crear contactos
- [ ] Los contactos se guardan en Azure MySQL

---

## 🎊 ¡FELICITACIONES!

**Has completado tu primer despliegue en Azure!**

### 📊 Lo que acabas de crear:
- ✅ **Resource Group** organizando tu proyecto
- ✅ **Azure Database for MySQL** con tu base de datos
- ✅ **App Service** corriendo tu aplicación Node.js
- ✅ **Deployment automático** desde GitHub
- ✅ **Variables de entorno** configuradas

### 💰 Costos:
- **App Service F1:** ¡GRATIS!
- **MySQL Basic:** ~$25/mes (usando tus créditos de estudiante)

### 🚀 Próximos pasos:
- Sprint 7: CI/CD automático
- Custom domain
- SSL certificates
- Application Insights monitoring

---

**¡Tu CRM está ahora en la nube y disponible 24/7!** 🌟
