require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');
const { createApiKey } = require('../services/apiKeyService');

const EMAIL = 'demo@alexapi.dev';
const PASSWORD = 'Demo1234';

function run() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(EMAIL);
  if (existing) {
    console.log(`El usuario demo ya existe (${EMAIL}).`);
    return;
  }

  const now = Date.now();
  const passwordHash = bcrypt.hashSync(PASSWORD, 12);
  const info = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, plan, avatar_color, created_at, updated_at)
       VALUES (?, ?, ?, 'free', '#7C5CFF', ?, ?)`
    )
    .run('Usuario Demo', EMAIL, passwordHash, now, now);

  const key = createApiKey(info.lastInsertRowid, 'Default Key');

  console.log('Usuario demo creado:');
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  API Key:  ${key.key}`);
}

run();
