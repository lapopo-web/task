require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const logger = require('./observability/logger');
const { register } = require('./observability/metrics');
const { healthcheck } = require('./observability/healthcheck');
const correlationId = require('./middleware/correlation-id');
const errorHandler = require('./middleware/error-handler');
const authRoutes = require('./features/auth/auth.routes');
const tasksRoutes = require('./features/tasks/tasks.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(correlationId);
app.use(pinoHttp({
  logger,
  customProps: (req) => ({ correlation_id: req.correlationId }),
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
}));

app.get('/healthz', healthcheck);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

if (process.env.NODE_ENV === 'test_e2e') {
  const testRouter = require('./test-utils/reset');
  app.use('/api/test', testRouter);
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
  });
}

module.exports = app;
