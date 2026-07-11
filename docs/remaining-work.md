# Remaining Work

This document tracks what is still not fully functional and what must be built
next. It separates real production functionality from foundations, mocks, and
prepared integration boundaries.

## Not Fully Functional Yet

- Services now use a repository boundary with an optional PostgreSQL runtime
  adapter through `pg`. Local development still falls back to memory when
  `DATABASE_URL` or the driver are unavailable.
- Authentication can persist users, refresh sessions, consent events, and audit
  logs through the PostgreSQL adapter. Refresh tokens are hashed, expiration is
  enforced, logout revokes sessions, and account deletion revokes sessions and
  linked accounts. Secure cookies, CSRF protection, email verification, and reset
  password still need production work.
- PSN, Xbox, and Rockstar accounts are not truly connected. Only the safe OAuth
  boundary and consent model exist.
- Player tracking, achievements, garage vehicles, saved map points, crews, and
  events are visible and partly writable in the frontend. Crews/events have
  create/update/delete flows, garage vehicles and map points have manual upsert,
  while full geospatial map layers remain a planning view.
- The frontend has pages for the full platform and first write workflows for
  guides, community posts, reports, achievement progress, completion, and
  account deletion. Comments, reactions, crews and events now have write flows.
  Backend search is connected to the frontend. A first moderator queue exists
  for reports, post hiding, and audit log review. Guide image upload now has a
  first UI flow; deeper moderation policy flows still need full UI flows.
- The sync worker currently logs readiness only; it does not consume RabbitMQ
  messages yet.
- RabbitMQ is configured, but services do not publish/consume events yet. Media
  upload now stores files locally in development and persists metadata through
  memory/PostgreSQL repositories; production still needs signed MinIO/S3/R2
  uploads, malware scanning, CDN, and lifecycle policies.
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
2. Add secure cookie session transport and CSRF protection for browser sessions.
3. Add email verification and reset password.
4. Add data export and configurable anonymization/deletion policy.
5. Add advanced editorial workflows for guides.
6. Add advanced moderation queues and role-gated community actions.
7. Add editable player profile details and full geospatial map layers.
8. Publish domain events to RabbitMQ and make `sync-worker` consume jobs.
9. Replace local guide/media upload storage with MinIO/S3/R2 signed uploads.
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
