const Redis = require('ioredis');

let redis = null;

if (process.env.UPSTASH_REDIS_URL) {
  redis = new Redis(process.env.UPSTASH_REDIS_URL, {
    tls: { rejectUnauthorized: false },
    maxRetriesPerRequest: 2,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    require('../observability/logger').warn({ err }, 'Redis connection error');
  });
}

module.exports = redis;
