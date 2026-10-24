# Instructions for IDE coding agents

Read this file and the relevant module `README.md` before editing.

## Required workflow
1. Inspect existing code and nearby tests before changing anything.
2. Preserve current frontend/backend interfaces unless a coordinated change is approved.
3. Identify the module owner and dependencies.
4. Make the smallest coherent change.
5. Validate inputs at the boundary with Zod.
6. Keep HTTP, business logic, and SQL separated.
7. Use parameterized SQL and transactions where appropriate.
8. Add/update tests.
9. Run `npm test` and any relevant checks.
10. Update the relevant module README, `docs/API_CONTRACTS.md`, and `docs/TEAM_STATUS.md`.
11. Report files changed, API/schema changes, tests run, and unresolved assumptions.

## Forbidden shortcuts
- Do not invent endpoints or schema fields without documenting them.
- Do not put secrets in code, docs, logs, or fixtures.
- Do not trust frontend role/user identifiers.
- Do not access another module's tables directly without agreement.
- Do not silently change shared API response shapes.
- Do not claim deployment/provider integration succeeded unless verified.
- Do not add a new dependency without explaining why it is needed.

## Completion report format
- Summary
- Files changed
- API/schema changes
- Dependencies/affected modules
- Tests run and results
- Documentation updated
- Remaining risks / next steps
