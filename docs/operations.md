# Operations

## Local Development

Run everything directly with Node:

```powershell
npm run dev
```

Important URLs:

- Web: <http://localhost:5173>
- Gateway: <http://localhost:8080>
- Dashboard API: <http://localhost:8080/api/dashboard>

## Docker

Run all services:

```powershell
docker compose up --build
```

This starts PostgreSQL, the API gateway, all domain services, and the web app.

Check service health:

```powershell
docker compose ps
```

## Observability Baseline

The current foundation includes:

- Per-service `/health` endpoints.
- Kubernetes-friendly `/livez` and `/readyz` endpoints.
- `x-request-id` on all JSON service responses.
- Structured JSON logs.
- Central gateway aggregation.
- Docker healthchecks.
- Gateway rate-limit headers.

Next production additions:

- OpenTelemetry traces.
- Metrics endpoint per service.
- Error tracking.
- Audit logs for account linking and moderation.

## Scalability Path

- Replace in-memory data with one database per service.
- Add Redis cache and rate limiting at the gateway.
- Add event bus for profile sync, achievement updates, guide publication, and
  moderation events.
- Split frontend hosting behind CDN.
- Deploy services independently through Kubernetes or managed container apps.

## Kubernetes

Example manifests live in `infra/k8s`. Before applying them:

- Replace example domains.
- Replace image names.
- Create real secrets from your secret manager.
- Point `DATABASE_URL` at production PostgreSQL.
