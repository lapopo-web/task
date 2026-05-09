const rateLimit = require('express-rate-limit');

const authLimiter = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many attempts, please try again later' },
      skipSuccessfulRequests: false,
    });

module.exports = { authLimiter };
