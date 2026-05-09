# CLAUDE.md — TaskFlow

## Project Overview

TaskFlow is a multi-tenant task management SaaS for teams of 5–50 people: each organization manages projects and tasks in an isolated workspace, with users assigned to tasks, status workflow (todo / in_progress / done), and priority levels (low / medium / high).

## Architecture & Boundaries

1. Backend: Node.js + Express on port 4000. Frontend: React (Vite) on port 5173 in dev, served by nginx in prod.
2. Database access only through the repository layer (src/features/*/repository.js). Never query DB from controllers or routes.
3. Frontend communicates with backend exclusively via /api/* — never direct DB access from the browser.

## Coding Conventions

1. CommonJS (require/module.exports) for backend. ES modules for frontend React components.
2. File naming: kebab-case for files, PascalCase for React components.
3. Async/await throughout — no raw Promise chains. Errors propagate via throw to the error-handler middleware.

## Database Rules

1. Primary keys: UUID v4. Never auto-increment integers.
2. Audit columns on every table: created_at, updated_at, deleted_at (TIMESTAMP NULL).
3. Soft delete only: never DROP rows. Set deleted_at instead.
4. Multi-tenancy: every tenant-scoped table carries an organization_id FK.
5. Every foreign key column has a corresponding index — explicitly, never assumed.
6. Composite indexes match real query patterns. Most-selective column first.
7. Schema changes are new Knex migration files. Never modify an existing migration.

## Testing Rules

1. Write failing tests FIRST (Red), then implement to make them pass (Green). No exceptions.
2. Tests use a separate database: NODE_ENV=test targets taskflow_test DB.
3. Each test is self-contained: seed its own data in beforeEach, clean up in afterEach.

## Frontend Rules

1. Every async operation has three states: loading, success, error — all three must be visible in the UI.
2. Validation errors are shown inline at field level, not as a global banner.
3. API calls go through src/api/tasks.js — never fetch() inline in components.
4. Use semantic HTML elements (button, form, label, input) — no div soup.
5. Design tokens in src/styles/tokens.css — no hardcoded colors or font sizes in component CSS.
6. Components are functional with hooks. No class components.

## Forbidden Patterns

1. Never store JWT in localStorage — always httpOnly cookies.
2. Never SELECT * in production queries — always name the columns explicitly.
3. Never return 403 for cross-tenant resource access — return 404 to avoid confirming existence.

## Always-On Behaviors

1. Every new file gets a corresponding test file if it contains business logic.
2. After every code change, run the test suite before committing.

## Security Rules

1. Authentication: JWT in httpOnly + Secure + SameSite=Lax cookies. Never localStorage.
2. Password hashing: bcrypt with cost factor 12. Never MD5, SHA256, or plain.
3. Rate limit on auth endpoints: 5 attempts per 15 minutes per IP.
4. Validate ALL user input with Joi at the route boundary. Never trust req.body.
5. Security headers via Helmet: CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
6. CORS: explicit allow-list of origins. No wildcard in production.
7. Secrets via environment variables only. Never commit .env. Never hardcode.

## Testing Rules (E2E addition)

4. E2E tests cover critical user journeys: signup, login, create task, view task.
5. E2E tests run against a fresh test database, isolated from dev and unit-test DB.
6. Each E2E test is independent: no shared state between tests, reset fixtures in beforeEach.

## Deployment Rules

1. Multi-stage Dockerfiles: separate build stage from runtime stage. Final image uses a slim base (alpine or distroless).
2. Run as non-root user inside containers (USER 1000 or named user).
3. Healthcheck endpoint at GET /healthz returning 200 + JSON status.
4. Koyeb is the production platform. Single region close to Abidjan: fra (Frankfurt).
5. No secrets in Dockerfile or koyeb.yaml. All via koyeb secret create.

## Observability Rules

1. All logs are structured JSON via Pino. No console.log in production code.
2. Every API request gets a correlation_id (UUID) in request and response headers.
3. Unhandled exceptions log at level error with stack, correlation_id, and request context.
