const { body, validationResult } = require('express-validator');
const database = require('../database');
const { loggers } = require('../logger');

// Validaciones para crear/editar contacto
const contactValidationRules = [
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
        .withMessage('Estado no válido')
];

const getAllContacts = async (req, res) => {
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
        console.error('Error en ruta de contactos:', error);
        res.status(500).render('error', {
            title: 'Error del servidor',
            error: error,
            csrfToken: req.csrfToken()
        });
    }
};

const createContact = async (req, res) => {
    try {
        loggers.info('Attempting to create contact with data:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg).join(', ');
            return res.redirect(`/?error=${encodeURIComponent(errorMessages)}`);
        }

        const newContactId = await database.createContacto({
            nombre: req.body.nombre,
            correo: req.body.correo,
            telefono: req.body.telefono,
            empresa: req.body.empresa,
            estado: req.body.estado || 'prospecto'
        });

        loggers.info(`Contact created successfully in DB with ID: ${newContactId}`);

        res.redirect(`/?message=${encodeURIComponent('Contacto creado exitosamente')}`);
    } catch (error) {
        loggers.error('Critical error creating contact:', {
            errorMessage: error.message,
            errorCode: error.code,
            stack: error.stack,
            requestBody: req.body
        });

        if (error.code === 'ER_DUP_ENTRY') {
            return res.redirect(`/?error=${encodeURIComponent('Ya existe un contacto con ese correo electrónico')}`);
        }

        res.redirect(`/?error=${encodeURIComponent('Error al crear el contacto')}`);
    }
};

const getEditForm = async (req, res) => {
    try {
        const contacto = await database.getContactoById(req.params.id);

        if (!contacto) {
            return res.redirect(`/?error=${encodeURIComponent('Contacto no encontrado')}`);
        }

        const csrfToken = req.csrfToken();
        res.render('edit', {
            title: 'Editar Contacto',
            contacto,
            csrfToken,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error obteniendo contacto para editar:', error);
        res.redirect(`/?error=${encodeURIComponent('Error al cargar el contacto')}`);
    }
};

const updateContact = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg).join(', ');
            return res.redirect(`/contactos/${req.params.id}/editar?error=${encodeURIComponent(errorMessages)}`);
        }

        const updated = await database.updateContacto(req.params.id, {
            nombre: req.body.nombre,
            correo: req.body.correo,
            telefono: req.body.telefono,
            empresa: req.body.empresa,
            estado: req.body.estado
        });

        if (updated) {
            res.redirect(`/contactos?message=${encodeURIComponent('Contacto actualizado exitosamente')}`);
        } else {
            res.redirect(`/contactos?error=${encodeURIComponent('No se pudo actualizar el contacto')}`);
        }
    } catch (error) {
        console.error('Error actualizando contacto:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.redirect(`/contactos/${req.params.id}/editar?error=${encodeURIComponent('Ya existe un contacto con ese correo electrónico')}`);
        }

        res.redirect(`/contactos/${req.params.id}/editar?error=${encodeURIComponent('Error al actualizar el contacto')}`);
    }
};

const deleteContact = async (req, res) => {
    try {
        const deleted = await database.deleteContacto(req.params.id);

        if (deleted) {
            res.redirect(`/?message=${encodeURIComponent('Contacto eliminado exitosamente')}`);
        } else {
            res.redirect(`/?error=${encodeURIComponent('No se pudo eliminar el contacto')}`);
        }
    } catch (error) {
        console.error('Error eliminando contacto:', error);
        res.redirect(`/?error=${encodeURIComponent('Error al eliminar el contacto')}`);
    }
};

const searchContacts = async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        if (!searchTerm.trim()) {
            return res.redirect('/contactos');
        }
        return res.redirect(`/contactos?q=${encodeURIComponent(searchTerm)}`);
    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.redirect('/contactos?error=Error%20al%20realizar%20la%20búsqueda');
    }
};

module.exports = {
    contactValidationRules,
    getAllContacts,
    createContact,
    getEditForm,
    updateContact,
    deleteContact,
    searchContacts
};
