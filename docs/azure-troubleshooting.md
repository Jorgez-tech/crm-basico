# Azure Troubleshooting Guide - CRM Básico

## 🚨 Problemas Comunes y Soluciones

Esta guía documenta los problemas más frecuentes durante el despliegue y operación en Azure, junto con sus soluciones paso a paso.

### 📋 Índice de Problemas

1. [Problemas de Conexión a Base de Datos](#1-problemas-de-conexión-a-base-de-datos)
2. [App Service No Inicia](#2-app-service-no-inicia)
3. [Deploy Fallido](#3-deploy-fallido)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [SSL/TLS y Certificados](#5-ssltls-y-certificados)
6. [Performance y Recursos](#6-performance-y-recursos)

---

## 1. Problemas de Conexión a Base de Datos

### ❌ **Error:** `ER_ACCESS_DENIED_ERROR` o `Connection refused`

#### **Causas comunes:**
- Reglas de firewall incorrectas
- Credenciales de usuario mal configuradas
- SSL no habilitado cuando es requerido

#### **Solución paso a paso:**

```bash
# 1. Verificar reglas de firewall
az mysql server firewall-rule list \
  --resource-group rg-crm-basico \
  --server mysql-crm-basico-server \
  --output table

# 2. Agregar regla para servicios de Azure (si no existe)
az mysql server firewall-rule create \
  --resource-group rg-crm-basico \
  --server mysql-crm-basico-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3. Verificar configuración SSL
az mysql server show \
  --resource-group rg-crm-basico \
  --name mysql-crm-basico-server \
  --query "{sslEnforcement: sslEnforcement, userVisibleState: userVisibleState}"
```

#### **Verificar variables de entorno:**

```bash
# Revisar configuración actual
az webapp config appsettings list \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --query "[?name=='DB_HOST' || name=='DB_USER' || name=='DB_PASS']"
```

### ❌ **Error:** `ER_SSL_CONNECTION_ERROR`

#### **Solución:**
```bash
# Asegurar que SSL esté habilitado en variables de entorno
az webapp config appsettings set \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --settings DB_SSL=true
```

---

## 2. App Service No Inicia

### ❌ **Error:** `Application Error` o `502 Bad Gateway`

#### **Diagnóstico inicial:**

```bash
# Revisar logs en tiempo real
az webapp log tail \
  --resource-group rg-crm-basico \
  --name crm-basico-app

# Verificar estado del servicio
az webapp show \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --query "{state: state, availabilityState: availabilityState}"
```

### ❌ **Error:** `Cannot find module` o dependencias faltantes

#### **Solución:**
```bash
# Verificar que package.json esté presente en el deploy
az webapp deployment source show \
  --resource-group rg-crm-basico \
  --name crm-basico-app

# Forzar reinstalación de dependencias
az webapp restart \
  --resource-group rg-crm-basico \
  --name crm-basico-app
```

### ❌ **Error:** Puerto incorrecto

#### **Verificación y corrección:**
```bash
# Verificar configuración de puerto
az webapp config appsettings list \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --query "[?name=='PORT']"

# Configurar puerto correcto (Azure usa 8080)
az webapp config appsettings set \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --settings PORT=8080
```

---

## 3. Deploy Fallido

### ❌ **Error:** `Deployment failed with Error: Package deployment using ZIP Deploy failed`

#### **Diagnóstico:**
```bash
# Verificar últimos deployments
az webapp deployment list \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --output table

# Verificar logs de deployment
az webapp log deployment show \
  --resource-group rg-crm-basico \
  --name crm-basico-app
```

#### **Solución:**
```bash
# Limpiar caché y re-deployar
az webapp deployment source delete \
  --resource-group rg-crm-basico \
  --name crm-basico-app

# Reconfigurar source
az webapp deployment source config \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --repo-url https://github.com/Jorgez-tech/crm-basico \
  --branch feature/azure-deployment \
  --manual-integration

# Trigger nuevo deployment
az webapp deployment source sync \
  --resource-group rg-crm-basico \
  --name crm-basico-app
```

---

## 4. Variables de Entorno

### ❌ **Error:** Variables no se están aplicando

#### **Verificación completa:**
```bash
# Listar todas las variables
az webapp config appsettings list \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --output table

# Verificar variables específicas críticas
az webapp config appsettings list \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --query "[?name=='NODE_ENV' || name=='DB_HOST' || name=='SESSION_SECRET']"
```

#### **Aplicar configuración completa:**
```bash
# Configurar todas las variables críticas de una vez
az webapp config appsettings set \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_HOST=mysql-crm-basico-server.mysql.database.azure.com \
    DB_USER=crmadmin@mysql-crm-basico-server \
    DB_PASS=TuPasswordSeguro123! \
    DB_NAME=crm_basico \
    DB_SSL=true \
    SESSION_SECRET=tu-session-secret-super-seguro-de-32-caracteres-minimo
```

---

## 5. SSL/TLS y Certificados

### ❌ **Error:** `SSL_ERROR_SYSCALL` en conexión DB

#### **Verificación SSL MySQL:**
```bash
# Verificar configuración SSL del servidor MySQL
az mysql server show \
  --resource-group rg-crm-basico \
  --name mysql-crm-basico-server \
  --query "sslEnforcement"

# Si SSL está deshabilitado y quieres habilitarlo
az mysql server update \
  --resource-group rg-crm-basico \
  --name mysql-crm-basico-server \
  --ssl-enforcement Enabled
```

### ✅ **Verificar HTTPS en App Service:**
```bash
# Verificar que HTTPS esté habilitado
az webapp show \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --query "httpsOnly"

# Habilitar HTTPS only (recomendado para producción)
az webapp update \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --https-only true
```

---

## 6. Performance y Recursos

### ❌ **Error:** `503 Service Unavailable` o timeouts

#### **Verificar recursos del plan:**
```bash
# Verificar el plan de App Service
az appservice plan show \
  --resource-group rg-crm-basico \
  --name plan-crm-basico \
  --query "{sku: sku, numberOfWorkers: numberOfWorkers, status: status}"

# Verificar métricas de uso
az monitor metrics list \
  --resource-group rg-crm-basico \
  --resource crm-basico-app \
  --resource-type Microsoft.Web/sites \
  --metric "CpuPercentage" \
  --interval PT1H
```

#### **Escalamiento (si es necesario):**
```bash
# Escalar a un tier superior (costo adicional)
az appservice plan update \
  --resource-group rg-crm-basico \
  --name plan-crm-basico \
  --sku B1

# Escalar horizontalmente (más instancias)
az appservice plan update \
  --resource-group rg-crm-basico \
  --name plan-crm-basico \
  --number-of-workers 2
```

---

## 🔧 Comandos de Diagnóstico Útiles

### Health Check Manual
```bash
# Verificar health endpoint
curl -v https://crm-basico-app.azurewebsites.net/health

# Con formato JSON legible
curl -s https://crm-basico-app.azurewebsites.net/health | jq .
```

### Logs en Tiempo Real
```bash
# Stream de logs en vivo
az webapp log tail --resource-group rg-crm-basico --name crm-basico-app

# Descargar logs para análisis offline
az webapp log download \
  --resource-group rg-crm-basico \
  --name crm-basico-app \
  --log-file app-logs.zip
```

### Restart y Cleanup
```bash
# Restart del App Service
az webapp restart --resource-group rg-crm-basico --name crm-basico-app

# Stop y Start (para troubleshooting más profundo)
az webapp stop --resource-group rg-crm-basico --name crm-basico-app
az webapp start --resource-group rg-crm-basico --name crm-basico-app
```

---

## 📞 Escalación y Soporte

### Cuando contactar soporte Azure:
1. **Errores de infraestructura** no documentados aquí
2. **Problemas de facturación** o límites de suscripción
3. **Degradación de performance** sin causa aparente
4. **Errores de la plataforma Azure** misma

### Información útil para tickets de soporte:
- Resource Group: `rg-crm-basico`
- App Service: `crm-basico-app`
- MySQL Server: `mysql-crm-basico-server`
- Suscripción ID: `[tu-subscription-id]`
- Región: `East US`
- Timestamp del error
- Logs relevantes

---

## 📚 Referencias Adicionales

- [Azure App Service Troubleshooting](https://docs.microsoft.com/en-us/azure/app-service/troubleshoot-diagnostic-logs)
- [Azure Database for MySQL Troubleshooting](https://docs.microsoft.com/en-us/azure/mysql/howto-troubleshoot-common-errors)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)

---

**Última actualización:** 2025-08-29  
**Responsable:** Jorge Zuta  
**Sprint:** 6 - Cloud Migration y Azure
