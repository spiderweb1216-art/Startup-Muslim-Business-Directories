# MySQL database coverage and safe commands

The application includes 18 tables:

1. `schema_migrations`
2. `users`
3. `categories`
4. `startups`
5. `founders`
6. `investors`
7. `funding_rounds`
8. `pitches`
9. `jobs`
10. `opportunities`
11. `claim_requests`
12. `contact_messages`
13. `newsletter_subscribers`
14. `pages`
15. `media`
16. `site_settings`
17. `activity_logs`
18. `saved_items`

Admin editors, public submissions, registration, login, profile updates, claims, contact messages, newsletter subscriptions, and authenticated saved items use the Express API and MySQL.

## Safe hosted schema

`database/hostinger-schema.sql` creates the tables in the database already selected in Hostinger/phpMyAdmin. It does not create or select a database.

Automatic alternative:

```env
DB_AUTO_MIGRATE=true
DB_CREATE_DATABASE=false
```

The startup process applies the same non-destructive schema automatically.

## Local demo reset

```powershell
npm run db:setup:local
```

This is destructive and restores local demo accounts and data. It is blocked when `NODE_ENV=production` unless the dangerous `ALLOW_DEMO_SEED=true` override is explicitly set.

## Production public content seed

```powershell
npm run db:seed:content
```

This inserts sanitized categories, startups, founders, investors, rounds, jobs, opportunities, pages, media, and site settings only when the main content tables are empty. It does not create demo accounts or private form data.

## Backup

Use **Admin → Backup & data → Download JSON** for an application-level backup. Also use Hostinger/phpMyAdmin export for a full MySQL backup before major imports or schema changes.
