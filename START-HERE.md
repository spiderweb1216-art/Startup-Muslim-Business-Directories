# Start here — local Windows setup


> **First-time setup note:** `first-time-setup.ps1` recreates the local database named in `.env`. This is intentional for a clean local demo and prevents old table structures from conflicting. Do not use the local demo reset command against a production database.

## First run

1. Install Node.js 22 LTS.
2. Open XAMPP and start **MySQL**. Apache is not needed.
3. Open PowerShell inside the project folder containing `package.json`.
4. Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\first-time-setup.ps1
```

The first-time script safely creates `.env` from `.env.example`, generates a private local JWT secret, installs the exact packages from `package-lock.json`, resets the local demo database, and starts the website and API.

## Local addresses

```text
Website:     http://localhost:3000
API health:  http://localhost:5000/api/health
```

## Local demo accounts

These are only for the local database created by `db:setup:local`:

```text
Admin:   admin@startupmuslim.com / Admin123!
Founder: founder@startupmuslim.com / Founder123!
Investor: investor@example.com / Investor123!
```

Never deploy these accounts to a real public database.

## Normal daily start

Start MySQL and run:

```powershell
.\start-local.ps1
```

## Repair without deleting database data

```powershell
.\repair-and-start.ps1
```

The repair script reinstalls dependencies and applies missing tables, but does not reseed the database.

## Important command difference

```text
npm run dev   = local API + local React server
npm start     = production Express server serving the build folder
```
