# TaskFlow — Operational Runbook

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (production) |
| `JWT_SECRET` | Yes | 32+ character random secret for JWT signing |
| `NODE_ENV` | Yes | `production` in prod, `development` locally |
| `PORT` | No | API port (default: 4000) |
| `FRONTEND_URL` | Yes | Frontend origin for CORS allow-list |
| `UPSTASH_REDIS_URL` | No | Redis URL with credentials (app works without it) |
| `ALLOWED_ORIGINS` | No | Comma-separated extra CORS origins |

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop running

### Start the database
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Install dependencies
```bash
npm install
```

### Set up environment
```bash
cp .env.example .env
# Edit .env with your local values
```

### Run migrations and seeds
```bash
npm run db:migrate
npm run db:seed
```

### Start the dev server
```bash
# Terminal 1 — API
npm run dev

# Terminal 2 — Frontend (Vite HMR)
npm run dev:frontend
```

The app is available at http://localhost:5173 (proxied to API at :4000).

## Running Tests

### Unit + integration tests
```bash
NODE_ENV=test npm test
```

Tests use a separate `taskflow_test` database. Ensure it exists:
```bash
createdb taskflow_test
NODE_ENV=test npm run db:migrate
```

### E2E tests (Playwright)
Requires the full stack running on port 8080:
```bash
# Option A — Docker
docker build -t taskflow .
docker run -p 8080:8080 \
  -e DATABASE_URL=<url> \
  -e JWT_SECRET=<secret> \
  -e NODE_ENV=test_e2e \
  taskflow

# Option B — nginx + node manually
NODE_ENV=test_e2e npm run dev &
npx playwright test
```

E2E tests call `POST /api/test/reset-db` before each test — this endpoint is **only mounted in `test_e2e` environment**.

## Database Operations

### Create a new migration
```bash
npx knex migrate:make migration_name
```

### Run pending migrations
```bash
npm run db:migrate
# Or for a specific env:
NODE_ENV=production npm run db:migrate
```

### Roll back last migration
```bash
npx knex migrate:rollback
```

### Roll back all migrations
```bash
npx knex migrate:rollback --all
```

### Reset development database
```bash
npx knex migrate:rollback --all && npm run db:migrate && npm run db:seed
```

## Deployment — Koyeb

### First deployment
1. Push Docker image to GHCR (done automatically by GitHub Actions on push to `main`)
2. Create a Koyeb service:
   - Region: `fra`
   - Image: `ghcr.io/<org>/taskflow:latest`
   - Port: 8080
   - Health check: `GET /health`
3. Set secrets in Koyeb dashboard:
   - `TASKFLOW_DATABASE_URL` → PostgreSQL connection string
   - `TASKFLOW_JWT_SECRET` → random 32+ byte hex string
   - `TASKFLOW_UPSTASH_REDIS_URL` → Upstash Redis URL (optional)

### Subsequent deployments
Push to `main` triggers the GitHub Actions `deploy.yml` workflow automatically:
1. Builds multi-stage Docker image
2. Pushes to GHCR with `sha-<commit>` and `latest` tags
3. Triggers Koyeb redeploy via API

### Manual redeploy
```bash
koyeb service redeploy taskflow/web
```

### Rollback
1. Find the previous image tag in GHCR (`sha-<previous-commit>`)
2. In Koyeb dashboard → Service → Deployments → redeploy the previous deployment
3. Or via CLI:
   ```bash
   koyeb service update taskflow/web --docker ghcr.io/<org>/taskflow:sha-<hash>
   ```

## Health Monitoring

### Health check endpoint
```
GET /health
```
Returns `200 OK` with:
```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}
```
Returns `503 Service Unavailable` if any probe fails.

### Prometheus metrics
```
GET /metrics
```
Key metrics:
- `http_request_duration_seconds` — P50/P95/P99 request latency histogram
- `http_requests_total` — request count by method/route/status
- `process_*` — Node.js process metrics (memory, CPU, event loop)

### Interpreting logs
All logs are structured JSON (pino). Every request log includes:
- `correlation_id` — trace individual requests across log lines
- `req.method`, `req.url`, `res.statusCode`, `responseTime`
- `err` with stack trace on errors

Filter for errors:
```bash
koyeb service logs taskflow/web | jq 'select(.level >= 50)'
```

## Incident Response

### API returning 500s
1. Check logs: `koyeb service logs taskflow/web`
2. Check DB connectivity: `GET /health`
3. Check for migration drift: ensure `knex_migrations` table is current
4. Roll back if a recent deploy introduced the issue

### Database connection exhausted
- Default pool: min 2, max 10 connections
- Check active connections: `SELECT count(*) FROM pg_stat_activity WHERE datname = 'taskflow'`
- Restart Node.js process if pool is stuck (supervisord: `supervisorctl restart node`)

### Redis cache poisoned / stale
The cache is opt-in and optional. To flush:
```bash
redis-cli -u $UPSTASH_REDIS_URL FLUSHDB
```
Or simply restart the service — cache is warm on first request.

### Rate limit false positives
Auth endpoints limit to 5 requests / 15 min per IP. If a legitimate user is blocked:
- Wait 15 minutes for the window to reset
- In production behind a proxy, verify `X-Forwarded-For` is correctly trusted

## Secrets Rotation

### Rotate JWT_SECRET
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update secret in Koyeb dashboard
3. Redeploy service
4. **All active sessions are invalidated** — users will need to log in again

### Rotate DATABASE_URL
1. Update Koyeb secret
2. Redeploy — Knex will reconnect on startup with new credentials
