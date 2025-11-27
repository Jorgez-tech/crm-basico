/**
 * CRM Básico - Rutas de la Aplicación
 * Define todas las rutas y delega a los controladores
 */

const express = require('express');
const router = express.Router();

// Controladores
const mainController = require('./controllers/mainController');
const contactController = require('./controllers/contactController');
const apiController = require('./controllers/apiController');

// ==================== HEALTH CHECK ====================
router.get('/status', mainController.getStatus);
router.get('/health', mainController.getHealth);

// ==================== RUTA PRINCIPAL ====================
router.get('/', mainController.getDashboard);

// ==================== RUTAS DE CONTACTOS ====================
router.get('/contactos', contactController.getAllContacts);
router.post('/contactos', contactController.contactValidationRules, contactController.createContact);
router.get('/contactos/:id/editar', contactController.getEditForm);
router.post('/contactos/:id', contactController.contactValidationRules, contactController.updateContact);
router.post('/contactos/:id/eliminar', contactController.deleteContact);

// ==================== RUTA DE BÚSQUEDA ====================
router.get('/buscar', contactController.searchContacts);

// ==================== RUTAS API (JSON) ====================
router.get('/api/contactos', apiController.getContacts);
router.get('/api/stats', apiController.getStats);

module.exports = router;
