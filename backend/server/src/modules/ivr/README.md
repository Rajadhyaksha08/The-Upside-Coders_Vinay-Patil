# IVR module — planned

## Responsibility
Handle telephony-provider webhooks and coordinate IVR/call workflows.

## Rules
- Verify provider webhook authenticity before processing events.
- Treat incoming caller ID as a lookup hint, not strong authentication by itself.
- Use idempotency/deduplication for provider retries.
- Keep provider-specific payload handling in an adapter; call domain services for business rules.
- Do not claim private/bridged calling works until the provider feature, region, and account are verified.
- Do not log full phone numbers or keypad secrets unnecessarily.
- Store call attempt outcomes such as `NO_ANSWER`, `DECLINED`, `ANSWERED`, `FAILED`.
