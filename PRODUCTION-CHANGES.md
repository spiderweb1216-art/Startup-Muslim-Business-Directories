# Version 3.1.2 database correction

- Corrected the `newsletter_subscribers` schema by adding its required `name` column.
- Corrected both first-time seed insertion and live newsletter subscription storage.
- Added a schema compatibility check that repairs the missing newsletter column in an existing database.
- Changed local development to a fresh database name: `startup_muslim_directory_local_v312`.
- Local database creation is now performed safely by Node.js before applying the Hostinger-compatible schema.
- Added schema migration marker `3.1.2`.
- Retained all production, Hostinger, build, routing, security, and deployment changes from v3.1.1.
