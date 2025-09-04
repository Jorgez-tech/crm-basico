# Guía de Desarrollo Estándar — CRM Básico

Resumen objetivo
---------------

- Proyecto: `crm-basico` (Node.js + Express + EJS + MySQL2).
- Stack clave: Node >=16, Express, EJS, express-session, csurf, helmet, express-validator.
- Estado general: funcionalidad CRUD completa y mayoritaria validada; pendientes finales de seguridad de sesión/CSRF y documentación.

Gap Analysis y Checklist Priorizado
----------------------------------

Sprint 1 — Funcionalidades base
- Backend/Servidor: [x] Hecho
  - [x] CRUD contactos (list, create, edit, delete).
  - [x] Middleware: Helmet, sessions, csurf (configurado globalmente).
  - [x] Validaciones básicas con express-validator en rutas críticas.
  - Notas: Se corrigió orden de middlewares (session antes de csurf); eliminado csurf duplicado por ruta; añadido logging útil (sessionID, estado de token).
- Frontend (EJS): [x] Hecho
  - [x] Vistas: index, edit, forms con token CSRF.
  - [x] Evitado anidado de formularios (delete fuera de edit).
- Landing / integración: [x] Hecho
  - [x] Recursos estáticos en `public/` y formularios funcionales.

Sprint 2 — Testing y automatización
- Pruebas: [x] Completado
  - [x] Tests unitarios/backend: implementados con Jest y supertest (`tests/integration.test.js`).
  - [x] Tests manuales de flujo CRUD realizados (create/list/edit/delete).
  - [x] Tests CSRF automatizados (`tests/csrf-check.js`) y E2E (`tests/e2e-edit.js`).

Sprint 6 — Despliegue en Railway
--------------------------------
- Infraestructura: [x] Completado
  - [x] Railway: Configuración y deploy básico
  - [x] Plugin MySQL: Base de datos gestionada
  - [x] Variables de entorno: Configuración segura en Railway Environment
  - [x] Health checks: Verificación de conectividad cloud
- CI/CD Foundation: [x] Completado
  - [x] GitHub Actions: Workflow CI integrado
  - [x] Environment separation: desarrollo/producción
  - [x] Automated testing: Pre-deploy validation
- Documentación: [x] Completado
  - [x] README: Sección "Despliegue en Railway" integrada

Ajustes recomendados a la guía (Railway)
----------------------------------------
- Añadir un short README de `app/` con:
  - Cómo iniciar (dev/prod), variables obligatorias en `.env.production.example`, y cómo ejecutar una DB local o en Railway.
- Tests mínimos a incluir (prioridad alta):
  - Backend: integraciones para GET /contactos, POST /contactos, PUT /contactos/:id, DELETE /contactos/:id (usar supertest + DB de prueba).
  - Unit: utilidades en `app/utils.js`.
- CI mínima:
  - Workflow: npm ci → lint → test → build.
  - Hooks: commitlint + husky (opcional pero recomendable).
- Sesión/CSRF:
  - Test manual script y checklist (ver más abajo).

Checklist por sprint (resumen)
-----------------------------
- Sprint 1: funcionalidad CRUD y correcciones de CSRF — ✅ Done.
- Sprint 2: tests backend + CI — ✅ Done.
- Sprint 3: docs y limpieza (CONTRIBUTING, README app) — ✅ Done.
- Sprint 4: pruebas de sesión/CSRF y cookie hardening — ✅ Done.
- Sprint 5: deploy pipeline y observabilidad — ✅ Done.
- Sprint 6: Despliegue Railway — ✅ Done.
- Sprint 7: CI/CD Automation — 📋 Planificado.
--------------------------------------------------------
1) Automatización completa de deploy
- GitHub Actions workflow completo
- Secrets de Azure configurados (service principal)
- Automated testing pre-deploy
- Blue-green deployment con slots

2) Monitoring y observabilidad avanzada
- Application Insights integration
- Custom metrics y alertas
- Performance monitoring
- Log analytics workspace

Notas, decisiones y riesgos
---------------------------

- FS Windows: cuidar nombres con distinto casing (por ejemplo `Header.jsx` vs `header.js`).
- Sesión/CSRF: ya aplicaste corrección importante (session antes de csurf; eliminado csurf duplicado). Priorizar pruebas manuales en diferentes navegadores/clients.
- Autenticación: actualmente no hay login; si el proyecto se publica, agregar autenticación básica o limitar acceso al servidor.
- Tests DB: con MySQL, las pruebas de integración requieren un DB de test o mocks; planifica cómo aislar tests (contenedor, test DB, o migraciones rápidas).
- Backup & deploy: documentar variables y pasos de restore antes de poner en producción.

Checklist por sprint (resumen)
-----------------------------

- Sprint 1: funcionalidad CRUD y correcciones de CSRF — ✅ Done.
- Sprint 2: tests backend + CI — ✅ Done.
- Sprint 3: docs y limpieza (CONTRIBUTING, README app) — ✅ Done.
- Sprint 4: pruebas de sesión/CSRF y cookie hardening — ✅ Done.
- Sprint 5: deploy pipeline y observabilidad — ✅ Done.
- Sprint 6: Cloud Migration y Azure — 🔄 En desarrollo.
- Sprint 7: CI/CD Automation — 📋 Planificado.

