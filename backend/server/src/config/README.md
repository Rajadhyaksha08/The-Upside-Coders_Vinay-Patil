# Configuration

Environment variables are parsed and validated in `env.js`.

## Rules
- Add new environment variables to both `env.js` and `.env.example`.
- Never add real secrets to `.env.example`.
- Fail fast on invalid configuration.
- Production `DATABASE_PATH` must point to persistent writable storage.
- Do not scatter `process.env` reads throughout business modules.
