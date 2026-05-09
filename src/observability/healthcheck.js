const db = require('../db');
const redis = require('../cache/redis');

async function healthcheck(req, res) {
  const checks = {};

  try {
    await db.raw('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    if (redis) {
      await redis.ping();
      checks.redis = 'ok';
    } else {
      checks.redis = 'disabled';
    }
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === 'disabled');
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', checks });
}

module.exports = { healthcheck };
