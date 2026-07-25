const { nanoid } = require('nanoid');
const db = require('../config/db');
const { getPlan } = require('../config/plans');

function generateKeyString() {
  return `alx_${nanoid(40)}`;
}

function createApiKey(userId, name = 'Default Key') {
  const key = generateKeyString();
  const now = Date.now();
  const info = db
    .prepare('INSERT INTO api_keys (user_id, name, key, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(userId, name, key, 'active', now);
  return db.prepare('SELECT * FROM api_keys WHERE id = ?').get(info.lastInsertRowid);
}

function countActiveKeys(userId) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM api_keys WHERE user_id = ? AND status = 'active'").get(userId);
  return row.c;
}

function canCreateMoreKeys(user) {
  const plan = getPlan(user.plan);
  return countActiveKeys(user.id) < plan.maxApiKeys;
}

module.exports = { generateKeyString, createApiKey, countActiveKeys, canCreateMoreKeys };
