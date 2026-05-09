# TaskFlow — Product Requirements Document

## Overview
TaskFlow is a multi-tenant SaaS task management application for teams of 5–50 people. Each organization gets a fully isolated workspace. Users can create, assign, and track tasks through a kanban-style workflow.

## Problem Statement
Small teams lack affordable, secure task tracking tools that enforce strict data isolation between tenants while remaining simple enough to deploy on free-tier infrastructure.

## Target Users
- Team owners: set up workspace, invite members, full CRUD on all tasks
- Team members: create and manage their own tasks, view team tasks

## Core Features

### Authentication (CP1 + CP2)
- Email/password signup creates an organization and owner account in a single transaction
- Login issues a JWT stored in an httpOnly, SameSite=Lax cookie (never localStorage)
- Logout clears the cookie server-side
- Rate limit: 5 attempts / 15 minutes per IP on auth endpoints

### Task Management (CP1)
- Create tasks with title, description, priority (low/medium/high), status (todo/in_progress/done), due date
- List tasks with filters: status, priority, project, assignee
- Update task status inline from the task card
- Soft-delete tasks (deleted_at timestamp, never hard DELETE)

### Multi-Tenancy (CP1 + CP2)
- Every tenant-scoped table has organization_id FK
- Cross-tenant access returns 404 (not 403 — never leaks resource existence)
- All queries filter by organization_id before any other condition

### Security (CP2)
- Helmet: CSP, HSTS, X-Frame-Options, noSniff
- CORS: explicit allow-list, no wildcards in production
- Joi validation on all inputs at system boundary
- bcrypt cost factor 12 for password hashing
- UUID v4 primary keys throughout (no sequential IDs)

### Observability (CP2)
- Pino structured JSON logs with correlation_id on every request
- Prometheus metrics at /metrics (default + HTTP request duration histogram)
- Health check at /health (database + redis probes)

### Caching (CP2)
- Upstash Redis for task list cache (TTL 60s, invalidated on write)
- Cache is optional — app works fully without UPSTASH_REDIS_URL

## Non-Goals (v1)
- Email notifications
- File attachments
- Mobile native app
- Multiple projects per organization (project model exists but UI is single-project)

## Success Metrics
- P95 API latency < 200ms
- Zero cross-tenant data leaks in E2E tests
- All unit + integration tests pass on CI
- Docker image builds and deploys to Koyeb free tier
