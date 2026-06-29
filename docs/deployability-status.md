# Deployability Status

## Priority 1

| Item | Status | Location |
| --- | --- | --- |
| PostgreSQL per service domains | Done as schemas | `infra/database/migrations`, `infra/database/init` |
| Versioned migrations | Done | `infra/database/migrations/V*.sql`, `npm run db:migration-check` |
| Env per environment | Done | `config/env/dev.env`, `config/env/staging.env.example`, `config/env/prod.env.example` |
| Secrets strategy | Done as examples | `infra/secrets`, `infra/k8s/secret.example.yaml` |
| Auth sessions/JWT/refresh/logout | Done as service foundation | `packages/service-kit/src/auth.mjs`, `identity-service` |
| HTTPS behind proxy/ingress | Done as infra config | `infra/nginx`, `infra/k8s/ingress.example.yaml` |
| Strict CORS | Done | `ALLOWED_ORIGINS`, `packages/service-kit/src/http.mjs` |
| API rate limiting | Done | `api-gateway`, `rate-limit.mjs` |
| Structured JSON logs | Done | `logger.mjs` |
| `livez`/`readyz` | Done | all domain services |
| CI/CD | Done as GitHub Actions foundation | `.github/workflows/ci.yml` |

## Priority 2

| Item | Status | Location |
| --- | --- | --- |
| Non-root Docker image | Done | `infra/docker/node-service.Dockerfile` |
| Registry publishing | Done for GHCR | `.github/workflows/ci.yml` |
| Staging environment | Done as config target | `config/env/staging.env.example`, CI environment |
| Reverse proxy | Done | `infra/nginx/nginx.conf`, `reverse-proxy` Compose service |
| Monitoring | Done baseline | `infra/observability/prometheus.yml`, `/metrics` |
| Tracing | Prepared | `infra/observability/otel-collector.yml`, `OTEL_EXPORTER_OTLP_ENDPOINT` |
| Error tracking | Prepared | `SENTRY_DSN` envs |
| Backups/restore | Done scripts | `scripts/backup-postgres.ps1`, `scripts/restore-postgres.ps1` |
| Rollback docs | Done | `docs/runbook.md`, `docs/deployment-checklist.md` |
| Seed/import data | Done as SQL seed | `V003__community_sync_seed.sql` |

## Priority 3

| Item | Status | Location |
| --- | --- | --- |
| Kubernetes manifests | Done | `infra/k8s` |
| Autoscaling | Done baseline | `infra/k8s/hpa.yaml` |
| CDN plan | Documented | `docs/runbook.md`, `CDN_BASE_URL` |
| Object storage | Done local config | MinIO in Compose, object storage envs |
| Event bus | Done local config | RabbitMQ in Compose, `RABBITMQ_URL` |
| Workers | Done foundation | `services/sync-worker` |
| Integration tests | Done baseline | `npm run smoke` |
| E2E web tests | Prepared, not browser-automated | add Playwright when dependencies are allowed |
| Runbook | Done | `docs/runbook.md` |

## GTA VI Specific

| Item | Status | Location |
| --- | --- | --- |
| Persistent domain models | Done as SQL models | `infra/database/migrations` |
| Roles | Done | JWT claims, `/roles`, SQL `roles` column |
| Provider OAuth boundary | Done as safe intent flow | `/link-intents`, consent tables |
| Consent/revocation/deletion | Done foundation | `/consents`, `/consents/revoke`, SQL `consent_events` |
| Moderation/reports/audit | Done foundation | `community_service.moderation_reports`, `identity_service.audit_log` |
| Official vs manual data distinction | Done | `source`, `data_source`, API consent output |

## Still Needs Real Provider Access

PSN, Xbox, and Rockstar sync cannot be completed honestly without official API
approval, OAuth credentials, provider terms, scopes, and production secrets.
The codebase now has the boundary where those adapters should plug in.
