/**
 * CRM Básico - Logger Estructurado
 * Configuración de Winston para logging avanzado
 * 
 * Niveles de log:
 * - error: Errores críticos que requieren atención inmediata
 * - warn: Advertencias que pueden indicar problemas potenciales
 * - info: Información general del flujo de la aplicación
 * - http: Logs de peticiones HTTP
 * - debug: Información detallada para desarrollo
 */

const winston = require('winston');
const path = require('path');

// Configuración de niveles customizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Colores para la consola
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(colors);

// Formato para development (consola)
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Formato para production (archivos)
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');

// Configuración de transportes
const transports = [];

// Consola (siempre activa en development)
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: devFormat
        })
    );
}

// Archivo para production o si se especifica explícitamente
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    // Log de errores
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: prodFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );

    // Log combinado
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: prodFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );

    // Log de acceso HTTP
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'access.log'),
            level: 'http',
            format: prodFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Crear logger principal
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports,
    exitOnError: false
});

// Funciones de conveniencia con contexto
const logWithContext = (level, message, context = {}) => {
    const logData = {
        message,
        ...context,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        environment: process.env.NODE_ENV || 'development'
    };

    logger.log(level, logData.message, logData);
};

// Funciones específicas para diferentes tipos de eventos
const loggers = {
    // Información general
    info: (message, context) => logWithContext('info', message, context),

    // Errores
    error: (message, error, context) => {
        const errorContext = {
            ...context,
            error: {
                message: error?.message,
                stack: error?.stack,
                code: error?.code,
                name: error?.name
            }
        };
        logWithContext('error', message, errorContext);
    },

    // Advertencias
    warn: (message, context) => logWithContext('warn', message, context),

    // Debug
    debug: (message, context) => logWithContext('debug', message, context),

    // Peticiones HTTP
    http: (req, res, responseTime) => {
        const httpContext = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            sessionId: req.sessionID
        };

        logWithContext('http', `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`, httpContext);
    },

    // Eventos de base de datos
    database: (operation, table, context) => {
        const dbContext = {
            ...context,
            operation,
            table,
            type: 'database'
        };
        logWithContext('info', `Database ${operation} on ${table}`, dbContext);
    },

    // Eventos de seguridad
    security: (event, details, req) => {
        const securityContext = {
            ...details,
            type: 'security',
            ip: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get('User-Agent'),
            sessionId: req?.sessionID
        };
        logWithContext('warn', `Security event: ${event}`, securityContext);
    },

    // Métricas de aplicación
    metrics: (metric, value, context) => {
        const metricsContext = {
            ...context,
            metric,
            value,
            type: 'metrics'
        };
        logWithContext('info', `Metric ${metric}: ${value}`, metricsContext);
    }
};

// Middleware para logging de peticiones HTTP
const httpLoggerMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const responseTime = Date.now() - start;
        loggers.http(req, res, responseTime);
    });

    next();
};

module.exports = {
    logger,
    loggers,
    httpLoggerMiddleware
};
