# Alex API

Plataforma de APIs gratuitas y premium: cuentas de usuario, API Keys, dashboard con estadísticas en tiempo real, documentación interactiva con "probador" en vivo, y una estructura pensada para crecer a cientos de endpoints sin reescribir nada.

Creado por Luis © 2026

---

## 1. Requisitos

- Node.js 18 o superior
- npm

## 2. Instalación

```bash
npm install
cp .env.example .env
```

Abre `.env` y como mínimo cambia `JWT_SECRET` por un valor propio, largo y aleatorio antes de desplegar a producción.

## 3. Ejecutar en local

```bash
npm start
```

La plataforma quedará disponible en `http://localhost:3000`.

Para desarrollo con recarga automática:

```bash
npm run dev
```

(Opcional) Crea un usuario de prueba con datos ya cargados:

```bash
npm run seed
```

## 4. Estructura del proyecto

```
alex-api/
├── server.js                  # Punto de entrada
├── src/
│   ├── config/
│   │   ├── db.js              # Conexión SQLite + inicialización
│   │   ├── schema.sql         # Esquema de la base de datos
│   │   ├── endpoints.js       # Registro central de endpoints (alimenta la doc)
│   │   ├── plans.js           # Definición de planes Free / Premium
│   │   └── seed.js            # Usuario de prueba opcional
│   ├── controllers/           # Lógica de negocio por recurso
│   ├── middleware/             # Auth (JWT), API Key, rate limit, errores, uploads
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── apikeys.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── docs.routes.js
│   │   ├── public.routes.js
│   │   └── api/                # Endpoints públicos, agrupados por categoría
│   │       ├── index.js        # Agregador — aquí se montan las categorías
│   │       ├── ai.routes.js
│   │       ├── tools.routes.js
│   │       ├── text.routes.js
│   │       ├── images.routes.js
│   │       └── system.routes.js
│   ├── services/               # API Keys, adaptador de IA
│   └── utils/                  # JWT, validaciones, respuestas, logger
├── public/                     # Frontend estático (sin build step)
│   ├── index.html, login.html, register.html, forgot-password.html,
│   │   reset-password.html, dashboard.html, profile.html, docs.html, pricing.html
│   ├── css/style.css, css/dashboard.css
│   └── js/app.js, js/sidebar.js
└── data/                       # Archivo SQLite (se crea solo)
```

## 5. Cómo agregar un endpoint nuevo

1. Crea (o abre) el archivo de la categoría en `src/routes/api/<categoria>.routes.js`.
2. Agrega la ruta con Express normal (`router.get(...)`, `router.post(...)`).
3. Si es una categoría nueva, móntala en `src/routes/api/index.js`.
4. Describe el endpoint en `src/config/endpoints.js` — esto lo agrega automáticamente a `/docs.html`, con ejemplos de `curl` y el probador en vivo. No hace falta tocar el frontend.

Toda la API pública vive bajo `/api/*` y pasa siempre por el middleware `requireApiKey`, que valida la clave, controla el límite mensual del plan y registra la solicitud en el historial.

## 6. Autenticación

Hay dos sistemas de autenticación independientes:

- **Sesión de usuario (dashboard/perfil):** JWT firmado, enviado como `Authorization: Bearer <token>`. Se obtiene en `/auth/login` o `/auth/register`.
- **API pública (`/api/*`):** header `x-api-key`. Se gestiona desde el dashboard (crear, regenerar, eliminar, ver consumo).

Las contraseñas se guardan con `bcrypt` (12 rondas). Nunca se almacenan en texto plano.

## 7. Planes y límites

Definidos en `src/config/plans.js` y configurables por variables de entorno:

- **Free:** `FREE_MONTHLY_LIMIT` solicitudes/mes (por defecto 4,000), 1 API Key.
- **Premium:** `PREMIUM_MONTHLY_LIMIT` solicitudes/mes (por defecto 1,000,000 — "prácticamente ilimitado" mientras protege el servidor), hasta 5 API Keys.

El consumo se calcula por usuario y por mes calendario (`usage_monthly`), y se compara en cada solicitud a `/api/*`.

## 8. Pago Premium (PayPal)

El botón "Comprar Premium con PayPal" en `/pricing.html` usa un enlace de pago directo de PayPal con el correo `l29472954@gmail.com` — no requiere ninguna clave de API. Es intencionalmente **manual**: tras pagar, el usuario debe contactar para que se le active el plan Premium a mano.

Para automatizar la activación (recomendado antes de escalar):

1. Configura un botón de PayPal (Checkout / Suscripciones) o Webhooks de PayPal desde tu cuenta de negocio.
2. Crea un endpoint en el backend (por ejemplo `POST /webhooks/paypal`) que reciba la notificación, verifique la firma según la documentación oficial de PayPal, y actualice `users.plan = 'premium'` para el usuario correspondiente.
3. No se incluye código de integración con credenciales porque no se proporcionó ninguna clave de API de PayPal — solo el correo de la cuenta.

## 9. Integración de IA (opcional)

Los endpoints `/api/ai/*` (chat, translate, summarize, rewrite) están completos a nivel de rutas y validación, pero **no incluyen ninguna clave de proveedor inventada**. Mientras `AI_PROVIDER` y `AI_PROVIDER_API_KEY` no estén configurados en `.env`, responden `501` explicando cómo activarlos.

Para conectarlos:

1. Consigue una clave de un proveedor real (OpenAI, Anthropic, etc.).
2. Configura `AI_PROVIDER` y `AI_PROVIDER_API_KEY` en `.env`.
3. Completa la llamada real en `src/services/aiService.js` (ya incluye un ejemplo comentado listo para adaptar).

