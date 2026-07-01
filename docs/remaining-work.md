# Remaining Work

This document tracks what is still not fully functional and what must be built
next. It separates real production functionality from foundations, mocks, and
prepared integration boundaries.

## Not Fully Functional Yet

- Services now use a repository boundary with an optional PostgreSQL runtime
  adapter through `pg`. Local development still falls back to memory when
  `DATABASE_URL` or the driver are unavailable.
- Authentication can persist users, refresh sessions, consent events, and audit
  logs through the PostgreSQL adapter, but token hashing, expiration enforcement,
  and account deletion hardening still need production work.
- PSN, Xbox, and Rockstar accounts are not truly connected. Only the safe OAuth
  boundary and consent model exist.
- Player tracking, achievements, vehicles, map districts, crews, and events are
  still based on mock/fallback data.
- The frontend has pages for the full platform, but most actions are not real
  CRUD workflows yet.
- The sync worker currently logs readiness only; it does not consume RabbitMQ
  messages yet.
- RabbitMQ and MinIO are configured, but services do not publish/consume events
  or store uploaded files yet.
- A migration runner exists and checks `platform.schema_migrations` before each
  file, but it still requires `psql` locally and needs CI coverage with a real
  PostgreSQL target.
- CI/CD still has placeholder scan and deployment steps.
- Kubernetes manifests are a foundation, not a complete environment-specific
  release package.
- HTTPS is prepared through reverse proxy/ingress examples, but real certificates
  and production domains must be configured.
- Prometheus metrics are minimal.
- OpenTelemetry and Sentry are configured as environment targets, but not wired
  into application code yet.
- Browser end-to-end tests are not implemented yet.
- The frontend uses TypeScript source modules, but the current local build is a
  lightweight no-dependency transpiler rather than a strict `tsc`/Vite pipeline.

## Next Implementation Order

1. Add CI coverage for the PostgreSQL adapter and migration runner against a
   real PostgreSQL target.
2. Harden refresh sessions with token hashing and expiration enforcement.
3. Add account deletion and full consent revocation flows.
4. Add CRUD APIs for guides.
5. Add CRUD APIs for community posts, comments, reports, crews, and events.
7. Add editable player profile, achievement progress, garage/vehicles, and map
   points.
8. Publish domain events to RabbitMQ and make `sync-worker` consume jobs.
9. Add MinIO-backed upload flow for guide/media assets.
10. Replace the lightweight frontend build with strict TypeScript tooling when
    dependency installation is available.
11. Add Playwright or equivalent browser end-to-end tests.
12. Complete CI/CD scan, image push, and staging/production deployment steps.
13. Add OpenTelemetry spans and Sentry capture.
14. Configure real provider OAuth integrations after official approval.

## External Dependencies

These cannot be honestly completed without external access and approvals:

- PSN OAuth credentials and API access.
- Xbox/Microsoft OAuth credentials and API access.
- Rockstar/Social Club supported integration access.
- Real GTA VI data after release.
- Production domain, TLS certificates, registry, and secret manager.
