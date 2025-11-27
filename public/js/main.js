/**
 * CRM Básico - JavaScript Frontend
 * Funcionalidades interactivas del lado cliente
 * 
 * TODO: Implementar validación en tiempo real
 * TODO: Agregar confirmaciones con SweetAlert
 * TODO: Implementar búsqueda en vivo
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('CRM Básico cargado correctamente');

    // Inicializar funcionalidades
    initializeFormValidation();
    initializeDeleteConfirmations();
    initializeSearch();
    initializeAnimations();
    initializeTooltips();
});

/**
 * Inicializa validación de formularios
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });

            input.addEventListener('input', function () {
                clearFieldError(this);
            });
        });
    });
}

/**
 * Valida un formulario completo
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Valida un campo individual
 */
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    let isValid = true;
    let errorMessage = '';

    // Validar campos requeridos
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    }

    // Validaciones específicas por tipo
    if (value && type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ingresa un correo electrónico válido';
        }
    }

    if (value && name === 'telefono') {
        const phoneRegex = /^[+]?[1-9][0-9]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-()]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            isValid = false;
            errorMessage = 'Ingresa un teléfono válido';
        }
    }

    if (value && name === 'nombre' && value.length < 2) {
        isValid = false;
        errorMessage = 'El nombre debe tener al menos 2 caracteres';
    }

    // Mostrar/ocultar error
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

/**
 * Muestra error en un campo
 */
function showFieldError(field, message) {
    clearFieldError(field);

    field.classList.add('is-invalid');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-small text-danger mt-sm';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

/**
 * Limpia error de un campo
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid');

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Inicializa confirmaciones de eliminación
 */
function initializeDeleteConfirmations() {
    const deleteButtons = document.querySelectorAll('form[action*="/eliminar"] button[type="submit"]');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const contactName = this.closest('.contact-item')?.querySelector('h4')?.textContent || 'este contacto';

            if (confirm(`¿Estás seguro de que quieres eliminar a ${contactName}?`)) {
                this.closest('form').submit();
            }
        });
    });
}

/**
 * Inicializa funcionalidad de búsqueda
 */
function initializeSearch() {
    const searchInput = document.querySelector('#search-input');

    if (searchInput) {
        // Búsqueda en vivo (opcional)
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // TODO: Implementar búsqueda AJAX en vivo
                // filterContactsLive(this.value);
            }, 300);
        });

        // Limpiar búsqueda
        const clearButton = document.querySelector('#clear-search');
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                searchInput.value = '';
                window.location.href = '/';
            });
        }
    }
}

/**
 * Inicializa animaciones
 */
function initializeAnimations() {
    // Animar elementos al cargar
    const animatedElements = document.querySelectorAll('.contact-item, .card, .stat-card');

    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });

    // Animación al hacer hover en tarjetas
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/**
 * Inicializa tooltips
 */
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            showTooltip(this, this.dataset.tooltip);
        });

        element.addEventListener('mouseleave', function () {
            hideTooltip();
        });
    });
}

/**
 * Muestra un tooltip
 */
function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    tooltip.style.backgroundColor = '#1f2937';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s ease';

    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);
}

/**
 * Oculta el tooltip
 */
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

/**
 * Formatea números de teléfono mientras se escribe
 */
function formatPhoneInput(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
    }

    input.value = value;
}

/**
 * Maneja el cambio de estado de contacto
 */
function handleStatusChange(select) {
    const statusBadge = select.closest('.contact-item')?.querySelector('.status-badge');

    if (statusBadge) {
        // Remover clases anteriores
        statusBadge.classList.remove('prospecto', 'cliente', 'inactivo');
        // Agregar nueva clase
        statusBadge.classList.add(select.value);

        // Actualizar texto
        const statusText = {
            'prospecto': 'Prospecto',
            'cliente': 'Cliente',
            'inactivo': 'Inactivo'
        };
        statusBadge.textContent = statusText[select.value] || select.value;
    }
}

/**
 * Copia texto al portapapeles
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copiado al portapapeles', 'success');
        });
    } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copiado al portapapeles', 'success');
    }
}

/**
 * Muestra una notificación
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '6px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '9999';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';

    // Colores según tipo
    const colors = {
        'success': '#059669',
        'error': '#dc2626',
        'warning': '#d97706',
        'info': '#2563eb'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Actualiza estadísticas en tiempo real
 */
function updateStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.data;

                // Actualizar números en la UI
                const totalElement = document.querySelector('.stat-total .stat-number');
                const prospectosElement = document.querySelector('.stat-prospectos .stat-number');
                const clientesElement = document.querySelector('.stat-clientes .stat-number');
                const inactivosElement = document.querySelector('.stat-inactivos .stat-number');

                if (totalElement) totalElement.textContent = stats.total;
                if (prospectosElement) prospectosElement.textContent = stats.prospectos;
                if (clientesElement) clientesElement.textContent = stats.clientes;
                if (inactivosElement) inactivosElement.textContent = stats.inactivos;
            }
        })
        .catch(error => {
            console.error('Error actualizando estadísticas:', error);
        });
}

/**
 * Funciones globales para usar en HTML
 */
window.CRM = {
    formatPhoneInput,
    handleStatusChange,
    copyToClipboard,
    showNotification,
    updateStats
};
