# KaamConnect backend starter

This is an **additive backend scaffold** for the existing frontend repository. It does not replace or assume anything about your current frontend.

## Stack
- Node.js + Express (ES modules)
- SQLite + `better-sqlite3`
- Zod request validation
- Vitest + Supertest
- Modular monolith: routes → controllers → services → repositories

## Requirements
Use a current Node.js LTS release and npm.

## Setup
```bash
cd server
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Health check: `GET http://localhost:3000/api/health`

## Database persistence
`DATABASE_PATH` must point to a persistent writable directory in deployment. Do not deploy this SQLite file to an ephemeral serverless filesystem or run multiple independent app instances with separate local database files.

## Rules for contributors and IDE agents
1. Read `docs/AI_AGENT_RULES.md` before editing.
2. Read the nearest folder's `README.md` before changing that module.
3. Keep routes thin. Business rules belong in services; SQL belongs in repositories.
4. Validate all external input with Zod.
5. Never trust a role/user ID supplied by the client as proof of identity.
6. Never commit `.env`, database files, real personal data, OTPs, PINs, or secrets.
7. Update the relevant module README and `docs/API_CONTRACTS.md` whenever behavior or interfaces change.
8. Add/update tests for behavior changes.
9. Do not claim real IVR/SMS integration: provider adapter is intentionally a stub.

## Current status
Scaffold only. Authentication, authorization, business endpoints, request-code lifecycle, bookings, and telephony are not implemented yet.
