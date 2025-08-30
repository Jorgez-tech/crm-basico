# Guía de Despliegue en Azure - CRM Básico

## � Consideraciones de Seguridad

⚠️ **IMPORTANTE:** Esta guía contiene patrones y ejemplos. PERSONALIZA todos los valores antes de usar:

### **❌ NUNCA compartir públicamente:**
- Passwords de base de datos
- SESSION_SECRET values
- Connection strings completos
- API keys o tokens

### **✅ Seguro personalizar y documentar:**
- Nombres de Resource Groups
- Nombres de App Services  
- Nombres de servidores MySQL
- Regiones de Azure

### **🛡️ Buenas prácticas:**
1. **Usa nombres únicos:** Agrega sufijo personal (iniciales + números)
2. **Passwords fuertes:** Mínimo 12 caracteres, números, símbolos
3. **Variables de entorno:** Nunca hardcodear en código fuente
4. **Backup de credenciales:** Guarda en gestor de passwords seguro

---

## �📋 Resumen Ejecutivo

Esta guía documenta el proceso completo para desplegar el CRM Básico en Microsoft Azure utilizando servicios gestionados. El proceso está diseñado para ser reproducible, trazable y escalable.

**Duración estimada:** 1-2 horas  
**Nivel:** Intermedio  
**Costo:** Tier gratuito disponible  

## 🎯 Objetivos del Sprint 6

- ✅ Migrar aplicación Node.js a Azure App Service
- ✅ Migrar base de datos MySQL a Azure Database for MySQL
- ✅ Configurar variables de entorno seguras
- ✅ Implementar health checks específicos para Azure
- ✅ Preparar foundation para CI/CD (Sprint 7)

## 📋 Pre-requisitos

### Herramientas necesarias:
```bash
# Azure CLI (verificar instalación)
az --version

# Node.js y npm (ya configurado)
node --version
npm --version

# Git (ya configurado)
git --version
```

### Accesos requeridos:
- [x] Cuenta de Azure con suscripción activa
- [x] Repositorio GitHub del proyecto
- [x] Proyecto local funcionando

### Verificación del estado actual:
```bash
# Ejecutar tests locales
npm test

# Verificar health check local
curl http://localhost:3000/health

# Confirmar estructura del proyecto
ls -la
```

## 🔧 Arquitectura Azure Propuesta

```
┌─────────────────────────────────────────────────┐
│                 AZURE CLOUD                    │
├─────────────────────────────────────────────────┤
│  🌐 Azure App Service (F1 Free)                │
│    ├── Node.js Runtime                         │
│    ├── Environment Variables                   │
│    └── Auto-scaling Ready                      │
├─────────────────────────────────────────────────┤
│  🗄️ Azure Database for MySQL (Basic)           │
│    ├── Managed Service                         │
│    ├── Automatic Backups                       │
│    └── SSL/TLS Enabled                         │
├─────────────────────────────────────────────────┤
│  🔧 Configuration                              │
│    ├── App Settings (Environment Variables)    │
│    ├── Connection Strings                      │
│    └── Deployment Slots (Future)               │
└─────────────────────────────────────────────────┘
```

## 📝 Plan de Ejecución

### **Fase A: Preparación Local (15 min)**

#### A1. Verificar configuración Azure-ready

```bash
# Verificar que el puerto esté configurado correctamente
grep -r "process.env.PORT" app/

# Confirmar script start en package.json
cat package.json | grep -A2 -B2 "start"

# Validar variables de entorno críticas
cat .env.production.example
```

#### A2. Configurar Azure CLI

```bash
# Login en Azure
az login

# Listar suscripciones disponibles
az account list --output table

# Seleccionar suscripción (si tienes múltiples)
az account set --subscription "TU_SUBSCRIPTION_ID"
```

### **Fase B: Base de Datos (30 min)**

#### B1. Crear Azure Database for MySQL

```bash
# IMPORTANTE: Personaliza estos nombres para tu proyecto
# Reemplaza [tu-sufijo] con algo único (ej: tus iniciales + números)
export RESOURCE_GROUP="rg-crm-[tu-sufijo]"
export MYSQL_SERVER="mysql-crm-[tu-sufijo]"
export APP_SERVICE="crm-app-[tu-sufijo]"
export MYSQL_ADMIN="crmadmin"
export MYSQL_PASSWORD="[TuPasswordSuperSeguro123!]"

# Crear resource group
az group create \
  --name $RESOURCE_GROUP \
  --location "East US"

# Crear servidor MySQL
az mysql server create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER \
  --admin-user $MYSQL_ADMIN \
  --admin-password $MYSQL_PASSWORD \
  --sku-name B_Gen5_1 \
  --version 8.0 \
  --storage-size 5120
```

#### B2. Configurar firewall y conectividad

```bash
# Permitir servicios de Azure
az mysql server firewall-rule create \
  --resource-group rg-crm-basico \
  --server mysql-crm-basico-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Permitir IP local para migración (obtener tu IP actual)
curl -s https://ipinfo.io/ip
az mysql server firewall-rule create \
  --resource-group rg-crm-basico \
  --server mysql-crm-basico-server \
  --name AllowLocalIP \
  --start-ip-address TU_IP_ACTUAL \
  --end-ip-address TU_IP_ACTUAL
```

#### B3. Migrar estructura y datos

