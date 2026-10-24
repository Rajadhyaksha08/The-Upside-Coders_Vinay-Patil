# Database layer

`database.js` creates the SQLite connection and applies common pragmas. Migrations and seed scripts are explicit commands.

## Rules
- Keep SQL schema changes in `database/migrations/` and update `database/schema.sql` as the current baseline.
- Enable foreign keys.
- Use prepared statements for values; never concatenate user input into SQL.
- Use transactions for multi-step state changes.
- Do not commit `.sqlite`, `.db`, or real user data.
- Do not create a second SQLite connection per request.
- Back up the persistent database before production migrations.
- SQLite is intended here for a single backend instance with persistent disk; do not scale by launching independent replicas with separate database files.
