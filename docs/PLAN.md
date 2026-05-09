# TaskFlow — Implementation Plan

## Architecture

```
Browser (React + Vite)
    │  httpOnly cookie (JWT)
    ▼
nginx :8080
    ├── /api/*  →  Express :4000
    │                ├── middleware: correlationId, pinoHttp, helmet, cors, cookieParser
    │                ├── /api/auth  — signup, login, logout, me
    │                └── /api/tasks — CRUD (authenticated)
    └── /*      →  SPA (dist/index.html)

Express :4000
    ├── Knex → PostgreSQL (organizations, users, projects, tasks)
    └── ioredis → Upstash Redis (task list cache)
```

## Session Breakdown

### CP1 — Tranche Verticale

**Session 1: Project setup**
- Git repo, package.json, knexfile.js, docker-compose.dev.yml, .env.example
- CLAUDE.md with all coding rules

**Session 2: Database schema**
- Migrations: organizations, users, projects, tasks
- Seeds: 2 organizations, 3 users, 2 projects, 20 tasks
- TDD: verify seed data integrity

**Session 3: Task API**
- TDD: write failing tests for POST /tasks, GET /tasks/:id
- Repository pattern (no raw queries in controllers)
- Service layer with soft-delete
- Controller + routes
- Tests GREEN

**Session 4: Frontend**
- Vite + React scaffold
- API wrapper (fetch + credentials:include)
- TaskCreate form (3 async states, inline validation)
- TaskList with filter
- TaskCard with inline status update

**Session 5: Vertical integration**
- Mock authenticate middleware (passes org/user from header for dev)
- Wire frontend to backend via Vite proxy
- Manual smoke test of full flow

### CP2 — Production Readiness

**Session 6: Real authentication**
- Auth service: signup (transaction), login (bcrypt.compare)
- JWT: signToken, setTokenCookie (httpOnly, SameSite=Lax)
- Auth routes + rate limiter
- TDD: auth.test.js

**Session 7: Security hardening**
- Helmet CSP/HSTS/noSniff
- CORS allow-list
- Joi validation on all inputs
- Replace mock authenticate middleware with real JWT verification

**Session 8: Observability**
- Pino logger + pino-http with correlation_id
- Prometheus metrics (histogram + counter)
- /health endpoint (DB + Redis probes)
- Upstash Redis cache for task list

**Session 9: Docker + Koyeb**
- Multi-stage Dockerfile (frontend-builder → backend-builder → nginx:alpine)
- supervisord: nginx + node in mono-container
- nginx.conf: proxy /api/ → :4000, SPA fallback
- .dockerignore
- koyeb.yaml (fra region, free tier)
- GitHub Actions: ci.yml + deploy.yml (GHCR + Koyeb)

**Session 10: E2E + Docs**
- Playwright config
- e2e/auth.spec.js: signup, login, logout
- e2e/tasks-crud.spec.js: create, validation error, status update, delete, cross-tenant isolation
- docs/runbook.md
- docs/security-audit.txt

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Mono-container (nginx + node) | Koyeb free tier: 1 web service only |
| httpOnly cookies | Prevent XSS token theft vs localStorage |
| 404 for cross-tenant | Never leak resource existence |
| UUID v4 PKs | No sequential ID enumeration attacks |
| Soft delete | Audit trail, accidental deletion recovery |
| Repository pattern | Testable without mocking the entire ORM |
| Redis optional | App works without UPSTASH_REDIS_URL |
