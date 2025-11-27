const database = require('../database');
const utils = require('../utils');
const { loggers } = require('../logger');

const getDashboard = async (req, res) => {
    try {
        const stats = await database.getStats();
        let posts = [];
        try {
            posts = await utils.fetchExternalPosts();
            posts = posts.slice(0, 3);
        } catch (error) {
            console.warn('No se pudieron obtener posts externos:', error.message);
        }

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
        console.error('Error en ruta principal:', error);
        res.status(500).render('error', {
            title: 'Error del servidor',
            error: error,
            csrfToken: req.csrfToken()
        });
    }
};

const getStatus = async (req, res) => {
    let dbStatus = false;
    try {
        dbStatus = await database.checkConnection();
    } catch (e) { }
    res.json({
        app: 'ok',
        db: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
};

const getHealth = async (req, res) => {
    const startTime = Date.now();

    try {
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

        if (!dbStatus) {
            healthData.status = 'degraded';
            return res.status(503).json(healthData);
        }

        res.json(healthData);
    } catch (error) {
        loggers.error('Error en health check', error);

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
};

module.exports = {
    getDashboard,
    getStatus,
    getHealth
};
