# Backend modules

Each domain module owns its routes, controller, service, repository, tests, and README.

Recommended layout:
```text
<module>/
  <module>.routes.js
  <module>.controller.js
  <module>.service.js
  <module>.repository.js
  <module>.schema.js
  <module>.test.js
  README.md
```

Small modules may omit unnecessary files, but preserve the separation of concerns:
- routes: HTTP paths and middleware
- controller: translate HTTP request/response
- service: business rules and orchestration
- repository: SQL/database operations
- schema: Zod input validation

Modules must not query another module's tables directly. If cross-domain data is needed, call that module's service or use an explicitly agreed shared query.
