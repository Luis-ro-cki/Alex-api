const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!SECRET) {
  // No detenemos el proceso en modo desarrollo, pero avisamos con fuerza:
  // en produccion esto DEBE estar configurado con un valor propio y seguro.
  console.warn('[ALERTA] JWT_SECRET no esta configurado en .env. Usando un valor temporal inseguro.');
}

const EFFECTIVE_SECRET = SECRET || 'clave-temporal-insegura-configura-JWT_SECRET';

function signToken(payload) {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, EFFECTIVE_SECRET);
}

module.exports = { signToken, verifyToken };
