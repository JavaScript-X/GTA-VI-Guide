# Runbook

## Start Local

```powershell
docker compose up --build
```

If `npm run dev` is already running locally, stop it before starting Docker
Compose because it uses the same public ports for the web app and gateway. The
Compose file only publishes the web app and gateway by default; internal
microservices stay on the Docker network.

To avoid a public port conflict without stopping another app, override the host
ports in `.env`:

```powershell
WEB_HOST_PORT=5174
API_GATEWAY_HOST_PORT=18080
docker compose up --build
```

Main URLs:

- App through web service: <http://localhost:5173>
- App through reverse proxy: <http://localhost>
- API: <http://localhost:8080/api/dashboard>
- Prometheus: <http://localhost:9090>
- RabbitMQ console: <http://localhost:15672>
- MinIO console: <http://localhost:9001>

## Verify

```powershell
npm test
npm run check
npm run db:migration-check
npm run smoke
docker compose config
```

## Deploy Staging

1. Build image from `main`.
2. Push to registry.
3. Create secrets from `infra/secrets`.
4. Apply migrations.
5. Deploy `infra/k8s` manifests with staging values.
6. Run smoke checks against staging.

## Monitor

- Watch JSON logs for `level=error`.
- Check `/readyz` on the gateway.
- Check Prometheus targets.
- Check Sentry if `SENTRY_DSN` is configured.
- Check RabbitMQ queue depth for sync jobs.

## Backup

```powershell
.\scripts\backup-postgres.ps1
```

Store backups outside the deployment machine, ideally in object storage with
retention and encryption.

## Restore

```powershell
.\scripts\restore-postgres.ps1 -BackupFile .\backups\gta_guide-YYYYMMDD-HHMMSS.sql
```

Restore first in staging, verify integrity, then restore production only after a
freeze window is confirmed.

## Rollback

1. Roll back the app image tag to the previous known-good digest.
2. Do not roll back database migrations unless a restore plan is approved.
3. Keep one release of backwards-compatible migrations.
4. Confirm `/readyz`, `/api/dashboard`, login, and guide listing.

## CDN And Assets

Use `CDN_BASE_URL` for public immutable assets. User uploads should go to object
storage, then be served through a CDN with signed upload policies.

## Provider Sync

Only enable PSN, Xbox, or Rockstar sync after official OAuth/client approval.
Until then, keep accounts in `manual` or `official-oauth-required` state.
