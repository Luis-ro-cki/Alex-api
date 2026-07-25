const db = require('../config/db');
const { ok } = require('../utils/responses');
const { getPlan } = require('../config/plans');
const { currentPeriod, getMonthlyUsage } = require('../middleware/apiKey');

function overview(req, res) {
  const user = req.user;
  const plan = getPlan(user.plan);
  const period = currentPeriod();
  const used = getMonthlyUsage(user.id, period);
  const remaining = Math.max(plan.monthlyLimit - used, 0);

  const primaryKey = db
    .prepare("SELECT * FROM api_keys WHERE user_id = ? AND status = 'active' ORDER BY created_at ASC LIMIT 1")
    .get(user.id);

  const history = db
    .prepare('SELECT endpoint, method, status_code, created_at FROM request_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(user.id);

  const totalRequests = db.prepare('SELECT COUNT(*) AS c FROM request_logs WHERE user_id = ?').get(user.id).c;
  const errorCount = db
    .prepare('SELECT COUNT(*) AS c FROM request_logs WHERE user_id = ? AND status_code >= 400')
    .get(user.id).c;

  // Uso diario de los ultimos 14 dias, para graficas en el dashboard.
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const dailyRows = db
    .prepare(
      `SELECT strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') AS day, COUNT(*) AS c
       FROM request_logs WHERE user_id = ? AND created_at >= ?
       GROUP BY day ORDER BY day ASC`
    )
    .all(user.id, fourteenDaysAgo);

  return ok(res, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: plan.id,
      planLabel: plan.label,
      avatarColor: user.avatar_color
    },
    apiKey: primaryKey ? { id: primaryKey.id, key: primaryKey.key, status: primaryKey.status } : null,
    usage: { used, limit: plan.monthlyLimit, remaining, period },
    stats: { totalRequests, errorCount, successRate: totalRequests ? Number((((totalRequests - errorCount) / totalRequests) * 100).toFixed(1)) : 100 },
    dailyUsage: dailyRows,
    history,
    apiStatus: 'operativo'
  });
}

module.exports = { overview };
