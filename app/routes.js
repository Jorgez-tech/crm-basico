/**
 * CRM Básico - Rutas de la Aplicación
 * Define todas las rutas y controladores
 * 
 * TODO: Separar en controladores individuales
 * TODO: Agregar middleware de autenticación
 * TODO: Implementar rate limiting
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./database');
const utils = require('./utils');
const { loggers } = require('./logger');

const router = express.Router();

// ==================== HEALTH CHECK ====================
// Bloque 6: Ruta /status para monitoreo de app y base de datos
router.get('/status', async (req, res) => {
    let dbStatus = false;
    try {
        dbStatus = await database.checkConnection();
    } catch (e) { }
    res.json({
        app: 'ok',
        db: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});
/**
 * GET /health - Health check endpoint para monitoreo
 * Verifica estado del servidor y conexión a la base de datos
 */
router.get('/health', async (req, res) => {
    const startTime = Date.now();

    try {
        // Verificar conexión a la base de datos
        const dbStatus = await database.checkConnection();
        const responseTime = Date.now() - startTime;

        const healthData = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: dbStatus ? 'connected' : 'disconnected',
                responseTime: dbStatus ? `${responseTime}ms` : 'timeout'
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB'
            }
        };

        // Si la base de datos no responde, devolver status degraded
        if (!dbStatus) {
            healthData.status = 'degraded';
            return res.status(503).json(healthData);
        }

        res.json(healthData);
    } catch (error) {
        loggers.error('❌ Error en health check', error);

        const errorResponse = {
            status: 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${Date.now() - startTime}ms`,
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: 'error',
                error: error.message
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB'
            }
        };

        res.status(500).json(errorResponse);
    }
});

// ==================== RUTA PRINCIPAL ====================
/**
 * GET / - Página principal (dashboard o bienvenida)
 */
router.get('/', async (req, res) => {
    try {
        const stats = await database.getStats();
        let posts = [];
        try {
            posts = await utils.fetchExternalPosts();
            posts = posts.slice(0, 3);
        } catch (error) {
            console.warn('⚠️ No se pudieron obtener posts externos:', error.message);
        }
        // Flash message para error CSRF
        let error = req.query.error || null;
        if (req.session.csrfError) {
            error = req.session.csrfError;
            req.session.csrfError = null;
        }
        res.render('index', {
            title: 'CRM Básico - Dashboard',
            stats,
            posts,
            csrfToken: req.csrfToken(),
            message: req.query.message || null,
            error
        });
    } catch (error) {
        console.error('❌ Error en ruta principal:', error);
        res.status(500).render('error', {
            title: 'Error del servidor',
            error: error,
            csrfToken: req.csrfToken()
        });
    }
});

/**
 * GET / - Página principal con lista de contactos
 */
router.get('/contactos', async (req, res) => {
    try {
        let contactos;
        let searchTerm = req.query.q || '';
        if (searchTerm.trim()) {
            contactos = await database.searchContactos(searchTerm);
        } else {
            contactos = await database.getAllContactos();
        }
        res.render('contactos', {
            title: searchTerm ? `Resultados de búsqueda: "${searchTerm}"` : 'Lista de Contactos',
            contactos,
            searchTerm,
            csrfToken: req.csrfToken(),
            message: req.query.message || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('❌ Error en ruta de contactos:', error);
        res.status(500).render('error', {
            title: 'Error del servidor',
            error: error,
            csrfToken: req.csrfToken()
        });
    }
});

// ==================== RUTAS DE CONTACTOS ====================

/**
 * POST /contactos - Crear nuevo contacto
 */
router.post('/contactos',
    // Validaciones
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('correo')
        .isEmail()
        .withMessage('El correo electrónico no es válido')
        .normalizeEmail(),
    body('telefono')
        .optional()
        .isMobilePhone('any')
        .withMessage('El teléfono no es válido'),
    body('empresa')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El nombre de la empresa es demasiado largo'),
    body('estado')
        .optional()
        .isIn(['prospecto', 'cliente', 'inactivo'])
        .withMessage('Estado no válido'),

    async (req, res) => {
        try {
            // Log de diagnóstico: Mostrar los datos recibidos del formulario
            loggers.info('Attempting to create contact with data:', req.body);

            // Verificar errores de validación
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg).join(', ');
                return res.redirect(`/?error=${encodeURIComponent(errorMessages)}`);
            }

            // Crear contacto
            const newContactId = await database.createContacto({
                nombre: req.body.nombre,
                correo: req.body.correo,
                telefono: req.body.telefono,
                empresa: req.body.empresa,
                estado: req.body.estado || 'prospecto'
            });

            // Log de diagnóstico: Confirmar que la inserción fue exitosa
            loggers.info(`Contact created successfully in DB with ID: ${newContactId}`);

            res.redirect(`/?message=${encodeURIComponent('Contacto creado exitosamente')}`);
        } catch (error) {
            // Log de diagnóstico: Registrar el error exacto al crear el contacto
            loggers.error('❌ Critical error creating contact:', {
                errorMessage: error.message,
                errorCode: error.code,
                stack: error.stack,
                requestBody: req.body
            });

            // Verificar si es error de duplicado (correo ya existe)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.redirect(`/?error=${encodeURIComponent('Ya existe un contacto con ese correo electrónico')}`);
            }

            res.redirect(`/?error=${encodeURIComponent('Error al crear el contacto')}`);
        }
    }
);

/**
 * GET /contactos/:id/editar - Formulario de edición
 */
router.get('/contactos/:id/editar', async (req, res) => {
    try {
        const contacto = await database.getContactoById(req.params.id);

        if (!contacto) {
            return res.redirect(`/?error=${encodeURIComponent('Contacto no encontrado')}`);
        }

        const csrfToken = req.csrfToken();
        console.log('[GET /contactos/:id/editar] sessionID:', req.sessionID, 'csrfToken:', csrfToken);
        console.log('CSRF Secret en sesión:', req.session && req.session.csrfSecret);
        res.render('edit', {
            title: 'Editar Contacto',
            contacto,
            csrfToken,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('❌ Error obteniendo contacto para editar:', error);
        res.redirect(`/?error=${encodeURIComponent('Error al cargar el contacto')}`);
    }
});

/**
 * POST /contactos/:id - Actualizar contacto
 */
router.post('/contactos/:id',
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('correo')
        .isEmail()
        .withMessage('El correo electrónico no es válido')
        .normalizeEmail(),
    body('telefono')
        .optional()
        .isMobilePhone('any')
        .withMessage('El teléfono no es válido'),
    body('empresa')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El nombre de la empresa es demasiado largo'),
    body('estado')
        .optional()
        .isIn(['prospecto', 'cliente', 'inactivo'])
        .withMessage('Estado no válido'),

    async (req, res) => {
        // LOGS DE DEPURACIÓN
        console.log('--- [POST /contactos/:id] ---');
        console.log('SessionID:', req.sessionID);
        console.log('CSRF Token enviado:', req.body._csrf);
        console.log('CSRF Secret en sesión:', req.session && req.session.csrfSecret);
        console.log('Params:', req.params);
        console.log('Body:', req.body);
        try {
            // Verificar errores de validación
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg).join(', ');
                console.log('Errores de validación:', errorMessages);
                return res.redirect(`/contactos/${req.params.id}/editar?error=${encodeURIComponent(errorMessages)}`);
            }

            // Actualizar contacto
            const updated = await database.updateContacto(req.params.id, {
                nombre: req.body.nombre,
                correo: req.body.correo,
                telefono: req.body.telefono,
                empresa: req.body.empresa,
                estado: req.body.estado
            });

            if (updated) {
                console.log('Contacto actualizado correctamente');
                res.redirect(`/contactos?message=${encodeURIComponent('Contacto actualizado exitosamente')}`);
            } else {
                console.log('No se pudo actualizar el contacto');
                res.redirect(`/contactos?error=${encodeURIComponent('No se pudo actualizar el contacto')}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando contacto:', error);

            // Verificar si es error de duplicado
            if (error.code === 'ER_DUP_ENTRY') {
                return res.redirect(`/contactos/${req.params.id}/editar?error=${encodeURIComponent('Ya existe un contacto con ese correo electrónico')}`);
            }

            res.redirect(`/contactos/${req.params.id}/editar?error=${encodeURIComponent('Error al actualizar el contacto')}`);
        }
    }
);

