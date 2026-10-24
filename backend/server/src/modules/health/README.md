# Health module

## Responsibility
Expose a lightweight liveness/readiness endpoint.

## Interface
- `GET /api/health` → `{ "status": "ok", "service": "kaamconnect-api" }`
- Returns 500 through the shared error handler if SQLite cannot be queried.

## Rules
- Do not put business logic here.
- Keep this endpoint free of personal or secret data.
- If adding separate liveness/readiness checks, document the distinction and deployment use.
