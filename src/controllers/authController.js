const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const { ok, fail } = require('../utils/responses');
const { isValidEmail, isValidPassword, isNonEmptyString } = require('../utils/validators');
const { createApiKey } = require('../services/apiKeyService');
const logger = require('../utils/logger');

const AVATAR_COLORS = ['#7C5CFF', '#22D3EE', '#34D399', '#FBBF24', '#F87171', '#60A5FA'];

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    avatarColor: user.avatar_color,
    createdAt: user.created_at
  };
}

function register(req, res) {
  const { name, email, password } = req.body || {};

  if (!isNonEmptyString(name, 100)) {
    return fail(res, 400, 'El nombre es obligatorio.');
  }
  if (!isValidEmail(email)) {
    return fail(res, 400, 'Introduce un correo electronico valido.');
  }
  if (!isValidPassword(password)) {
    return fail(res, 400, 'La contraseña debe tener al menos 8 caracteres, con letras y numeros.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return fail(res, 409, 'Ya existe una cuenta con ese correo electronico.');
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const now = Date.now();
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const info = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, plan, avatar_color, created_at, updated_at)
       VALUES (?, ?, ?, 'free', ?, ?, ?)`
    )
    .run(name.trim(), email.trim().toLowerCase(), passwordHash, avatarColor, now, now);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  createApiKey(user.id, 'Default Key');

  const token = signToken({ sub: user.id });
  logger.info(`Nuevo usuario registrado: ${user.email}`);

  return ok(res, { token, user: publicUser(user) }, 201);
}

function login(req, res) {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || !isNonEmptyString(password, 200)) {
    return fail(res, 400, 'Correo o contraseña invalidos.');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return fail(res, 401, 'Correo o contraseña incorrectos.');
  }

  const token = signToken({ sub: user.id });
  return ok(res, { token, user: publicUser(user) });
}

function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!isValidEmail(email)) {
    return fail(res, 400, 'Introduce un correo electronico valido.');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

  // Respuesta identica exista o no el usuario, para no filtrar que correos estan registrados.
  const genericMessage = 'Si el correo existe en nuestro sistema, recibiras instrucciones para restablecer tu contraseña.';

  if (!user) {
    return ok(res, { message: genericMessage });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hora

  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(token, expires, user.id);

  const smtpConfigured = Boolean(process.env.SMTP_HOST);

  if (smtpConfigured) {
    // TODO: integracion de correo pendiente de configurar (nodemailer u otro proveedor)
    // usando las variables SMTP_* del archivo .env. No se envia nada todavia
    // porque no hay credenciales reales configuradas en este entorno.
    logger.info(`Enlace de restablecimiento generado para ${user.email} (envio por correo pendiente de configurar).`);
    return ok(res, { message: genericMessage });
  }

  // Modo desarrollo: sin SMTP configurado, devolvemos el token para poder probar el flujo.
  logger.warn('SMTP no configurado: devolviendo el token de restablecimiento directamente en la respuesta (solo para desarrollo).');
  return ok(res, {
    message: genericMessage,
    devResetToken: token,
    devNote: 'SMTP no configurado. Este token solo se expone porque no hay servicio de correo activo.'
  });
}

function resetPassword(req, res) {
  const { token, password } = req.body || {};

  if (!isNonEmptyString(token, 200)) {
    return fail(res, 400, 'Token invalido.');
  }
  if (!isValidPassword(password)) {
    return fail(res, 400, 'La nueva contraseña debe tener al menos 8 caracteres, con letras y numeros.');
  }

  const user = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);
  if (!user || !user.reset_token_expires || user.reset_token_expires < Date.now()) {
    return fail(res, 400, 'El enlace de restablecimiento es invalido o ha expirado.');
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = ? WHERE id = ?').run(
    passwordHash,
    Date.now(),
    user.id
  );

  return ok(res, { message: 'Tu contraseña se actualizo correctamente. Ya puedes iniciar sesion.' });
}

module.exports = { register, login, forgotPassword, resetPassword, publicUser };
