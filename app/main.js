/**
 * CRM Básico - Servidor Principal
 * Archivo principal que configura y arranca el servidor Express
 * 
 * TODO: Implementar autenticación de usuarios
 * TODO: Agregar middleware de logging
 * TODO: Configurar variables de entorno
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');

// Importar módulos locales
const routes = require('./routes');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CONFIGURACIÓN DE SEGURIDAD ====================

// Helmet con configuración personalizada
app.use(helmet({
    frameguard: false, // No usar X-Frame-Options, usar CSP
    xssFilter: false   // No usar x-xss-protection
}));

// Configuración de Content Security Policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com"
        ],
        fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "data:"
        ],
        imgSrc: ["'self'", 'data:', '*'],
        frameAncestors: ["'self'"] // Reemplaza X-Frame-Options
    },
}));

// ==================== CONFIGURACIÓN DE SESIONES ====================
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'crm_basico_secret_key_' + Math.random().toString(36).substring(2, 15),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Configuración de CSRF
// ==================== MIDDLEWARE ====================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Usar csurf con la configuración por defecto (usa req.session)
app.use((req, res, next) => {
    // Middleware para loguear el estado de la sesión y CSRF
    next();
});
app.use(csrf());
app.use((req, res, next) => {
    // Log después de csurf para ver el secreto y el token
    if (req.session) {
        console.log('SessionID:', req.sessionID);
        console.log('CSRF Secret en sesión:', req.session.csrfSecret);
    }
    try {
        const token = req.csrfToken();
        console.log('CSRF Token generado:', token);
    } catch (e) {
        console.log('No se pudo generar CSRF Token:', e.message);
    }
    next();
});

// Manejo de errores CSRF
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        console.log('❌ Error CSRF en:', req.method, req.path);
        console.log('SessionID:', req.sessionID);
        console.log('Headers referer:', req.get('Referer'));

        // Redirigir según el tipo de operación
        if (req.path.includes('/contactos/') && req.path.includes('/editar')) {
            // Error en edición - redirigir a la página de edición con error
            const contactId = req.path.split('/')[2];
            return res.redirect(`/contactos/${contactId}/editar?error=${encodeURIComponent('Token CSRF inválido. Recarga la página e intenta nuevamente.')}`);
        } else if (req.path.includes('/contactos/') && req.method === 'POST') {
            // Error en actualización de contacto - redirigir al home con error
            req.session.csrfError = 'Token CSRF inválido. Recarga la página e intenta nuevamente.';
            return res.redirect('/');
        } else {
            // Error general - redirigir al home
            req.session.csrfError = 'Token CSRF inválido. Recarga la página e intenta nuevamente.';
            return res.redirect('/');
        }
    } else {
        next(err);
    }
});


// ==================== CONFIGURACIÓN DE PLANTILLAS ====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Servir archivos estáticos con Cache-Control y cache busting
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css'), {
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
}));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js'), {
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
}));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==================== CONEXIÓN A BASE DE DATOS ====================
database.connect()
    .then(() => {
        console.log('✅ Conexión a base de datos establecida');
    })
    .catch(err => {
        console.error('❌ Error conectando a base de datos:', err);
        process.exit(1);
    });

// ==================== RUTAS ====================
app.use('/', routes);

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).render('404', {
        title: 'Página no encontrada',
        csrfToken: req.csrfToken()
    });
});

// ==================== MANEJO DE ERRORES GLOBAL ====================
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).render('error', {
        title: 'Error del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {},
        csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
    console.log(`🚀 Servidor CRM Básico ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado en: ${new Date().toLocaleString()}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🔄 Cerrando servidor...');
    database.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Cerrando servidor...');
    database.close();
    process.exit(0);
});

module.exports = app;
