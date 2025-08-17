const request = require('supertest');

(async () => {
    try {
        const base = 'http://localhost:3000';
        const agent = request.agent(base);

        console.log('1) GET /contactos/11/editar');
        const getRes = await agent.get('/contactos/11/editar');
        console.log('GET status:', getRes.status);

        const html = getRes.text || '';
        const match = html.match(/name="_csrf" value="([^"]+)"/);
        if (!match) {
            console.error('No se encontró el campo _csrf en el HTML. Resultado parcial:');
            console.error(html.slice(0, 800));
            process.exit(2);
        }

        const csrf = match[1];
        console.log('CSRF token extraído:', csrf.slice(0, 8) + '...');

        // Prepara datos para actualizar (mantener correo/otros campos tal como están)
        const updated = {
            _csrf: csrf,
            nombre: 'Jorge Zuta Herrera (e2e test)',
            correo: 'jzuta309@gmail.com',
            telefono: '+56992251118',
            empresa: 'suzuta',
            estado: 'cliente'
        };

        console.log('2) POST /contactos/11 (envío formulario con token)');
        const postRes = await agent
            .post('/contactos/11')
            .type('form')
            .send(updated)
            .redirects(0)
            .catch(err => err.response || err);

        if (postRes.status === 302 || postRes.status === 303) {
            console.log('POST result: redirect', postRes.status, 'Location:', postRes.headers.location);
            console.log('E2E edit test: OK');
            process.exit(0);
        }

        console.log('POST status:', postRes.status);
        console.log('Response body snippet:', (postRes.text || '').slice(0, 800));
        process.exit(postRes.status === 200 ? 0 : 3);
    } catch (e) {
        console.error('Error en E2E script:', e && e.message ? e.message : e);
        process.exit(1);
    }
})();
