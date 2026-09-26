# Crescent Startup Lab v3 — React + Node + MySQL

A complete local full-stack startup ecosystem directory and CMS.

## Architecture

- `src/` — React website and dashboards
- `server/` — Express API, authentication, database services, routes, and seed scripts
- `database/schema.sql` — complete MySQL schema
- `server/seed/seed-data.json` — populated initial database records
- `.env` — local MySQL/API settings

## Main commands

```powershell
npm run db:setup   # create/reset/populate MySQL
npm run db:check   # verify database connection
npm start          # start API + website
npm run dev        # start API watcher + website
```

Read `START-HERE.md` for the exact Windows/XAMPP process.
