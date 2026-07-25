const db = require('../config/db');
const { fail } = require('../utils/responses');
const { getPlan } = require('../config/plans');

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthlyUsage(userId, period) {
  const row = db.prepare('SELECT count FROM usage_monthly WHERE user_id = ? AND period = ?').get(userId, period);
  return row ? row.count : 0;
}

function incrementUsage(userId, period) {
  db.prepare(
    `INSERT INTO usage_monthly (user_id, period, count) VALUES (?, ?, 1)
     ON CONFLICT(user_id, period) DO UPDATE SET count = count + 1`
  ).run(userId, period);
}

/**
 * Middleware que protege todos los endpoints publicos bajo /api/*.
 * Requiere el header "x-api-key". Valida estado, plan y consumo mensual,
 * y registra cada solicitud en request_logs para el historial/estadisticas.
 */
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');

  if (!key) {
    return fail(res, 401, 'Falta el header x-api-key. Genera una clave en tu dashboard.');
  }

  const keyRecord = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key);
  if (!keyRecord) {
    return fail(res, 401, 'API Key invalida.');
  }
  if (keyRecord.status !== 'active') {
    return fail(res, 403, 'Esta API Key esta revocada. Genera una nueva desde tu dashboard.');
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(keyRecord.user_id);
  if (!user) {
    return fail(res, 401, 'API Key invalida.');
  }

  const plan = getPlan(user.plan);
  const period = currentPeriod();
  const used = getMonthlyUsage(user.id, period);

  if (used >= plan.monthlyLimit) {
    return fail(res, 429, `Has alcanzado el limite de tu plan (${plan.label}: ${plan.monthlyLimit} solicitudes/mes). Mejora a Premium para continuar.`, {
      plan: plan.id,
      limit: plan.monthlyLimit,
      used
    });
  }

  req.apiUser = user;
  req.apiKeyRecord = keyRecord;

  const startedAt = Date.now();

  res.on('finish', () => {
    try {
      incrementUsage(user.id, period);
      db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?').run(Date.now(), keyRecord.id);
      db.prepare(
        `INSERT INTO request_logs (user_id, api_key_id, endpoint, method, status_code, ip, duration_ms, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        user.id,
        keyRecord.id,
        req.originalUrl.split('?')[0],
        req.method,
        res.statusCode,
        req.ip,
        Date.now() - startedAt,
        Date.now()
      );
    } catch (err) {
      // El registro de logs nunca debe tumbar la respuesta ya enviada.
      console.error('Error registrando log de solicitud:', err.message);
    }
  });

  next();
}

module.exports = { requireApiKey, currentPeriod, getMonthlyUsage };
