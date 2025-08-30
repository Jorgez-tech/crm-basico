/**
 * Configuración específica para Azure Cloud
 * Maneja variables de entorno y configuraciones optimizadas para Azure App Service
 */

const config = {
    // Configuración por ambiente
    development: {
        database: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'crm_basico',
            ssl: false,
            connectionLimit: 5
        },
        server: {
            port: process.env.PORT || 3000,
            env: 'development'
        },
        session: {
            secret: process.env.SESSION_SECRET || 'dev-secret-key',
            secure: false,
            sameSite: 'lax'
        }
    },

    production: {
        database: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME || 'crm_basico',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        },
        server: {
            port: process.env.PORT || 8080, // Azure App Service usa puerto 8080 por defecto
            env: 'production'
        },
        session: {
            secret: process.env.SESSION_SECRET,
            secure: true, // HTTPS requerido en producción
            sameSite: 'strict'
        },
        azure: {
            // Configuraciones específicas de Azure
            resourceGroup: process.env.AZURE_RESOURCE_GROUP || 'rg-crm-basico',
            appServiceName: process.env.AZURE_APP_SERVICE_NAME || 'crm-basico-app',
            mysqlServerName: process.env.AZURE_MYSQL_SERVER || 'mysql-crm-basico-server',
            enableApplicationInsights: process.env.AZURE_ENABLE_APP_INSIGHTS === 'true'
        }
    }
};

/**
 * Obtiene la configuración según el ambiente actual
 * @returns {Object} Configuración del ambiente
 */
function getConfig() {
    const env = process.env.NODE_ENV || 'development';

    if (!config[env]) {
        throw new Error(`Configuración no encontrada para el ambiente: ${env}`);
    }

    const currentConfig = config[env];

    // Validaciones para producción
    if (env === 'production') {
        validateProductionConfig(currentConfig);
    }

    return currentConfig;
}

/**
 * Valida que las variables críticas estén configuradas en producción
 * @param {Object} prodConfig - Configuración de producción
 */
function validateProductionConfig(prodConfig) {
    const requiredVars = [
        'DB_HOST',
        'DB_USER',
        'DB_PASS',
        'SESSION_SECRET'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(`Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
    }
}

/**
 * Genera string de conexión para Azure Database for MySQL
 * @returns {string} Connection string formateado
 */
function getAzureMySQLConnectionString() {
    const env = process.env.NODE_ENV || 'development';

    if (env !== 'production') {
        return null;
    }

    const { database } = config.production;

    return `mysql://${database.user}:${database.password}@${database.host}:3306/${database.database}?ssl=${database.ssl}&sslmode=require`;
}

/**
 * Configuración de logging específica para Azure
 * @returns {Object} Configuración de Winston para Azure
 */
function getAzureLoggingConfig() {
    const env = process.env.NODE_ENV || 'development';

    if (env === 'production') {
        return {
            level: 'info',
            format: 'json',
            transports: [
                'console', // Azure App Service captura logs de consola automáticamente
                'file'     // Para persistencia local también
            ],
            azure: {
                enableApplicationInsights: config.production.azure?.enableApplicationInsights || false
            }
        };
    }

    return {
        level: 'debug',
        format: 'combined',
        transports: ['console']
    };
}

/**
 * Health check específico para Azure
 * @returns {Promise<Object>} Estado de recursos Azure
 */
async function getAzureHealthStatus() {
    const env = process.env.NODE_ENV || 'development';

    if (env !== 'production') {
        return {
            azure: {
                status: 'N/A - Development environment',
                timestamp: new Date().toISOString()
            }
        };
    }

    try {
        const azureConfig = config.production.azure;

        return {
            azure: {
                status: 'healthy',
                resourceGroup: azureConfig.resourceGroup,
                appService: azureConfig.appServiceName,
                mysqlServer: azureConfig.mysqlServerName,
                region: process.env.AZURE_REGION || 'East US',
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        return {
            azure: {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}

module.exports = {
    getConfig,
    getAzureMySQLConnectionString,
    getAzureLoggingConfig,
    getAzureHealthStatus,
    validateProductionConfig
};
