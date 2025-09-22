/**
 * CRM Básico - Configuración de Base de Datos
 * Maneja la conexión y operaciones con MySQL usando un pool de conexiones.
 */

const mysql = require('mysql2/promise');
const { loggers } = require('./logger');

// Configuración de la base de datos
// Actualización de las variables de entorno para que coincidan con Railway
const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS || 'mysql',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'crm_basico',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    ssl: (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Log de diagnóstico para la configuración de la base de datos
loggers.info('Database configuration being used:', dbConfig);

let pool = null;

/**
 * Establece un pool de conexiones con la base de datos
 */
async function connect() {
    try {
        pool = mysql.createPool(dbConfig);

        // Verificar la conexión obteniendo una del pool
        const connection = await pool.getConnection();
        loggers.info('📊 Pool de conexiones a MySQL creado y verificado', {
            host: dbConfig.host,
            database: dbConfig.database,
            port: dbConfig.port
        });
        connection.release(); // Liberar la conexión de prueba

        // Verificar que las tablas existan
        await initializeTables();

        return pool;
    } catch (error) {
        loggers.error('❌ Error creando el pool de conexiones a MySQL', error, { config: dbConfig });
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
                CREATE TABLE contactos (
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
            loggers.info('✅ Tabla contactos creada exitosamente.');
        } else {
            loggers.info('✅ Tabla contactos ya existe.');
        }
    } catch (error) {
        loggers.error('❌ Error inicializando tablas', error);
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
        loggers.error('❌ Error obteniendo contactos', error);
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
        loggers.error('❌ Error obteniendo contacto', error, { id });
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
        loggers.error('❌ Error creando contacto', error, { contactoData });
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
        loggers.error('❌ Error actualizando contacto', error, { id, contactoData });
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
        loggers.error('❌ Error eliminando contacto', error, { id });
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
        loggers.error('❌ Error buscando contactos', error, { searchTerm });
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
        loggers.error('❌ Error obteniendo estadísticas', error);
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
        loggers.info('🔌 Pool de conexiones a base de datos cerrado');
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