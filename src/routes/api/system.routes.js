const express = require('express');
const db = require('../../config/db');
const { ok } = require('../../utils/responses');

const router = express.Router();
const START_TIME = Date.now();
const VERSION = require('../../../package.json').version;

router.get('/status', (req, res) => {
  return ok(res, { status: 'operativo', timestamp: new Date().toISOString() });
});

router.get('/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const totalKeys = db.prepare("SELECT COUNT(*) AS c FROM api_keys WHERE status = 'active'").get().c;
  const totalRequests = db.prepare('SELECT COUNT(*) AS c FROM request_logs').get().c;
  const today = new Date().toISOString().slice(0, 10);
  const requestsToday = db
    .prepare("SELECT COUNT(*) AS c FROM request_logs WHERE strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') = ?")
    .get(today).c;

  return ok(res, {
    totalUsers,
    activeApiKeys: totalKeys,
    totalRequests,
    requestsToday
  });
});

router.get('/version', (req, res) => {
  return ok(res, { version: VERSION, name: 'Alex API' });
});

router.get('/uptime', (req, res) => {
  const ms = Date.now() - START_TIME;
  return ok(res, {
    uptimeMs: ms,
    uptimeHuman: humanizeDuration(ms),
    since: new Date(START_TIME).toISOString()
  });
});

function humanizeDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = router;
