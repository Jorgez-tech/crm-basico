const express = require('express');
const request = require('supertest');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');

async function run() {
    const app = express();
    app.use(cookieParser());
    app.use(session({
        secret: 'test_secret',
        resave: false,
        saveUninitialized: true,
        cookie: { httpOnly: true }
    }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(csrf());

    app.get('/form', (req, res) => {
        res.json({ _csrf: req.csrfToken() });
    });

    app.post('/submit', (req, res) => {
        res.json({ success: true });
    });

    const agent = request.agent(app);

    console.log('1) GET /form -> obtener token y cookie de sesión');
    const getRes = await agent.get('/form');
    const token = getRes.body._csrf;
    console.log('   token:', token ? token.substring(0, 8) + '...' : 'NO_TOKEN');

    console.log('2) POST /submit con token correcto (debe 200)');
    const postOk = await agent
        .post('/submit')
        .set('Accept', 'application/json')
        .send({ _csrf: token });
    console.log('   status:', postOk.status);

    console.log('3) POST /submit sin token (debe 403)');
    const postNoToken = await request(app)
        .post('/submit')
        .set('Accept', 'application/json')
        .send({});
    console.log('   status:', postNoToken.status);

    console.log('4) POST /submit con token alterado (debe 403)');
    const badToken = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a');
    const postBad = await agent
        .post('/submit')
        .set('Accept', 'application/json')
        .send({ _csrf: badToken });
    console.log('   status:', postBad.status);

    console.log('5) Simular sesión expirada: usar token antiguo con nueva sesión (debe 403)');
    // get a fresh token with a new agent (new session)
    const agent2 = request.agent(app);
    const get2 = await agent2.get('/form');
    const token2 = get2.body._csrf;
    // try to submit with token from first session but without its cookie
    const postExpired = await agent2
        .post('/submit')
        .set('Accept', 'application/json')
        .send({ _csrf: token });
    console.log('   status:', postExpired.status);

    // Summary
    console.log('\nResumen:');
    console.log(`GET token: ${getRes.status === 200 ? 'OK' : 'FAIL'}`);
    console.log(`POST con token correcto: ${postOk.status === 200 ? 'OK' : 'FAIL'}`);
    console.log(`POST sin token: ${postNoToken.status === 403 ? 'OK' : 'FAIL'} (status ${postNoToken.status})`);
    console.log(`POST con token alterado: ${postBad.status === 403 ? 'OK' : 'FAIL'} (status ${postBad.status})`);
    console.log(`POST con token viejo en nueva sesión: ${postExpired.status === 403 ? 'OK' : 'FAIL'} (status ${postExpired.status})`);
}

run().catch(err => {
    console.error('Error ejecutando pruebas CSRF:', err);
    process.exit(1);
});
