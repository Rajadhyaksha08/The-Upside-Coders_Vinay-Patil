# Project — API Contracts

**Status:** Initial backend and database setup milestone reached.
**Current API status:** Initial scaffold; only `GET /api/health` is implemented.
**Base path:** `/api`

---

## 1. Team Members

### 1. Ninad

**Latest contribution:**

* Established the initial backend setup using Node.js and Express.
* Configured the npm scripts for development, database migration, seeding, and testing.
* Set up Vitest and verified that the health endpoint test passes.
* Reached the initial backend and database setup milestone.

feat(backend):  feat(backend): initialize modular Express backend and database scaffold

- Organize backend modules by feature and responsibility 
- Plan routes, controllers, services, repositories, and schemas 
- Introduce centralized environment configuration 
- Prepare shared middleware and utility structure 
- Establish incremental module integration workflow

feat(backend): establish modular server architecture

Fix the application factory and existing automated tests.
Implement secure customer and worker registration and login.
Implement authentication, session management, and authorization.
Implement worker profile creation, retrieval, and updates.
Implement persistent worker availability management.
Connect the customer worker directory to real database records.
Integrate existing frontend login, registration, and dashboard screens.
Add automated API and integration tests.
Update API contracts and technical documentation.
Verify end-to-end functionality and data persistence.

feat(backend): implement Phase 1 database and API foundation


- Added full CRUD for workers (profile + availability) and request lifecycle.
- Implemented auth flow: register, login, session info, logout.
- Added health endpoint (`GET /api/health`).
- Integrated Zod validation (422 for invalid input) and standardized error payload (`error.code`).
- Updated Vitest config (sequential execution, proper DB path) and test suite (45 passing, 13 pending).
- Fixed DB path resolution in test setup and removed premature DB close in health test.
- Updated `API_CONTRACTS.md` under Ninad's section to reflect new endpoints.

feat: implement and test Health, Auth, Workers, and Requests APIs


### 2. Vinay

**Responsibilities:** To be updated as work is assigned.

### 3. Parth

**Responsibilities:** To be updated as work is assigned.

### 4. Mandar

**Responsibilities:** To be updated as work is assigned.

> Team members and their IDE agents must keep this documentation updated when they add, modify, or remove API endpoints or change shared interfaces.

---

## 2. Current Milestone

### Milestone 1 — Basic Backend Initialization

**Status:** Initial setup established.

**Completed:**

* Node.js and Express backend scaffold.
* Modular source directory structure.
* npm development and testing scripts.
* Vitest configuration and initial health endpoint test.
* Initial database migration and seed scripts prepared.

**Verification:**

* `npm run dev` successfully starts the API on port 3000.
* `npm test` passes the initial health endpoint test: **1 test passed**.

**Remaining verification:**

* Confirm database migration and seed commands complete successfully.
* Verify the health endpoint using an HTTP request.

**Next milestone:** Implement the first functional application module while preserving the existing API conventions.

---

## 3. API Conventions

* All API endpoints use the `/api` base path.
* Request and response bodies use JSON unless an endpoint explicitly requires another format.
* All external input must be validated.
* Authenticated endpoints must derive the user's identity from a server-validated session or token, never from an untrusted request body.
* Do not expose private worker or customer information unnecessarily.
* Document authentication, authorization, rate limits, status codes, and idempotency requirements for each endpoint.
* Keep route handlers thin; place business logic in services and database operations in the appropriate data-access layer.
* Reuse shared validation, error-handling, and utility functions instead of duplicating implementations.
* Coordinate changes to shared API contracts with all affected frontend and backend contributors.

### Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

Each implemented endpoint must document its possible error codes and corresponding HTTP status codes.

---

## 4. Implemented Endpoints

### `GET /api/health`

**Purpose:** Check whether the API is responding.

**Authentication:** Not required.

**Request:** No request body required.

**Success response — `200 OK`**

