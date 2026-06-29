# Deployment Checklist

## Required Before Production

- Replace every example secret in `.env.example` and `infra/k8s/secret.example.yaml`.
- Configure `ALLOWED_ORIGINS` with the exact production frontend domain.
- Use a managed PostgreSQL instance or a hardened in-cluster database.
- Run `infra/database/init/001-foundation.sql` before first production boot.
- Publish the Docker image to a registry and replace
  `ghcr.io/your-org/gta-vi-guide-platform:latest`.
- Enable HTTPS through the ingress, CDN, or reverse proxy.
- Configure backups and restore drills for PostgreSQL.
- Add real auth/session persistence before opening user accounts.
- Add provider-approved OAuth flows before enabling PSN, Xbox, or Rockstar sync.

## Release Flow

1. Merge to `main`.
2. CI runs syntax checks, tests, smoke test, Compose validation, and image build.
3. Build and tag an immutable image.
4. Push to the registry.
5. Apply database migrations.
6. Deploy to staging.
7. Run smoke checks against staging.
8. Promote the same image to production.
9. Watch logs, metrics, and error reporting.

## Rollback

- Roll back to the previous image tag.
- Do not roll back database migrations until a restore plan is confirmed.
- Keep migrations backward-compatible for at least one release.

## Production Environment Variables

- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-domain`
- `DATABASE_URL=postgres://...`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- Service URLs for gateway-to-service traffic.
