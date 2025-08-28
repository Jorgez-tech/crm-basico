const request = require('supertest');
const app = require('../app/main');
const database = require('../app/database');

describe('CRM Básico - Integration Tests', () => {
    let server;
    let agent;

    beforeAll(async () => {
        // Configurar base de datos de prueba
        await database.connect();
        agent = request.agent(app);
    });

    afterAll(async () => {
        // Limpiar y cerrar conexiones
        await database.close();
        if (server) {
            server.close();
        }
    });

    describe('Rutas principales', () => {
        test('GET / - Dashboard debe responder con 200', async () => {
            const response = await agent.get('/');
            expect(response.status).toBe(200);
            expect(response.text).toContain('CRM Básico');
        });

        test('GET /contactos - Lista de contactos debe responder con 200', async () => {
            const response = await agent.get('/contactos');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Lista de Contactos');
        });

        test('GET /api/stats - API stats debe responder con JSON válido', async () => {
            const response = await agent.get('/api/stats');
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('total');
        });
    });

    describe('Flujo CSRF', () => {
        test('Formulario de creación debe incluir token CSRF', async () => {
            const response = await agent.get('/');
            expect(response.status).toBe(200);
            expect(response.text).toMatch(/name="_csrf"/);
        });

        test('POST sin token CSRF debe fallar', async () => {
            const response = await agent
                .post('/contactos')
                .send({
                    nombre: 'Test Usuario',
                    correo: 'test@example.com'
                })
                .expect(403);
        });
    });

    describe('API Endpoints', () => {
        test('GET /api/contactos debe retornar estructura correcta', async () => {
            const response = await agent.get('/api/contactos');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('contactos');
            expect(response.body.data).toHaveProperty('stats');
        });
    });

    describe('Validaciones', () => {
        let csrfToken;

        beforeEach(async () => {
            // Obtener token CSRF válido
            const response = await agent.get('/');
            const match = response.text.match(/name="_csrf" value="([^"]+)"/);
            csrfToken = match ? match[1] : null;
        });

        test('Crear contacto con datos válidos debe funcionar', async () => {
            if (!csrfToken) {
                throw new Error('No se pudo obtener token CSRF');
            }

            const response = await agent
                .post('/contactos')
                .send({
                    _csrf: csrfToken,
                    nombre: 'Usuario Prueba Integration',
                    correo: `test-${Date.now()}@example.com`,
                    telefono: '+1234567890',
                    empresa: 'Test Corp',
                    estado: 'prospecto'
                });

            expect(response.status).toBe(302); // Redirect después de crear
            expect(response.headers.location).toMatch(/\?message=/);
        });

        test('Crear contacto con email inválido debe fallar', async () => {
            if (!csrfToken) {
                throw new Error('No se pudo obtener token CSRF');
            }

            const response = await agent
                .post('/contactos')
                .send({
                    _csrf: csrfToken,
                    nombre: 'Usuario Prueba',
                    correo: 'email-invalido',
                    telefono: '+1234567890'
                });

            expect(response.status).toBe(302); // Redirect con error
            expect(response.headers.location).toMatch(/\?error=/);
        });
    });

    describe('Búsqueda', () => {
        test('Búsqueda con término válido debe retornar resultados', async () => {
            const response = await agent.get('/contactos?q=test');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Resultados de búsqueda');
        });

        test('Búsqueda vacía debe redirigir a lista completa', async () => {
            const response = await agent.get('/buscar?q=');
            expect(response.status).toBe(302);
            expect(response.headers.location).toBe('/contactos');
        });
    });
});
