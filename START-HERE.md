# Crescent Startup Lab — MySQL full-stack setup

This version is no longer browser-local. It contains:

- React frontend
- Node.js/Express API
- MySQL database
- JWT login sessions
- bcrypt password hashing
- Full admin CRUD
- Database-backed public forms
- Database-backed saved items
- Populated seed records

## Seeded content

The initial database includes:

- 20 startups
- 12 founders
- 10 investors
- 10 funding rounds
- 8 pitches
- 8 jobs
- 10 opportunities
- 12 categories
- 5 claim requests
- 4 user accounts
- Contact messages, subscribers, pages, media, settings, activity records, and saved items

The directories are therefore not empty after database setup.

## Requirements

Use Node.js 20 LTS and MySQL 8+. XAMPP MySQL/MariaDB can also be used for local development.

## XAMPP setup

1. Open XAMPP Control Panel.
2. Start **MySQL**. Apache/PHP are not required for this project.
3. Open this project folder in VS Code.
4. Open **Terminal → New Terminal**.
5. Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\first-time-setup.ps1
```

The script installs dependencies, creates `crescent_startup_lab`, creates every table, inserts all seed records, and starts the website and API.

## Manual commands

```powershell
npm install --include=dev --legacy-peer-deps
npm run db:setup
npm start
```

Website: `http://localhost:3000`

API health check: `http://localhost:5000/api/health`

## Login accounts

Admin:

```text
admin@startupmuslim.com
Admin123!
```

Founder:

```text
founder@startupmuslim.com
Founder123!
```

Investor:

```text
investor@example.com
Investor123!
```

## MySQL connection

Local defaults are stored in `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=crescent_startup_lab
```

Change `DB_PASSWORD` when your MySQL root account has a password.

## Normal daily start

After first-time setup:

```powershell
.\start-local.ps1
```

or:

```powershell
npm start
```

Do not run `npm run db:setup` every day because it resets the database to the original populated seed data.
