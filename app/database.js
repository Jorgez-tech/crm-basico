/**
 * CRM Básico - Configuración de Base de Datos
 * Maneja la conexión y operaciones con MySQL
 * 
 * TODO: Implementar pool de conexiones
 * TODO: Agregar logging de consultas
 * TODO: Implementar migraciones automáticas
 */

const mysql = require('mysql2/promise');
const { loggers } = require('./logger');

// Bloque 4: Validación de variables de entorno para la base de datos
// Usar variables Railway: DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, DB_SSL
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'mysql',
    database: process.env.DB_NAME || 'crm_basico',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let connection = null;

/**
 * Establece conexión con la base de datos
 */
async function connect() {
    try {
        connection = await mysql.createConnection(dbConfig);
        loggers.info('📊 Conectado a MySQL', {
            threadId: connection.threadId,
            host: dbConfig.host,
            database: dbConfig.database,
            port: dbConfig.port
        });

        // Verificar que las tablas existan
        await initializeTables();

        return connection;
    } catch (error) {
        loggers.error('❌ Error conectando a MySQL', error, { config: dbConfig });
        throw error;
    }
}

/**
 * Inicializa las tablas necesarias si no existen
 */
async function initializeTables() {
    try {
        // Crear tabla contactos si no existe
        const createContactosTable = `
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
        `;

        await connection.execute(createContactosTable);
        loggers.info('✅ Tabla contactos verificada/creada');

        // TODO: Crear tablas adicionales para funcionalidades futuras
        /*
        const createNotasTable = `
            CREATE TABLE IF NOT EXISTS notas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                contacto_id INT,
                nota TEXT,
                tipo ENUM('llamada', 'email', 'reunion', 'otro') DEFAULT 'otro',
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await connection.execute(createNotasTable);
        */

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
        const [rows] = await connection.execute(
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
        const [rows] = await connection.execute(
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
        const [result] = await connection.execute(
            'INSERT INTO contactos (nombre, correo, telefono, empresa, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, telefono || null, empresa || null, estado || 'prospecto']
        );

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
        const [result] = await connection.execute(
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
        const [result] = await connection.execute(
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
        const [rows] = await connection.execute(
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
        const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM contactos');
        const [prospectoRows] = await connection.execute('SELECT COUNT(*) as prospectos FROM contactos WHERE estado = "prospecto"');
        const [clienteRows] = await connection.execute('SELECT COUNT(*) as clientes FROM contactos WHERE estado = "cliente"');
        const [inactivoRows] = await connection.execute('SELECT COUNT(*) as inactivos FROM contactos WHERE estado = "inactivo"');

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
        if (!connection) {
            return false;
        }

        // Ejecutar una consulta simple para verificar la conexión
        await connection.execute('SELECT 1');
        return true;
    } catch (error) {
        loggers.error('❌ Error verificando conexión', error);
        return false;
    }
}

/**
 * Cierra la conexión a la base de datos
 */
async function close() {
    if (connection) {
        await connection.end();
        loggers.info('🔌 Conexión a base de datos cerrada');
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
