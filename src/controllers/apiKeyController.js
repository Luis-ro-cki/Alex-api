const db = require('../config/db');
const { ok, fail } = require('../utils/responses');
const { createApiKey, canCreateMoreKeys, generateKeyString } = require('../services/apiKeyService');
const { getPlan } = require('../config/plans');
const { currentPeriod, getMonthlyUsage } = require('../middleware/apiKey');

function listKeys(req, res) {
  const keys = db.prepare('SELECT id, name, key, status, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return ok(res, { keys });
}

function createKey(req, res) {
  const user = req.user;
  if (!canCreateMoreKeys(user)) {
    const plan = getPlan(user.plan);
    return fail(res, 403, `Tu plan ${plan.label} permite hasta ${plan.maxApiKeys} API Key(s) activas. Elimina una o mejora a Premium.`);
  }

  const name = (req.body && req.body.name) || 'Nueva API Key';
  const key = createApiKey(user.id, name);
  return ok(res, { key }, 201);
}

function regenerateKey(req, res) {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) {
    return fail(res, 404, 'API Key no encontrada.');
  }

  const newKey = generateKeyString();
  db.prepare('UPDATE api_keys SET key = ?, status = ?, last_used_at = NULL WHERE id = ?').run(newKey, 'active', existing.id);
  const updated = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(existing.id);
  return ok(res, { key: updated });
}

function deleteKey(req, res) {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) {
    return fail(res, 404, 'API Key no encontrada.');
  }
  db.prepare('DELETE FROM api_keys WHERE id = ?').run(existing.id);
  return ok(res, { message: 'API Key eliminada correctamente.' });
}

function keyUsage(req, res) {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) {
    return fail(res, 404, 'API Key no encontrada.');
  }

  const plan = getPlan(req.user.plan);
  const period = currentPeriod();
  const used = getMonthlyUsage(req.user.id, period);

  return ok(res, {
    key: { id: existing.id, name: existing.name, status: existing.status, lastUsedAt: existing.last_used_at },
    usage: { used, limit: plan.monthlyLimit, remaining: Math.max(plan.monthlyLimit - used, 0), period }
  });
}

module.exports = { listKeys, createKey, regenerateKey, deleteKey, keyUsage };
