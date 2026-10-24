# Authentication module — planned

## Responsibility
Registration, login, logout, current-session lookup, phone verification, and credential recovery.

## Security requirements
- Unique verified phone number at the account layer.
- Authentication must be independent from role authorization.
- Never accept `userId`, `role`, or `workerId` from the request body as proof of identity.
- Store password/PIN hashes only; never log credentials or OTPs.
- Rate-limit login, verification, and recovery.
- Use secure, HTTP-only cookies and a persistent session store if using cookie sessions.
- Configure CSRF protection when cookie-based authentication is used cross-site.
- Return generic errors where detailed responses would enable account enumeration.

No endpoints are implemented yet. Update `docs/API_CONTRACTS.md` before adding them.
