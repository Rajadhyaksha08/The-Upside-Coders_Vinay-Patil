# Availability module — planned

## Responsibility
Store and report worker availability: `AVAILABLE`, `UNAVAILABLE`, or `UNCONFIRMED`.

## Rules
- Availability status is not automatically reset at midnight unless a separately agreed expiry policy requires it.
- Report the currently stored status through the worker IVR.
- A worker's availability validity/expiry must be explicit and documented.
- Recheck availability before making a call offer.
- A missed call or declined offer must not automatically lower KaamScore.
- All changes must be authenticated, authorized, validated, and audited where appropriate.
