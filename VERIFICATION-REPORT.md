# Verification report — v3.1.0

Completed checks:

- Clean `npm ci --include=dev --legacy-peer-deps` installation succeeded on Node.js 22.
- `CI=true npm run build` compiled successfully with no React/ESLint build errors.
- Production source maps are disabled and no `.map` files were generated.
- Production assets use root-safe `/static/...` paths for direct SPA routes.
- Express returned the React application for `/`, `/admin`, and nested startup routes.
- Unknown `/api/*` routes returned JSON 404 responses instead of the React page.
- Production security headers and content-security policy were present.
- Authentication and public-form rate limits are enabled.
- The production bundle did not contain the local demo passwords.
- All server JavaScript files passed `node --check` syntax validation.
- `database/hostinger-schema.sql` contains 18 table definitions and no `CREATE DATABASE` or `USE` command.
- `.env`, `node_modules`, and `build` are excluded from the delivery archive.

Not performed in the build container:

- A live Hostinger deployment.
- A live Hostinger MySQL connection using your future hPanel credentials.
- End-to-end browser tests against your local XAMPP database.

Your current local database was already confirmed working in your Windows environment. After deployment, use `/api/health` and the checklist in `HOSTINGER-DEPLOYMENT.md` to validate the real hosting environment.

- Newsletter table/write-column consistency: corrected and statically verified.
- Fresh local database name: `startup_muslim_directory_local_v312`.

## v3.1.2 verification performed

- `npm ci --include=dev --legacy-peer-deps`: passed.
- `npm run db:verify-schema`: passed; 18 tables and every application write column matched.
- `npm run build`: passed with a production bundle.
- Server and plugin JavaScript syntax checks: passed.
- Local first-time setup now uses `startup_muslim_directory_local_v312` rather than the earlier database name.
