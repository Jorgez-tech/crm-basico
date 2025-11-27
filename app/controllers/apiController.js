const database = require('../database');

const getContacts = async (req, res) => {
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
        console.error('Error en API contactos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await database.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error en API stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getContacts,
    getStats
};
