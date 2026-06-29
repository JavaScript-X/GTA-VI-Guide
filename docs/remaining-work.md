# Remaining Work

This document tracks what is still not fully functional and what must be built
next. It separates real production functionality from foundations, mocks, and
prepared integration boundaries.

## Not Fully Functional Yet

- Services now use a repository boundary, but the active runtime adapter is still
  memory fallback until the PostgreSQL driver is added.
- Authentication works as a local foundation through repositories, but users and
  refresh sessions are not persisted in PostgreSQL yet.
- Refresh tokens are stored in memory and are lost on service restart.
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
- A migration runner exists, but it requires `psql` locally and does not yet
  track applied migrations before executing files.
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

1. Add a real PostgreSQL adapter under the repository boundary.
2. Improve the migration runner to check `platform.schema_migrations` before
   applying each migration.
3. Persist users, refresh sessions, linked accounts, consent events, and audit
   logs.
4. Replace guide, achievement, profile, and community mock reads with
   repositories.
5. Add CRUD APIs for guides.
6. Add CRUD APIs for community posts, comments, reports, crews, and events.
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
