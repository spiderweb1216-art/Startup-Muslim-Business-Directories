# Database coverage

The following MySQL tables are included:

1. `users`
2. `categories`
3. `startups`
4. `founders`
5. `investors`
6. `funding_rounds`
7. `pitches`
8. `jobs`
9. `opportunities`
10. `claim_requests`
11. `contact_messages`
12. `newsletter_subscribers`
13. `pages`
14. `media`
15. `site_settings`
16. `activity_logs`
17. `saved_items`
18. `schema_migrations`

Every CMS editor in the admin dashboard writes to these tables through the API. Public startup and pitch submissions, contact messages, newsletter subscriptions, registration, profile updates, claim requests, and authenticated saved items are also database-backed.

## Reset and reseed

```powershell
npm run db:setup
```

This is destructive: it clears the CMS tables and restores the populated seed dataset.

## Backup

Use **Admin → Backup & data → Download JSON**. This is an application-level backup. For a complete server-level MySQL backup, use MySQL Workbench, phpMyAdmin export, or `mysqldump`.
