# TaskFlow

Multi-tenant SaaS task management for small teams. Built with Node.js, Express, PostgreSQL, and React.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Clone and install
```bash
git clone <repo-url>
cd taskflow
npm install
```

### 2. Start the database
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — minimum required: DATABASE_URL, JWT_SECRET
```

### 4. Run migrations and seeds
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start dev servers
```bash
# Terminal 1 — API on :4000
npm run dev

# Terminal 2 — Frontend on :5173 (proxied to API)
npm run dev:frontend
```

Open http://localhost:5173. Seed credentials: `alice@acme.example` / `password123`

## Running Tests

```bash
# Unit + integration
npm test

# E2E (requires full stack on :8080)
npx playwright test
```

## Architecture

```
Browser (React + Vite)
    │  httpOnly cookie (JWT)
    ▼
nginx :8080
    ├── /api/*  →  Express :4000
    └── /*      →  SPA (dist/index.html)
```

See [docs/PLAN.md](docs/PLAN.md) for full architecture and [docs/runbook.md](docs/runbook.md) for deployment.

## Deployment

Push to `main` triggers GitHub Actions:
1. Builds multi-stage Docker image → GHCR
2. Deploys to Koyeb (Frankfurt, free tier)

Required GitHub secrets: `KOYEB_API_TOKEN`, `GHCR_TOKEN`  
Required Koyeb secrets: `TASKFLOW_DATABASE_URL`, `TASKFLOW_JWT_SECRET`

## Security

- JWT in httpOnly SameSite=Lax cookies
- bcrypt cost 12, timing-safe comparison
- Rate limit: 5 req / 15 min per IP on auth endpoints
- Helmet (CSP, HSTS, noSniff, X-Frame-Options)
- Strict tenant isolation — cross-tenant access returns 404
- Joi validation on all inputs

See [docs/security-audit.txt](docs/security-audit.txt) for full audit results.
