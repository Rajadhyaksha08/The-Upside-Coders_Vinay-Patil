# Search and matching module — planned

## Responsibility
Find eligible workers for a service request and rank them.

## Initial filters
1. Required skill/service.
2. Current availability.
3. Distance starting at 5 km, expanding progressively to 15 km if necessary.
4. Indicative price compatibility.
5. Explainable reliability/work-history signals.

## Rules
- Do not expose phone numbers in search results.
- Use coordinates for real distance; PIN-code equality is not a distance calculation.
- Keep ranking deterministic and unit-tested.
- Return only fields approved in the API contract.
- Avoid penalizing new workers merely for lacking history.
