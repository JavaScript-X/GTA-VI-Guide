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

Check service health:

```powershell
docker compose ps
```

## Observability Baseline

The current foundation includes:

- Per-service `/health` endpoints.
- `x-request-id` on all JSON service responses.
- Central gateway aggregation.
- Docker healthchecks.

Next production additions:

- Structured JSON logs.
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
