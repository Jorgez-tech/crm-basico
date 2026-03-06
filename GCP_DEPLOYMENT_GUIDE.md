# Guía de Despliegue en GCP (Cloud Run + Cloud SQL)

¡Bienvenido al modo de despliegue en Google Cloud Platform! Esta guía está diseñada para que tú mismo configures y despliegues tu sistema CRM en GCP, aprendiendo en el proceso.

## Arquitectura

*   **Backend:** Google Cloud Run (Contenedores Serverless, escala a cero, HTTPS automático).
*   **Base de Datos:** Google Cloud SQL (MySQL Gestionado).
*   **Herramienta:** Google Cloud CLI (`gcloud`).

---

## Paso 1: Preparación del Entorno GCP

1.  **Crea una cuenta/proyecto:** Si no lo has hecho, ve a [Google Cloud Console](https://console.cloud.google.com/) y crea un nuevo proyecto (ej. `crm-basico-gcp`).
2.  **Activa Facturación:** Asegúrate de tener la facturación habilitada (aprovecha tus $300 USD de crédito gratuito).
3.  **Habilita APIs:** En tu proyecto, habilita las siguientes APIs:
    *   Cloud Run API
    *   Cloud SQL Admin API
    *   Artifact Registry API (o Container Registry si aún lo usas, pero Artifact es el moderno).
    *   Cloud Build API
4.  **Instala gcloud CLI:** Si estás en tu PC local, [instala el SDK de Google Cloud](https://cloud.google.com/sdk/docs/install) y autentícate:
    ```bash
    gcloud auth login
    gcloud config set project TU_ID_DE_PROYECTO
    ```

---

## Paso 2: Crear la Base de Datos (Cloud SQL)

1.  En la consola de GCP, ve a **SQL** y crea una instancia de **MySQL**.
    *   Elige MySQL 8.0 (recomendado).
    *   Nombra tu instancia (ej. `crm-db-instance`).
    *   Genera una contraseña fuerte para el usuario `root` y guárdala.
    *   Para no gastar mucho, en "Cloud SQL edition" elige **Enterprise**, en "Machine type" elige **Shared core (db-f1-micro)**, y en "Storage" reduce a 10GB HDD.
2.  Una vez creada la instancia, ve a la pestaña **Databases** y crea una base de datos llamada `crm_basico`.
3.  Ve a la pestaña **Users** y crea un usuario específico para la app (ej. `crm_user`) con su contraseña, en lugar de usar `root`.
4.  **Anota el "Connection name" de tu instancia:** Tiene el formato `proyecto:region:instancia` (ej. `mi-proyecto:us-central1:crm-db-instance`). Lo necesitarás para conectar Cloud Run.
5.  **Poblar la base de datos (Opcional por ahora, pero necesario):** Puedes usar Cloud Shell, conectarte a tu instancia mediante el proxy, y ejecutar tu script `database_setup.sql`.

---

## Paso 3: Ajustes de Código para GCP (¡Haz esto en tu editor!)

Cloud Run maneja automáticamente el HTTPS y actúa como un proxy reverso. Para que tus sesiones y CSRF funcionen (el problema que tuviste en Railway), debes decirle a Express que confíe en este proxy y configurar las cookies para HTTPS.

**1. En `app/main.js` (o donde configures Express), busca la inicialización de la app y añade el `trust proxy`:**

```javascript
const app = express();

// IMPORTANTE PARA CLOUD RUN: Confiar en el proxy de GCP
// Esto asegura que req.ip y req.secure reflejen la conexión real del cliente (HTTPS).
app.set('trust proxy', 1); // Confía en el primer proxy
```

**2. Ajusta la configuración de `cookie-session` (o `express-session`):**

Dado que estarás en HTTPS en Cloud Run, debes asegurarte de que tus cookies sean seguras.

```javascript
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'fallback-secret-para-desarrollo'],
  cookie: {
    // secure: true REQUIERE HTTPS. En Cloud Run esto siempre será true.
    // Si quieres que funcione en local (HTTP) y producción (HTTPS):
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    // sameSite: 'lax' suele ser suficiente para protección básica CSRF
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Si tu front y back estuvieran separados usarías 'none', para este monolito 'lax' o 'strict' es mejor. ¡Usa 'lax' o true!
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
```

*Nota: Asegúrate de que tu CSRF middleware (`csurf`) siga funcionando bien con esta configuración.*

---

## Paso 4: Construir y Subir la Imagen Docker (Artifact Registry)

Antes de desplegar en Cloud Run, necesitas crear un repositorio para tu imagen Docker en GCP.

1.  Crea un repositorio en Artifact Registry:
    ```bash
    gcloud artifacts repositories create crm-repo \
        --repository-format=docker \
        --location=us-central1 \
        --description="Repositorio Docker para CRM"
    ```

2.  Configura Docker localmente para autenticarse con Artifact Registry:
    ```bash
    gcloud auth configure-docker us-central1-docker.pkg.dev
    ```

3.  Construye la imagen Docker localmente (asegúrate de estar en el directorio de tu proyecto):
    ```bash
    docker build -t us-central1-docker.pkg.dev/TU_ID_DE_PROYECTO/crm-repo/crm-app:v1 .
    ```

4.  Sube la imagen a Artifact Registry:
    ```bash
    docker push us-central1-docker.pkg.dev/TU_ID_DE_PROYECTO/crm-repo/crm-app:v1
    ```

---

## Paso 5: Desplegar en Cloud Run (y conectar a Cloud SQL)

Ahora desplegaremos el contenedor y lo conectaremos de forma segura a la base de datos MySQL.

1.  Ejecuta el siguiente comando para desplegar, reemplazando las variables con tus valores:

    ```bash
    gcloud run deploy crm-service \
      --image us-central1-docker.pkg.dev/TU_ID_DE_PROYECTO/crm-repo/crm-app:v1 \
      --region us-central1 \
      --allow-unauthenticated \
      --add-cloudsql-instances "TU_ID_DE_PROYECTO:REGION:NOMBRE_INSTANCIA_SQL" \
      --set-env-vars "NODE_ENV=production" \
      --set-env-vars "SESSION_SECRET=tu_secreto_super_seguro" \
      --set-env-vars "DB_HOST=/cloudsql/TU_ID_DE_PROYECTO:REGION:NOMBRE_INSTANCIA_SQL" \
      --set-env-vars "DB_USER=crm_user" \
      --set-env-vars "DB_PASS=tu_password_de_bd" \
      --set-env-vars "DB_NAME=crm_basico"
    ```

    **Explicación de las variables para Cloud SQL:**
    Cloud Run monta un "socket Unix" de forma segura en la ruta `/cloudsql/TU_CONEXION`. Por lo tanto, tu código Node.js (que probablemente usa variables de entorno para la BD) debe conectarse a este socket, no a una IP normal.
    *   Asegúrate de que tu código que crea la conexión MySQL soporte conectarse por socket si se le pasa el path en `DB_HOST` (o añade una variable `DB_SOCKETPath` si es necesario según tu librería `mysql2`).

2.  ¡Listo! El comando te devolverá una URL pública (ej. `https://crm-service-abcxyz-uc.a.run.app`). Visita esa URL para ver tu CRM corriendo en Google Cloud.

## ¿Problemas?
Si tienes errores de conexión a la BD: Revisa los logs de Cloud Run en la consola de GCP. Asegúrate de que la variable `DB_HOST` apunte correctamente al socket Unix, o si tu código lo requiere, configura la conexión MySQL para usar el `socketPath` explícitamente cuando estés en producción.
