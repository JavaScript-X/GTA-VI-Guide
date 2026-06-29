# Delivery Backlog

## Phase 1: Foundation

- Monorepo structure.
- API gateway.
- Five core services.
- Static web MVP.
- Docker Compose.
- Health checks and smoke tests.

## Phase 2: Real Persistence

- Add PostgreSQL schemas per service.
- Add migrations.
- Add repository layer and contract tests.
- Add seed/import tools for guides and achievements.
- Add runtime repositories with PostgreSQL-ready adapters and memory fallback.
- Persist users, sessions, linked accounts, consent events, guides, profiles,
  achievements, and community activity.
- Add a migration runner for `infra/database/migrations/V*.sql`.

## Phase 3: Authentication

- Add first-party accounts.
- Add sessions/JWT.
- Add consent records.
- Add role-based access for contributors and moderators.

## Phase 4: Account Linking

- Implement official OAuth flows when provider access is approved.
- Add token encryption.
- Add sync job orchestration.
- Add provider-specific adapters with graceful degradation.

## Phase 5: Community Features

- Rich guide editor.
- Comments and reactions.
- Crew pages.
- Event planning.
- Reports, moderation queue, and audit trail.

## Phase 6: Scale And Reliability

- Event bus.
- Background workers.
- CDN and image pipeline.
- Rate limits and anti-abuse rules.
- Distributed tracing and alerting.
- Kubernetes manifests or Terraform.