```json
{
  "status": "ok",
  "service": "kaamconnect-api"
}
```

**Errors:** No endpoint-specific error responses currently documented.

**Rate limits:** No endpoint-specific limit documented.

**Idempotency:** Not applicable; this is a read-only health check.

**Test status:** Initial automated test passes.

---

## 5. Planned Endpoints — Not Yet Implemented

The endpoints below are proposals for future development. Their inclusion in this document does not mean they already exist.

| Method  | Endpoint                       | Purpose                                        |
| ------- | ------------------------------ | ---------------------------------------------- |
| `POST`  | `/api/auth/register`           | Register a customer or worker                  |
| `POST`  | `/api/auth/login`              | Authenticate a user                            |
| `GET`   | `/api/workers`                 | Search or list workers                         |
| `GET`   | `/api/workers/me`              | Retrieve the authenticated worker's profile    |
| `PATCH` | `/api/workers/me/availability` | Update the authenticated worker's availability |
| `POST`  | `/api/requests`                | Create a service request                       |
| `POST`  | `/api/requests/:id/confirm`    | Confirm a service request                      |
| `POST`  | `/api/bookings`                | Create a booking                               |
| `GET`   | `/api/bookings/:id`            | Retrieve booking details                       |
| `POST`  | `/api/bookings/:id/cancel`     | Request booking cancellation                   |
| `POST`  | `/api/ivr/webhook`             | Receive IVR provider callbacks                 |

### Implementation Rule

Whenever an endpoint is implemented:

1. Move it from **Planned** to **Implemented**.
2. Document its request and response formats with examples.
3. Document input validation and error responses.
4. Specify authentication and authorization requirements.
5. Document applicable rate limits and idempotency behavior.
6. Add or update automated tests.
7. Update the corresponding module README.
8. Notify teammates if the change affects a shared interface.

---

## 6. Module Ownership and Documentation

Each backend module must maintain its own `README.md`.

| Module           | Documentation location                      |
| ---------------- | ------------------------------------------- |
| Authentication   | `server/src/modules/auth/README.md`         |
| Workers          | `server/src/modules/workers/README.md`      |
| Availability     | `server/src/modules/availability/README.md` |
| Search           | `server/src/modules/search/README.md`       |
| Bookings         | `server/src/modules/bookings/README.md`     |
| IVR              | `server/src/modules/ivr/README.md`          |
| Reviews          | `server/src/modules/reviews/README.md`      |
| Health           | `server/src/modules/health/README.md`       |
| Shared utilities | `server/src/shared/README.md`               |
| Database         | `server/src/db/README.md`                   |
| Configuration    | `server/src/config/README.md`               |

Each README should explain the module's purpose, files, public interfaces, dependencies, validation rules, error handling, tests, and integration instructions.

---

## 7. Rules for Teammates and IDE Agents

Before modifying a module, contributors and their IDE agents must:

* Read this document and the relevant module README.
* Inspect existing implementations before creating new ones.
* Reuse established interfaces and shared utilities.
* Avoid changing another module's contract without coordination.
* Add tests for new behavior and regression tests for bug fixes.
* Update documentation whenever functionality or interfaces change.
* Never document a planned feature as implemented.
* Never claim a feature has been tested unless the relevant tests were actually run.

### API Contract Source of Truth

`docs/API_CONTRACTS.md` records the agreed API interfaces.

The actual source code and automated tests remain the source of truth for current runtime behavior. If documentation and implementation disagree, investigate the difference and update the appropriate artifact.

---

## 8. Next Steps

1. Finish verifying database migration and seed execution.
2. Verify the health endpoint through HTTP.
3. Agree on the worker and service-category data model.
4. Implement the first functional worker API.
5. Add validation and automated tests.
6. Update API contracts and module documentation.
7. Integrate the endpoint with the frontend after the contract is agreed upon.

**Current milestone:** Initial backend setup established; functional application APIs remain under development.