## 10. Recuperación de contraseña (correo)

El flujo de "olvidé mi contraseña" está completo, pero el envío de correos reales depende de un proveedor SMTP que no fue proporcionado. Mientras las variables `SMTP_*` estén vacías, el sistema funciona en "modo desarrollo": el enlace de restablecimiento se devuelve directamente en la respuesta de la API (y se muestra en `/forgot-password.html`) en vez de enviarse por correo. Configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y añade el envío real (por ejemplo con `nodemailer`) en `authController.forgotPassword` para producción.

## 11. Seguridad implementada

- JWT para sesiones, con expiración configurable.
- Contraseñas con `bcrypt`.
- Validación de entradas en cada endpoint.
- Rate limiting: límite general por IP en `/api/*`, límite estricto en login/registro/recuperación para frenar fuerza bruta y spam.
- Cabeceras de seguridad con `helmet`.
- Registro (log) de cada solicitud a la API pública: usuario, clave usada, endpoint, método, código de estado, IP y duración.

## 12. Base de datos

SQLite (`better-sqlite3`), archivo único en `data/alexapi.db` (se crea automáticamente). Tablas: `users`, `api_keys`, `request_logs`, `usage_monthly`. El esquema completo está en `src/config/schema.sql`. Para producción a mayor escala, el mismo patrón de consultas puede migrarse a PostgreSQL/MySQL manteniendo la misma estructura de controladores.

## 13. Despliegue

### Opción genérica (VPS, PM2, etc.)

1. `npm install --production`
2. Configura `.env` con valores reales (`JWT_SECRET` propio, `PORT`, etc.).
3. `npm start` (o gestiona el proceso con PM2 / systemd / el servicio de tu proveedor).
4. Sirve la aplicación detrás de HTTPS (por ejemplo con un proxy Nginx o el TLS de tu proveedor de hosting).
5. Haz una copia de seguridad periódica del archivo `data/alexapi.db`.

### Opción Render (recomendada, incluida lista para usar)

El proyecto trae `Dockerfile` y `render.yaml` ya configurados:

1. Sube el contenido de esta carpeta a un repositorio de GitHub (o GitLab).
2. En Render: **New +** → **Blueprint** → conecta el repo. Render detecta `render.yaml` solo y crea el servicio con:
   - Build con Docker (incluye Node, Python, `ffmpeg` y `yt-dlp` — necesarios para `/api/download/*`).
   - Un disco persistente de 1 GB montado en `/app/data` para que la base de datos SQLite sobreviva a los reinicios/despliegues.
   - `JWT_SECRET` generado automáticamente por Render.
3. Revisa las variables de entorno del servicio (`AI_PROVIDER_API_KEY`, `SMTP_*`, etc.) y complétalas si vas a usar esas funciones.
4. Despliega. La URL pública que te da Render ya sirve todo el sitio y la API.

Si prefieres no usar Blueprint, también puedes crear el servicio manualmente en Render eligiendo **Docker** como entorno (no "Node" nativo, para que se instale `yt-dlp`/`ffmpeg`), y agregar tú mismo el disco persistente en `/app/data` con la variable `DATABASE_PATH=/app/data/alexapi.db`.

## 14. Endpoints incluidos

**IA** (`/api/ai/*`) — chat, translate, summarize, rewrite _(requieren configurar un proveedor)_
**Herramientas** (`/api/tools/*`) — qr, base64/encode, base64/decode, hash/md5, hash/sha256, password, uuid, ip, user-agent, timestamp, color/random
**Texto** (`/api/text/*`) — uppercase, lowercase, reverse, count
**Imágenes** (`/api/images/*`) — resize, compress, grayscale, blur _(procesamiento 100% local con `sharp`, sin servicios externos)_
**Descargas** (`/api/download/*`) — info, video, audio _(ver nota legal abajo)_
**Sistema** (`/api/system/*`) — status, stats, version, uptime

Todos documentados con ejemplos y probador en vivo en `/docs.html`.

## 15. Descargas (`/api/download/*`) — cómo funciona y límites

Estos endpoints usan **`yt-dlp`** (proyecto open source, mantenido públicamente) para leer la metadata pública de una URL y devolver el enlace directo del video/audio. El servidor **no descarga ni guarda** el archivo — solo entrega el enlace directo al CDN de origen, así que no necesitas espacio en disco para esto.

- `POST /api/download/info` — título, miniatura, duración, y la lista completa de formatos disponibles.
- `GET /api/download/video?url=...` — el enlace directo del mejor formato de video.
- `GET /api/download/audio?url=...` — el enlace directo del mejor formato de solo audio.

Funciona con cualquier sitio soportado por `yt-dlp` (YouTube, TikTok, Instagram, Facebook, X/Twitter, y varios cientos más), detectado automáticamente a partir de la URL.

**Nota legal/ética importante:** estos endpoints están pensados para contenido propio, de dominio público, o para el cual tienes permiso explícito del titular de los derechos. Descargar y redistribuir masivamente contenido con derechos de autor de terceros puede violar los Términos de Servicio de la plataforma de origen y la ley de propiedad intelectual aplicable en tu país. Tú, como operador de esta API, eres responsable del uso que se le dé.

**Requisito de despliegue:** necesita el binario `yt-dlp` (y opcionalmente `ffmpeg`) instalado en el servidor. El `Dockerfile` incluido ya lo instala automáticamente. Si despliegas sin Docker (por ejemplo un VPS a mano), instala `yt-dlp` tú mismo (`pip install yt-dlp`) y asegúrate de que esté en el `PATH`. Mientras no esté disponible, estos endpoints responden `501` con un mensaje explicativo — no de forma silenciosa.