/**
 * POST /contactos/:id/eliminar - Eliminar contacto
 */
router.post('/contactos/:id/eliminar', async (req, res) => {
    try {
        const deleted = await database.deleteContacto(req.params.id);

        if (deleted) {
            res.redirect(`/?message=${encodeURIComponent('Contacto eliminado exitosamente')}`);
        } else {
            res.redirect(`/?error=${encodeURIComponent('No se pudo eliminar el contacto')}`);
        }
    } catch (error) {
        console.error('❌ Error eliminando contacto:', error);
        res.redirect(`/?error=${encodeURIComponent('Error al eliminar el contacto')}`);
    }
});

// ==================== RUTA DE BÚSQUEDA ====================

/**
 * GET /buscar - Buscar contactos
 */
router.get('/buscar', async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        if (!searchTerm.trim()) {
            return res.redirect('/contactos');
        }
        // Redirigir a /contactos con el parámetro de búsqueda
        return res.redirect(`/contactos?q=${encodeURIComponent(searchTerm)}`);
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        res.redirect('/contactos?error=Error%20al%20realizar%20la%20búsqueda');
    }
});

// ==================== RUTAS API (JSON) ====================

/**
 * GET /api/contactos - API para obtener contactos (para uso futuro)
 */
router.get('/api/contactos', async (req, res) => {
    try {
        const contactos = await database.getAllContactos();
        const stats = await database.getStats();

        res.json({
            success: true,
            data: {
                contactos,
                stats
            }
        });
    } catch (error) {
        console.error('❌ Error en API contactos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/stats - API para obtener estadísticas
 */
router.get('/api/stats', async (req, res) => {
    try {
        const stats = await database.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Error en API stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
