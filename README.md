# Startup Muslim Directory v3.1

A full-stack directory and CMS built with React, Express, JWT authentication, and MySQL.

## Production architecture

- `src/` — React frontend
- `server/` — Express API, authentication, CMS routes, and MySQL services
- `database/hostinger-schema.sql` — hosted MySQL table schema without `CREATE DATABASE`
- `server/seed/seed-data.json` — local demo dataset
- `.env.example` — local configuration template
- `.env.production.example` — Hostinger environment-variable template

In production, Express serves both the API and the compiled React application from one domain. React uses `/api`, Express uses Hostinger's injected `PORT`, and direct React routes are returned through the SPA fallback.

## Local setup

Requirements:

- Node.js 22 LTS
- npm 10+
- MySQL 8+ or XAMPP MySQL/MariaDB

Start MySQL, open PowerShell in this folder, and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\first-time-setup.ps1
```

The script creates a private local `.env`, generates a JWT secret, installs dependencies, creates the local database, inserts demo content, and starts:

- Website: `http://localhost:3000`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

For later local starts:

```powershell
.\start-local.ps1
```

## Command reference

```text
npm run dev               Start local API watcher + React development server
npm run build             Create the production React build
npm start                 Start the production Express server
npm run db:check          Verify the configured database
npm run db:schema         Apply hosted-safe tables without deleting data
npm run db:setup:local    Create/reset/populate the local demo database
npm run db:seed:content   Insert sanitized public content only when content tables are empty
npm run db:create-admin   Create the production administrator from ADMIN_* variables
```

`npm start` is intentionally production-only. Use `npm run dev` or the Windows scripts locally.

## Security rules

- `.env` and all private environment variants are ignored by Git.
- Production refuses weak or missing JWT secrets.
- Production requires explicit MySQL credentials.
- Demo database reset is blocked in production unless `ALLOW_DEMO_SEED=true` is deliberately enabled.
- The production content seed does not create demo users, saved items, contact messages, subscribers, claims, or known passwords.
- The first administrator is created from private Hostinger environment variables.
- Helmet security headers, a production content-security policy, same-origin CORS handling, login/form rate limits, and graceful shutdown are enabled.

Read `HOSTINGER-DEPLOYMENT.md` before pushing the repository live.
