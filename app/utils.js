/**
 * CRM Básico - Utilidades
 * Funciones auxiliares y helpers
 * 
 * TODO: Agregar funciones de encriptación
 * TODO: Implementar validadores personalizados
 * TODO: Agregar helpers de formato de fecha
 */

const axios = require('axios');

/**
 * Formatea una fecha en formato legible
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(fecha) {
    if (!fecha) return 'N/A';

    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

/**
 * Valida si un email tiene formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida si un teléfono tiene formato correcto
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido
 */
function isValidPhone(telefono) {
    if (!telefono) return true; // Es opcional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(telefono.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Sanitiza una cadena de texto
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto limpio
 */
function sanitizeString(texto) {
    if (!texto) return '';
    return texto.trim().replace(/[<>]/g, '');
}

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalize(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Obtiene el color CSS basado en el estado del contacto
 * @param {string} estado - Estado del contacto
 * @returns {string} Clase CSS o color
 */
function getStatusColor(estado) {
    const colores = {
        'prospecto': 'warning',
        'cliente': 'success',
        'inactivo': 'secondary'
    };
    return colores[estado] || 'primary';
}

/**
 * Obtiene el icono basado en el estado del contacto
 * @param {string} estado - Estado del contacto
 * @returns {string} Clase de icono
 */
function getStatusIcon(estado) {
    const iconos = {
        'prospecto': '🔍',
        'cliente': '✅',
        'inactivo': '😴'
    };
    return iconos[estado] || '👤';
}

/**
 * Convierte un objeto a query string para URLs
 * @param {Object} obj - Objeto con parámetros
 * @returns {string} Query string
 */
function objectToQueryString(obj) {
    return Object.keys(obj)
        .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}

/**
 * Obtiene publicaciones de una API externa (demo)
 * @returns {Promise<Array>} Array de publicaciones
 */
async function fetchExternalPosts() {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
            timeout: 5000 // 5 segundos timeout
        });

        return response.data || [];
    } catch (error) {
        console.warn('⚠️ No se pudieron obtener posts externos:', error.message);
        return [];
    }
}

/**
 * Valida los datos de un contacto
 * @param {Object} contactoData - Datos del contacto
 * @returns {Object} Resultado de validación
 */
function validateContactoData(contactoData) {
    const errores = [];

    // Validar nombre
    if (!contactoData.nombre || contactoData.nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }

    // Validar email
    if (!contactoData.correo || !isValidEmail(contactoData.correo)) {
        errores.push('El correo electrónico no es válido');
    }

    // Validar teléfono (opcional)
    if (contactoData.telefono && !isValidPhone(contactoData.telefono)) {
        errores.push('El formato del teléfono no es válido');
    }

    // Validar estado
    const estadosValidos = ['prospecto', 'cliente', 'inactivo'];
    if (contactoData.estado && !estadosValidos.includes(contactoData.estado)) {
        errores.push('El estado no es válido');
    }

    return {
        valido: errores.length === 0,
        errores
    };
}

/**
 * Formatea un número de teléfono
 * @param {string} telefono - Número a formatear
 * @returns {string} Teléfono formateado
 */
function formatPhone(telefono) {
    if (!telefono) return '';

    // Remover caracteres no numéricos
    const numbers = telefono.replace(/\D/g, '');

    // Formato básico para números de 10 dígitos
    if (numbers.length === 10) {
        return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    return telefono; // Devolver original si no se puede formatear
}

/**
 * Calcula estadísticas de estado
 * @param {Array} contactos - Array de contactos
 * @returns {Object} Estadísticas calculadas
 */
function calculateStats(contactos) {
    const stats = {
        total: contactos.length,
        prospectos: 0,
        clientes: 0,
        inactivos: 0
    };

    contactos.forEach(contacto => {
        switch (contacto.estado) {
            case 'prospecto':
                stats.prospectos++;
                break;
            case 'cliente':
                stats.clientes++;
                break;
            case 'inactivo':
                stats.inactivos++;
                break;
        }
    });

    return stats;
}

/**
 * Genera un resumen de texto
 * @param {string} texto - Texto a resumir
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto resumido
 */
function truncateText(texto, maxLength = 100) {
    if (!texto) return '';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength).trim() + '...';
}

// Exportar todas las funciones
module.exports = {
    formatDate,
    isValidEmail,
    isValidPhone,
    sanitizeString,
    generateId,
    capitalize,
    getStatusColor,
    getStatusIcon,
    objectToQueryString,
    fetchExternalPosts,
    validateContactoData,
    formatPhone,
    calculateStats,
    truncateText
};
