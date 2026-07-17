# Database files

- `hostinger-schema.sql` — recommended production schema; no `CREATE DATABASE` or `USE`
- `schema.sql` — optional manual local schema for `startup_muslim_directory_local_v312`
- `seed.sql` — local demo seed containing known demo users
- `full-database.sql` — local all-in-one demo import

## Production recommendation

Create a MySQL database and user in Hostinger hPanel, add those credentials as environment variables, and use either:

1. `DB_AUTO_MIGRATE=true` on the first deployment, or
2. Import `hostinger-schema.sql` into the selected database using phpMyAdmin.

Use `DB_SEED_CONTENT=true` only when you want the sanitized starter directory content inserted into an empty production database.

Do not import `seed.sql` or `full-database.sql` into a public website because they contain known local demo login accounts.