Plantilla rápida de “Pruebas CSRF / Sesión” (para copiar)
-----------------------------------------------

- Paso 1: Abrir /contactos/:id/editar — confirmar que el campo hidden `_csrf` existe.
- Paso 2: Copiar y alterar el valor de `_csrf`, enviar — esperar 403.
- Paso 3: Eliminar el campo `_csrf` del HTML y enviar — 403.
- Paso 4: Borrar cookies de sesión, intentar editar con token anterior — 403.
- Resultado esperado: sólo envíos con token válido y cookie de sesión activa aceptados.

Nota: Las pruebas CSRF automatizadas y manuales se han ejecutado y documentado más abajo; `supertest` se instaló localmente para el script de pruebas (`tests/csrf-check.js`).

Últimos datos y meta
-------------------

- Responsable: Jorge Zuta
- Repositorio: crm-basico (branch: main)
- Última actualización: 2025-08-27
- Siguiente acción recomendada: implementar tests de integración backend y configurar cookie hardening para producción; crear PR para merge a main.

Cambios recientes
-----------------

 - 2025-08-17: Añadidos `CONTRIBUTING.md` y `app/README.md`.
 - 2025-08-17: Scripts `lint`, `lint:fix` y `format` añadidos en `package.json`; ESLint/Prettier configurados y devDependencies instaladas localmente.
 - 2025-08-17: Workflow CI básico creado en `.github/workflows/ci.yml`.
 - 2025-08-17: Añadido `.env.production.example`.
 - 2025-08-17: Branch `feature/guia-desarrollo` creado y cambios push al remoto.
 - 2025-08-17: Corregidos logs duplicados y inconsistentes en CSRF; eliminado script duplicado en `views/edit.ejs`.
 - 2025-08-17: Añadido script E2E `tests/e2e-edit.js` para validación automática del flujo de edición.
 - 2025-08-17: Documentación actualizada con instrucciones de ejecución y comandos para tests locales.
 - 2025-08-27: Health check endpoint implementado en `/health` con verificación completa de sistema.
 - 2025-08-27: Structured logging implementado con Winston - logs HTTP, DB, seguridad y métricas.
 - 2025-08-27: Integración completa de logger en main.js, database.js y routes.js.
 - 2025-08-27: Configuración de logging para desarrollo (consola) y producción (archivos).

Pendientes actuales (prioridad alta)
----------------------------------

1. [x] Ejecutar e instalar herramientas de lint/format (ESLint + Prettier) para que el workflow CI pase.
2. [x] Completar pruebas manuales CSRF/sesión y verificar en navegadores (ya documentadas y validadas con script local).
3. [x] Implementar tests de integración backend (supertest) con entorno de pruebas MySQL.
4. [x] Habilitar cookie hardening para producción (cookie.secure, SameSite).
5. [x] Implementar health check endpoint con verificación de DB.
6. [x] Implementar structured logging con Winston para desarrollo y producción.
7. [ ] Preparar `.env.production` y checklist de deploy cuando vayan a publicar.
8. [ ] Crear Pull Request de `feature/guia-desarrollo` hacia `main` para revisión.

Instrucciones rápidas para correr y probar localmente
----------------------------------------------------

- Inicia dependencias e instala paquetes:

```cmd
npm install
```

- Iniciar el servidor en modo desarrollo (con nodemon):

```cmd
npm run dev
```

- Iniciar el servidor en modo producción (simple):

```cmd
npm start
```

- Ejecutar el chequeo CSRF automatizado (script incluido):

```cmd
node tests/csrf-check.js
```

- Ejecutar el E2E rápido que valida edición de `contactos/11` (extrae CSRF y envía POST):

```cmd
node tests/e2e-edit.js
```

Notas:
- Si las pruebas fallan con 403, recarga la página de edición en el navegador para regenerar token y/o revisa las cookies de sesión.
- Asegúrate de que las variables de entorno de DB estén correctamente configuradas antes de arrancar (ver `app/.env.example` o `.env.production.example`).

Última actualización: 2025-08-17

Resultados de las pruebas CSRF automatizadas (local)
---------------------------------------------------

Se creó y ejecutó un script de prueba `tests/csrf-check.js` que monta un pequeño servidor Express con `express-session` y `csurf` y ejecuta los siguientes escenarios:

- GET /form → obtiene token CSRF y cookie de sesión. Resultado: OK
- POST /submit con token correcto → 200 OK (OK)
- POST /submit sin token → 403 Forbidden (OK)
- POST /submit con token alterado → 403 Forbidden (OK)
- POST con token viejo en nueva sesión → 403 Forbidden (OK)

Notas:
- Para ejecutar localmente: `node tests/csrf-check.js` (requiere `supertest` instalado como devDependency). El script se agregó en `tests/`.
- Se instaló `supertest` localmente para ejecutar estas pruebas.

Notas:
- Para ejecutar localmente: `node tests/csrf-check.js` (requiere `supertest` instalado como devDependency). El script se agregó en `tests/`.
- `supertest` fue instalado localmente y el script se ejecutó con éxito; los escenarios previstos devolvieron los códigos esperados (200 para token válido, 403 para casos inválidos).





