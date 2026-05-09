const logger = require('../observability/logger');

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  logger.error({
    err,
    correlation_id: req.correlationId,
    method: req.method,
    url: req.url,
    status,
  });

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
