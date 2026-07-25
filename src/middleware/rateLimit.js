const rateLimit = require('express-rate-limit');

// Limite general para todas las rutas /api/* (proteccion basica anti-abuso,
// independiente del limite de plan que ya impone el middleware de API Key).
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 solicitudes por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }
});

// Limite estricto para login/registro/recuperacion: previene fuerza bruta y spam.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 intentos cada 15 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.' }
});

module.exports = { apiLimiter, authLimiter };
