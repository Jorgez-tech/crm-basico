require('dotenv').config();

/**
 * CRM Básico - Configuración de Base de Datos
 * Maneja la conexión y operaciones con MySQL usando un pool de conexiones.
 */

const mysql = require('mysql2/promise');
const { loggers } = require('./logger');

// Configuración de la base de datos usando variables de entorno de Railway
// Railway proporciona: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQL_DATABASE, MYSQLPORT
// También soporta variables alternativas: DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    // En local, a veces root no tiene contraseña, o es 'root', o 'admin'.
    // Si no hay variable de entorno, probamos vacía por defecto.
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'crm_basico', // Cambiado default a crm_basico
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
    // Railway MySQL requiere SSL en producción
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Log de diagnóstico para la configuración de la base de datos
loggers.info('Database configuration being used:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: dbConfig.ssl ? 'enabled' : 'disabled',
    password: '***' // Ocultar la contraseña en los logs
});

// Solo loguear variables de entorno en desarrollo
if (process.env.NODE_ENV === 'development') {
    console.log('DB Environment variables:', {
        MYSQLHOST: process.env.MYSQLHOST || 'not set',
        MYSQLUSER: process.env.MYSQLUSER || 'not set',
        MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'not set',
        MYSQLPORT: process.env.MYSQLPORT || 'not set',
        MYSQL_URL: process.env.MYSQL_URL ? 'set' : 'not set'
    });
}

let pool = null;

/**
 * Establece un pool de conexiones con la base de datos
 */
async function connect() {
    try {
        let connection = null;
        let usedUrl = false;

        // Intentar primero con MYSQL_URL si existe
        if (process.env.MYSQL_URL) {
            try {
                loggers.info('Intentando conectar usando MYSQL_URL...');
                pool = mysql.createPool({
                    uri: process.env.MYSQL_URL,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0
                });

                // Verificar conexión
                connection = await pool.getConnection();
                usedUrl = true;
                loggers.info('Conexión exitosa usando MYSQL_URL');
            } catch (error) {
                loggers.warn('Fallo la conexión usando MYSQL_URL:', error.message);
                // Si estamos en producción, esto es fatal. En desarrollo, intentamos fallback.
                if (process.env.NODE_ENV === 'production') throw error;

                // IMPORTANTE: Resetear pool a null para permitir el fallback
                try {
                    if (pool) await pool.end();
                } catch (e) {
                    // Ignorar errores al cerrar un pool que ya falló
                }
                pool = null;
            }
        }

        // Si no se pudo conectar con URL (o no existía), intentar con configuración individual
        if (!pool) {
            loggers.info('Intentando conectar usando configuración individual/local...');

            // Verificar si la configuración individual también apunta a Railway en local
            if (process.env.NODE_ENV !== 'production' && dbConfig.host && dbConfig.host.includes('railway.internal')) {
                loggers.warn('ADVERTENCIA: La configuración individual apunta a un host interno de Railway (' + dbConfig.host + ') que no es accesible localmente.');
                loggers.warn('Intentando forzar conexión a localhost...');
                dbConfig.host = 'localhost';
                // Asegurar usuario root si no está definido para localhost
                if (dbConfig.user === 'root' && !process.env.DB_USER) {
                    dbConfig.user = 'root';
                }
            }

            pool = mysql.createPool(dbConfig);
            try {
                connection = await pool.getConnection();
                loggers.info('Conexión exitosa usando configuración individual');
            } catch (error) {
                loggers.error('Fallo la conexión con configuración individual:', error.message);
                throw error;
            }
        }

        // Si llegamos aquí, tenemos una conexión válida
        if (connection) {
            loggers.info('Pool de conexiones a MySQL creado y verificado', {
                host: usedUrl ? 'MYSQL_URL' : dbConfig.host,
                database: dbConfig.database
            });
            connection.release();
        }

        // Verificar que las tablas existan
        await initializeTables();

        return pool;
    } catch (error) {
        loggers.error('Error fatal creando el pool de conexiones a MySQL', error);

        // Mensaje de ayuda específico para el error de Railway en local
        if ((error.code === 'ENOTFOUND' && (error.hostname || '').includes('railway.internal')) ||
            (error.message && error.message.includes('railway.internal'))) {
            console.error('\n\x1b[33m%s\x1b[0m', '================================================================');
            console.error('\x1b[33m%s\x1b[0m', '⚠️  ERROR DE CONFIGURACIÓN DETECTADO');
            console.error('\x1b[33m%s\x1b[0m', 'Estás intentando conectarte a la base de datos interna de Railway desde tu entorno local.');
            console.error('\x1b[33m%s\x1b[0m', 'Esto no funcionará porque esa dirección solo es accesible dentro de la red de Railway.');
            console.error('\x1b[33m%s\x1b[0m', 'SOLUCIÓN:');
            console.error('\x1b[33m%s\x1b[0m', '1. Abre tu archivo .env');
            console.error('\x1b[33m%s\x1b[0m', '2. Comenta o elimina MYSQL_URL y MYSQLHOST si apuntan a railway.internal');
            console.error('\x1b[33m%s\x1b[0m', '3. Asegúrate de tener una base de datos local corriendo (ej. XAMPP, MySQL Workbench)');
            console.error('\x1b[33m%s\x1b[0m', '================================================================\n');
        }

        throw error;
    }
}