```bash
# Exportar estructura local (si tienes datos)
mysqldump -u root -p --no-data crm_basico > schema.sql

# Exportar datos (si existen)
mysqldump -u root -p --no-create-info crm_basico > data.sql

# Importar a Azure (conexión segura)
mysql -h mysql-crm-basico-server.mysql.database.azure.com \
      -u crmadmin@mysql-crm-basico-server \
      -p --ssl-mode=REQUIRED \
      -e "CREATE DATABASE crm_basico;"

mysql -h mysql-crm-basico-server.mysql.database.azure.com \
      -u crmadmin@mysql-crm-basico-server \
      -p --ssl-mode=REQUIRED \
      crm_basico < schema.sql
```

### **Fase C: Aplicación (30 min)**

#### C1. Crear Azure App Service

```bash
# Crear App Service Plan (F1 Free tier)
az appservice plan create \
  --name plan-crm-basico \
  --resource-group rg-crm-basico \
  --sku F1 \
  --is-linux

# Crear Web App
az webapp create \
  --resource-group rg-crm-basico \
  --plan plan-crm-basico \
  --name crm-basico-app \
  --runtime "NODE|18-lts"
```

#### C2. Configurar variables de entorno

```bash
# Configurar variables críticas
az webapp config appsettings set \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --settings \
    NODE_ENV=production \
    DB_HOST=mysql-crm-basico-server.mysql.database.azure.com \
    DB_USER=crmadmin@mysql-crm-basico-server \
    DB_PASS=TuPasswordSeguro123! \
    DB_NAME=crm_basico \
    DB_SSL=true \
    SESSION_SECRET=tu-session-secret-super-seguro \
    PORT=8080
```

#### C3. Deploy desde GitHub

```bash
# Configurar deployment desde GitHub
az webapp deployment source config \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --repo-url https://github.com/Jorgez-tech/crm-basico \
  --branch feature/azure-deployment \
  --manual-integration
```

### **Fase D: Validación (20 min)**

#### D1. Health checks

```bash
# Verificar estado de la aplicación
curl https://crm-basico-app.azurewebsites.net/health

# Verificar logs de la aplicación
az webapp log tail --resource-group rg-crm-basico --name crm-basico-app
```

#### D2. Tests funcionales

```bash
# Test básico de la aplicación
curl https://crm-basico-app.azurewebsites.net/

# Test de base de datos (desde health endpoint)
curl https://crm-basico-app.azurewebsites.net/health | jq .database
```

## ✅ Checklist de Validación

### Pre-deploy:
- [ ] Azure CLI instalado y configurado
- [ ] Verificar tier gratuito disponible en suscripción
- [ ] Backup local de BD actual (si tiene datos)
- [ ] Tests locales pasando (`npm test`)

### Deploy:
- [ ] Resource Group creado (`rg-crm-basico`)
- [ ] Azure MySQL Database creado y configurado
- [ ] Reglas de firewall configuradas
- [ ] Datos migrados y verificados
- [ ] App Service creado (`crm-basico-app`)
- [ ] Variables de entorno configuradas
- [ ] Deploy desde GitHub exitoso

### Post-deploy:
- [ ] Health checks pasando (`/health`)
- [ ] Aplicación accesible vía HTTPS
- [ ] Base de datos conectando correctamente
- [ ] Logs de aplicación funcionando
- [ ] Tests básicos de funcionalidad CRUD

## 📊 URLs y Recursos Creados

Una vez completado el despliegue, tendrás acceso a:

- **🌐 Aplicación principal:** `https://crm-basico-app.azurewebsites.net`
- **🔍 Health Check:** `https://crm-basico-app.azurewebsites.net/health`
- **📊 Azure Portal:** Gestión de recursos en portal.azure.com
- **📝 Logs:** Disponibles en Azure Portal > App Service > Log stream

## 🚨 Troubleshooting

### Problemas comunes:

#### 1. Error de conexión a base de datos
```bash
# Verificar reglas de firewall
az mysql server firewall-rule list \
  --resource-group rg-crm-basico \
  --server mysql-crm-basico-server

# Verificar variables de entorno
az webapp config appsettings list \
  --resource-group rg-crm-basico \
  --name crm-basico-app
```

#### 2. App Service no inicia
```bash
# Revisar logs de inicio
az webapp log tail --resource-group rg-crm-basico --name crm-basico-app

# Verificar configuración de Node.js
az webapp config show --resource-group rg-crm-basico --name crm-basico-app
```

#### 3. Deploy fallido
```bash
# Verificar estado del deployment
az webapp deployment list-publishing-credentials \
  --resource-group rg-crm-basico \
  --name crm-basico-app

# Re-trigger deployment
az webapp deployment source sync \
  --resource-group rg-crm-basico \
  --name crm-basico-app
```

## 🔄 Próximos Pasos (Sprint 7)

- [ ] Configurar CI/CD completo con GitHub Actions
- [ ] Implementar deployment slots (staging/production)
- [ ] Configurar custom domain y SSL
- [ ] Implementar Application Insights para monitoring
- [ ] Configurar auto-scaling rules
- [ ] Documentar estrategia de backup y disaster recovery

## 📞 Soporte

- **Documentación Azure:** [docs.microsoft.com/azure](https://docs.microsoft.com/azure)
- **Troubleshooting:** Ver `azure-troubleshooting.md`
- **Issues del proyecto:** [GitHub Issues](https://github.com/Jorgez-tech/crm-basico/issues)

---

**Última actualización:** 2025-08-29  
**Responsable:** Jorge Zuta  
**Sprint:** 6 - Cloud Migration y Azure  
**Estado:** En desarrollo  
