const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
  base: { service: 'taskflow' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
