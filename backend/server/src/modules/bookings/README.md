# Bookings module — planned

## Responsibility
Booking state transitions, mutual agreement, cancellation, arrival/completion verification, and disputes.

## Rules
- A connected call is not a confirmed booking.
- Confirm only after the parties agree to the job and price.
- Use explicit allowed state transitions.
- Use SQLite transactions for critical multi-step operations.
- Make webhook processing and confirmation idempotent.
- No-answer/decline should move to the next eligible worker without score penalty.
- Do not automatically penalize a worker for every cancellation; record reason and apply a documented fair policy.
- OTPs must be booking-bound, short-lived, attempt-limited, and never logged.
