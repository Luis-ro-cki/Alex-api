const { verifyToken } = require('../utils/jwt');
const { fail } = require('../utils/responses');
const db = require('../config/db');

/**
 * Protege rutas del dashboard/perfil: exige un JWT valido de sesion
 * (Authorization: Bearer <token>).
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'No autenticado. Inicia sesion para continuar.');
  }

  try {
    const payload = verifyToken(token);
    const user = db.prepare('SELECT id, name, email, plan, avatar_color, created_at FROM users WHERE id = ?').get(payload.sub);
    if (!user) {
      return fail(res, 401, 'La sesion ya no es valida.');
    }
    req.user = user;
    next();
  } catch (err) {
    return fail(res, 401, 'Sesion invalida o expirada.');
  }
}

module.exports = { requireAuth };
