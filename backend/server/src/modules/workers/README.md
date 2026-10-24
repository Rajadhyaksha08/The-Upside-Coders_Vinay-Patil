# Workers module — planned

## Responsibility
Worker profile, service skills, service-area metadata, and worker-specific profile operations.

## Rules
- Profile edits require authentication and ownership checks.
- Keep exact residential addresses private; matching should use service-area/location data.
- Do not expose phone numbers in public search results.
- Validate service names and profile fields.
- Do not implement availability logic here; call the availability module.
- Update API contracts and tests with every interface change.
