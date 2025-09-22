# Guía de Desarrollo Estándar — CRM Básico

## Resumen objetivo

- Proyecto: `crm-basico` (Node.js + Express + EJS + MySQL2).
- Stack clave: Node >=16, Express, EJS, express-session, csurf, helmet, express-validator.
- Estado general: funcionalidad CRUD completa y mayoritaria validada; pendientes finales de seguridad de sesión/CSRF y documentación.

## Gap Analysis y Checklist Priorizado

### Sprint 1 — Funcionalidades base

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

### Sprint 2 — Testing y automatización

- Pruebas: [x] Completado

  - [x] Tests unitarios/backend: implementados con Jest y supertest (`tests/integration.test.js`).
  - [x] Tests manuales de flujo CRUD realizados (create/list/edit/delete).
  - [x] Tests CSRF automatizados (`tests/csrf-check.js`) y E2E (`tests/e2e-edit.js`).

### Sprint 6 — Despliegue en Railway

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

## Ajustes recomendados a la guía (Railway)

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

## Checklist por sprint (resumen)

- Sprint 1: funcionalidad CRUD y correcciones de CSRF — ✅ Done.
- Sprint 2: tests backend + CI — ✅ Done.
- Sprint 3: docs y limpieza (CONTRIBUTING, README app) — ✅ Done.
- Sprint 4: pruebas de sesión/CSRF y cookie hardening — ✅ Done.
- Sprint 5: deploy pipeline y observabilidad — ✅ Done.
- Sprint 6: Despliegue Railway — ✅ Done.
- Sprint 7: CI/CD Automation — 📋 Planificado.

---

1. Automatización completa de deploy

   - GitHub Actions workflow completo
   - Automated testing pre-deploy

2. Monitoring y observabilidad avanzada

   - Custom metrics y alertas
   - Performance monitoring

## Notas, decisiones y riesgos

- FS Windows: cuidar nombres con distinto casing (por ejemplo `Header.jsx` vs `header.js`).
- Sesión/CSRF: ya aplicaste corrección importante (session antes de csurf; eliminado csurf duplicado). Priorizar pruebas manuales en diferentes navegadores/clients.
- Autenticación: actualmente no hay login; si el proyecto se publica, agregar autenticación básica o limitar acceso al servidor.
- Tests DB: con MySQL, las pruebas de integración requieren un DB de test o mocks; planifica cómo aislar tests (contenedor, test DB, o migraciones rápidas).
- Backup & deploy: documentar variables y pasos de restore antes de poner en producción.

---

## Instrucciones rápidas para correr y probar localmente

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

---





