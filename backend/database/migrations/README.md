# Database migrations

Use ordered, immutable migration files, e.g. `001_create_users.sql`.

For each schema change:
1. Add a migration.
2. Update the current baseline `database/schema.sql`.
3. Test against a fresh database.
4. Test migration against a copy of an existing database when applicable.
5. Document compatibility and rollback/recovery notes.
6. Never edit a migration already applied by teammates without coordinating; add a new migration instead.

The starter migration runner currently applies the baseline schema directly for the initial scaffold. Before multiple schema revisions, replace it with a migration ledger that records applied migration versions.