/**
 * Inicializa las tablas necesarias si no existen
 */
async function initializeTables() {
    try {
        const [tables] = await pool.execute("SHOW TABLES LIKE 'contactos'");
        loggers.debug('Tablas encontradas:', tables);

        if (tables.length === 0) {
            loggers.warn('Tabla contactos no encontrada. Intentando crearla...');
            await pool.execute(`
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            loggers.info('Tabla contactos creada exitosamente.');
        } else {
            loggers.info('Tabla contactos ya existe.');
        }
    } catch (error) {
        loggers.error('Error inicializando tablas', error);
        throw error;
    }
}

/**
 * Obtiene todos los contactos
 */
async function getAllContactos() {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM contactos ORDER BY fecha_creacion DESC'
        );
        return rows;
    } catch (error) {
        loggers.error('Error obteniendo contactos', error);
        throw error;
    }
}

/**
 * Obtiene un contacto por ID
 */
async function getContactoById(id) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM contactos WHERE id = ?',
            [id]
        );
        return rows[0];
    } catch (error) {
        loggers.error('Error obteniendo contacto', error, { id });
        throw error;
    }
}

/**
 * Crea un nuevo contacto
 */
async function createContacto(contactoData) {
    try {
        const { nombre, correo, telefono, empresa, estado } = contactoData;
        loggers.debug('Intentando insertar contacto:', { nombre, correo, telefono, empresa, estado });

        const [result] = await pool.execute(
            'INSERT INTO contactos (nombre, correo, telefono, empresa, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, telefono || null, empresa || null, estado || 'prospecto']
        );

        loggers.debug('Resultado del INSERT:', result);

        loggers.database('INSERT', 'contactos', {
            insertId: result.insertId,
            affectedRows: result.affectedRows,
            nombre: nombre,
            correo: correo
        });

        return result.insertId;
    } catch (error) {
        loggers.error('Error creando contacto', error, { contactoData });
        throw error;
    }
}

/**
 * Actualiza un contacto existente
 */
async function updateContacto(id, contactoData) {
    try {
        const { nombre, correo, telefono, empresa, estado } = contactoData;
        const [result] = await pool.execute(
            'UPDATE contactos SET nombre = ?, correo = ?, telefono = ?, empresa = ?, estado = ? WHERE id = ?',
            [nombre, correo, telefono || null, empresa || null, estado || 'prospecto', id]
        );

        loggers.database('UPDATE', 'contactos', {
            id: id,
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });

        return result.affectedRows > 0;
    } catch (error) {
        loggers.error('Error actualizando contacto', error, { id, contactoData });
        throw error;
    }
}

/**
 * Elimina un contacto
 */
async function deleteContacto(id) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM contactos WHERE id = ?',
            [id]
        );

        loggers.database('DELETE', 'contactos', {
            id: id,
            affectedRows: result.affectedRows
        });

        return result.affectedRows > 0;
    } catch (error) {
        loggers.error('Error eliminando contacto', error, { id });
        throw error;
    }
}

/**
 * Busca contactos por término
 */
async function searchContactos(searchTerm) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM contactos WHERE nombre LIKE ? OR correo LIKE ? OR empresa LIKE ? ORDER BY fecha_creacion DESC',
            [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
        );
        return rows;
    } catch (error) {
        loggers.error('Error buscando contactos', error, { searchTerm });
        throw error;
    }
}

/**
 * Obtiene estadísticas básicas
 */
async function getStats() {
    try {
        const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM contactos');
        const [prospectoRows] = await pool.execute('SELECT COUNT(*) as prospectos FROM contactos WHERE estado = "prospecto"');
        const [clienteRows] = await pool.execute('SELECT COUNT(*) as clientes FROM contactos WHERE estado = "cliente"');
        const [inactivoRows] = await pool.execute('SELECT COUNT(*) as inactivos FROM contactos WHERE estado = "inactivo"');

        return {
            total: totalRows[0].total,
            prospectos: prospectoRows[0].prospectos,
            clientes: clienteRows[0].clientes,
            inactivos: inactivoRows[0].inactivos
        };
    } catch (error) {
        loggers.error('Error obteniendo estadísticas', error);
        throw error;
    }
}

/**
 * Verifica la conexión a la base de datos
 * Usado por el health check endpoint
 */
async function checkConnection() {
    try {
        if (!pool) {
            return false;
        }
        // Obtener una conexión del pool y ejecutar una consulta simple
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        return true;
    } catch (error) {
        // No loguear errores de conexión aquí para no llenar los logs en chequeos de salud
        return false;
    }
}

/**
 * Cierra el pool de conexiones a la base de datos
 */
async function close() {
    if (pool) {
        await pool.end();
        loggers.info('Pool de conexiones a base de datos cerrado');
    }
}

// Exportar funciones
module.exports = {
    connect,
    close,
    checkConnection,
    getAllContactos,
    getContactoById,
    createContacto,
    updateContacto,
    deleteContacto,
    searchContactos,
    getStats
};

// Test de conexión inicial
if (process.env.NODE_ENV !== 'test') {
    (async () => {
        try {
            await connect(); // Inicializar el pool primero
            console.log('Conexión a base de datos establecida.');
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error.message);
            // Solo terminar el proceso en producción
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            }
        }
    })();
}