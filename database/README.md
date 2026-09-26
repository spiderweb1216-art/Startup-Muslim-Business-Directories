# MySQL database files

- `schema.sql` — database and table structure
- `seed.sql` — populated demo records
- `full-database.sql` — schema and populated records in one importable file

## Recommended automatic setup

Start MySQL, then run:

```powershell
npm run db:setup
```

This uses the connection values in `.env`, creates the database, and inserts all startup, founder, investor, funding, pitch, job, opportunity, user, CMS, and settings data.

## phpMyAdmin alternative

Open phpMyAdmin → **Import** → choose `database/full-database.sql`.

The default database name is `crescent_startup_lab`.
