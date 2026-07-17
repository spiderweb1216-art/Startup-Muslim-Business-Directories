# Local database and newsletter schema fix (v3.1.2)

Version 3.1.2 creates a new local database named:

`startup_muslim_directory_local_v312`

The first-time setup drops and recreates only that configured local database. It then applies the current 18-table schema and inserts the local demonstration data.

The earlier error:

`Unknown column 'name' in 'field list'`

was caused by the newsletter seed/runtime writer including a `name` value while the `newsletter_subscribers` table did not contain that column. The schema now includes the column, and the database setup also contains a compatibility migration for an existing production table.
