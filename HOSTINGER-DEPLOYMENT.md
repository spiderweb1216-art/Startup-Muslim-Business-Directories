# Hostinger deployment — GitHub to a Node.js Web App

This project is configured so one Express process serves both the React website and `/api`.

## 1. Before GitHub

The repository must not contain:

```text
.env
node_modules/
build/
```

They are already covered by `.gitignore`.

Run the production build check locally:

```powershell
npm ci --include=dev --legacy-peer-deps
$env:CI="true"
npm run build
Remove-Item Env:CI
```

## 2. Push to GitHub

From the project root:

```powershell
git init
git add .
git commit -m "Production-ready Startup Muslim directory"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Before `git add .`, confirm `.env` is not listed:

```powershell
git status
```

## 3. Create the Hostinger MySQL database

In hPanel, create a MySQL database and database user. Keep the exact generated database name, username, and password. The database must exist before the Node application starts.

You do not need to import demo SQL. The app can safely create its tables through `DB_AUTO_MIGRATE=true`.

## 4. Deploy the Node.js Web App

In hPanel:

1. Go to **Websites → Add Website → Deploy Web App / Node.js Web App**.
2. Connect GitHub and select this repository and the `main` branch.
3. Select **Node.js 22**.
4. Use build command:

```text
npm run build
```

5. Use start command:

```text
npm start
```

The code reads Hostinger's `PORT` when provided and otherwise uses `API_PORT=3000`. If hPanel asks for an entry file, use `server/index.js`; if it asks for the frontend output directory, use `build`.

## 5. Add environment variables

Copy `.env.production.example` into Hostinger's environment-variable form, replacing every example value.

Required first-deployment values:

```env
NODE_ENV=production
API_PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=YOUR_DATABASE_NAME
DB_CONNECTION_LIMIT=10
CLIENT_URL=https://YOUR-SUBDOMAIN.YOUR-DOMAIN.COM
SUPPORT_EMAIL=hello@YOUR-DOMAIN.COM
TRUST_PROXY=true
JSON_LIMIT=20mb
JWT_SECRET=YOUR_UNIQUE_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
JWT_EXPIRES_IN=7d
REACT_APP_API_URL=/api
DB_AUTO_MIGRATE=true
DB_CREATE_DATABASE=false
DB_SEED_CONTENT=true
ADMIN_NAME=YOUR_NAME
ADMIN_EMAIL=YOUR_PRIVATE_ADMIN_EMAIL
ADMIN_PASSWORD=YOUR_UNIQUE_ADMIN_PASSWORD_AT_LEAST_12_CHARACTERS
ADMIN_COUNTRY=Pakistan
ADMIN_FORCE_UPDATE=false
ALLOW_DEMO_SEED=false
```

Generate a JWT secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 6. First deployment behavior

On first startup the server will:

1. Connect to the Hostinger database.
2. Create any missing tables without deleting existing records.
3. Insert sanitized public starter content only when the content tables are empty.
4. Create the administrator only when `ADMIN_EMAIL` does not already exist.
5. Start Express on Hostinger's assigned port.
6. Serve the React build and all direct browser routes.

## 7. Immediately after successful login

After confirming the administrator account works:

1. Remove `ADMIN_PASSWORD` from Hostinger environment variables.
2. Set `DB_SEED_CONTENT=false`.
3. Keep `DB_AUTO_MIGRATE=true` for non-destructive table updates, or set it to `false` after the first deployment if you prefer manual schema control.
4. Redeploy.

Never enable:

```env
ALLOW_DEMO_SEED=true
```

on a real production database.

## 8. Test after deployment

Open:

```text
https://YOUR-SUBDOMAIN.YOUR-DOMAIN.COM/api/health
```

Then test:

- Home page and direct internal routes
- Admin login
- Create/edit/delete CMS records
- Registration and profile updates
- Startup and pitch submissions
- Claim requests
- Contact form
- Newsletter form
- Saved items
- Mobile layout

## 9. GitHub updates

Future pushes to the connected branch can trigger Hostinger redeployment. Review deployment and runtime logs whenever a build or start fails.
