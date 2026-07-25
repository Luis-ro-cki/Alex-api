const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ok, fail } = require('../utils/responses');
const { isNonEmptyString, isValidPassword, isValidEmail } = require('../utils/validators');
const { publicUser } = require('./authController');

function getProfile(req, res) {
  return ok(res, { user: publicUser(req.user) });
}

function updateProfile(req, res) {
  const { name, email } = req.body || {};
  const updates = [];
  const params = [];

  if (name !== undefined) {
    if (!isNonEmptyString(name, 100)) {
      return fail(res, 400, 'El nombre no es valido.');
    }
    updates.push('name = ?');
    params.push(name.trim());
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return fail(res, 400, 'El correo electronico no es valido.');
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.trim().toLowerCase(), req.user.id);
    if (existing) {
      return fail(res, 409, 'Ese correo ya esta en uso por otra cuenta.');
    }
    updates.push('email = ?');
    params.push(email.trim().toLowerCase());
  }

  if (updates.length === 0) {
    return fail(res, 400, 'No se enviaron cambios.');
  }

  updates.push('updated_at = ?');
  params.push(Date.now());
  params.push(req.user.id);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return ok(res, { user: publicUser(user) });
}

function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return fail(res, 401, 'La contraseña actual es incorrecta.');
  }
  if (!isValidPassword(newPassword)) {
    return fail(res, 400, 'La nueva contraseña debe tener al menos 8 caracteres, con letras y numeros.');
  }

  const passwordHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, Date.now(), user.id);

  return ok(res, { message: 'Contraseña actualizada correctamente.' });
}

// El "logout" en una API con JWT sin estado es responsabilidad del cliente
// (elimina el token almacenado). Este endpoint existe para dar una respuesta
// explicita y un punto donde, en el futuro, se pueda anadir una lista negra de tokens.
function logout(req, res) {
  return ok(res, { message: 'Sesion cerrada. Elimina el token guardado en el cliente.' });
}

module.exports = { getProfile, updateProfile, changePassword, logout };
