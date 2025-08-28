# Sistema de Logging - CRM Básico

## Descripción

El proyecto utiliza **Winston** para logging estructurado, proporcionando logs organizados tanto para desarrollo como para producción.

## Configuración

### Niveles de Log

- `error`: Errores críticos que requieren atención inmediata
- `warn`: Advertencias que pueden indicar problemas potenciales  
- `info`: Información general del flujo de la aplicación
- `http`: Logs de peticiones HTTP
- `debug`: Información detallada para desarrollo

### Formatos

**Desarrollo (consola):**
```
2025-08-27 20:59:14:5914 info: 📊 Conectado a MySQL
```

**Producción (archivos JSON):**
```json
{
  "timestamp": "2025-08-27T20:59:14.591Z",
  "level": "info",
  "message": "📊 Conectado a MySQL",
  "threadId": 12345,
  "host": "127.0.0.1",
  "database": "crm_basico",
  "environment": "production"
}
```

## Archivos de Log (Producción)

Los logs se guardan en el directorio `logs/`:

- `error.log`: Solo errores críticos
- `combined.log`: Todos los logs excepto debug
- `access.log`: Logs de peticiones HTTP

### Rotación de Archivos

- Tamaño máximo: 5MB por archivo
- Máximo de archivos: 5 por tipo
- Rotación automática al alcanzar el límite

## Variables de Entorno

```bash
# Nivel de logging (error, warn, info, http, debug)
LOG_LEVEL=info

# Forzar logging a archivos en desarrollo
LOG_TO_FILE=true

# Ambiente (afecta formato y destino)
NODE_ENV=production
```

## Uso en el Código

### Logger Principal

```javascript
const { loggers } = require('./logger');

// Información general
loggers.info('Operación completada', { userId: 123, operation: 'create' });

// Errores con contexto
loggers.error('Error en la operación', error, { userId: 123, operation: 'update' });

// Advertencias
loggers.warn('Configuración faltante', { config: 'DATABASE_URL' });

// Debug (solo en desarrollo)
loggers.debug('Estado interno', { state: 'processing', step: 1 });
```

### Logging Especializado

```javascript
// Peticiones HTTP (automático con middleware)
loggers.http(req, res, responseTime);

// Operaciones de base de datos
loggers.database('INSERT', 'contactos', { insertId: 123, affectedRows: 1 });

// Eventos de seguridad
loggers.security('CSRF token inválido', { tokenProvided: false }, req);

// Métricas de aplicación
loggers.metrics('response_time', 234, { endpoint: '/api/contactos' });
```

### Middleware HTTP

```javascript
const { httpLoggerMiddleware } = require('./logger');

// Se aplica automáticamente en app/main.js
app.use(httpLoggerMiddleware);
```

## Configuración por Ambiente

### Desarrollo
- Logs en consola con colores
- Nivel: `debug` (todos los logs)
- Formato legible para humanos

### Testing
- Logs suprimidos por defecto
- Variable `VERBOSE_TESTS=true` para activar
- Base de datos de test separada

### Producción
- Logs en archivos JSON
- Nivel: `info` (sin debug)
- Formato estructurado para herramientas

## Monitoreo y Análisis

### Health Check
El endpoint `/health` incluye métricas del sistema:

```json
{
  "status": "ok",
  "timestamp": "2025-08-27T20:59:14.591Z",
  "uptime": 3600,
  "responseTime": "15ms",
  "environment": "production",
  "database": {
    "status": "connected",
    "responseTime": "12ms"
  },
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  }
}
```

### Integración con Herramientas

Los logs en formato JSON son compatibles con:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Fluentd**
- **CloudWatch Logs**
- **Grafana Loki**

## Mejores Prácticas

1. **Usar niveles apropiados:**
   - `error`: Fallos que afectan funcionalidad
   - `warn`: Situaciones anómalas pero no críticas
   - `info`: Eventos importantes del negocio
   - `debug`: Información técnica detallada

2. **Incluir contexto relevante:**
   ```javascript
   // ❌ Mal
   loggers.info('Usuario logueado');
   
   // ✅ Bien
   loggers.info('Usuario logueado', { 
     userId: 123, 
     email: 'user@example.com',
     loginMethod: 'password'
   });
   ```

3. **No loguear información sensible:**
   - Passwords
   - Tokens de sesión completos
   - Datos de tarjetas de crédito
   - Información personal identificable

4. **Usar contexto de request:**
   ```javascript
   loggers.error('Error procesando solicitud', error, {
     sessionId: req.sessionID,
     ip: req.ip,
     userAgent: req.get('User-Agent'),
     url: req.url,
     method: req.method
   });
   ```

## Troubleshooting

### Logs no aparecen en consola
- Verificar `NODE_ENV` (debe ser diferente de 'production')
- Verificar nivel de log con `LOG_LEVEL`

### Logs no se guardan en archivos
- Verificar que el directorio `logs/` exista
- Verificar permisos de escritura
- Revisar espacio en disco

### Performance impact
- En producción, evitar nivel `debug`
- Considerar usar log sampling para alto tráfico
- Monitorear el tamaño de archivos de log

## Recursos Adicionales

- [Documentación Winston](https://github.com/winstonjs/winston)
- [Best Practices for Logging](https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/)
- [Structured Logging](https://www.honeycomb.io/blog/structured-logging-and-your-team)
