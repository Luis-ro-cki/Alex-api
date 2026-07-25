require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const logger = require('./src/utils/logger');
const { apiLimiter } = require('./src/middleware/rateLimit');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

// Inicializa la base de datos (crea el archivo y las tablas si no existen).
require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// --- Seguridad basica ---
app.use(
  helmet({
    contentSecurityPolicy: false // el frontend estatico define su propio CSP si se necesita
  })
);
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Archivos estaticos del frontend ---
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// --- Rutas de la plataforma (cuentas, dashboard, api keys) ---
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/user', require('./src/routes/user.routes'));
app.use('/api-keys', require('./src/routes/apikeys.routes'));
app.use('/dashboard', require('./src/routes/dashboard.routes'));
app.use('/docs-data', require('./src/routes/docs.routes'));
app.use('/public', require('./src/routes/public.routes'));

// --- API publica (protegida por API Key) ---
app.use('/api', apiLimiter, require('./src/routes/api/index'));

// --- 404 y manejo de errores ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Alex API escuchando en http://localhost:${PORT}`);
});
