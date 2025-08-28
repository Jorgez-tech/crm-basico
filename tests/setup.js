// Setup para Jest
// Configuración global para tests

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test_secret_key_for_jest';
process.env.DB_NAME = process.env.DB_NAME || 'crm_basico_test';

// Suprimir logs durante tests a menos que se especifique
if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
}
