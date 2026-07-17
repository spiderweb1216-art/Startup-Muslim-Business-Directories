const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { boolEnv, isProduction, listEnv } = require('./config/env');
const { testConnection, database, closePool } = require('./config/db');
const { applySchema, seedProductionContent } = require('./scripts/setupDatabase');
const { ensureBootstrapAdmin } = require('./scripts/createAdmin');
const { reconcileApprovedClaims } = require('./services/recordService');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const publicRoutes = require('./routes/public');
const savedRoutes = require('./routes/saved');
const adminRoutes = require('./routes/admin');

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || (isProduction ? 3000 : 5000));
const host = process.env.HOST || '0.0.0.0';
const configuredOrigins = listEnv('CLIENT_URL');
const buildPath = path.resolve(__dirname, '../build');
const indexPath = path.join(buildPath, 'index.html');
const hasFrontendBuild = fs.existsSync(indexPath);

// Hostinger requires app.listen() to be called almost immediately after the
// entry file is loaded. Never block listen() behind database setup or a
// require.main === module guard.
const startupState = {
  database: 'initializing',
  error: null,
  startedAt: new Date().toISOString(),
};

if (isProduction && !hasFrontendBuild) {
  console.error('Production React build is missing. Confirm the Hostinger build command is: npm run build');
}

app.disable('x-powered-by');
app.set('trust proxy', boolEnv('TRUST_PROXY', isProduction) ? 1 : false);

const connectSources = ["'self'", ...configuredOrigins];
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      connectSrc: connectSources,
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
}));

function requestHost(req) {
  const forwarded = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  return forwarded || req.get('host') || '';
}

function isAllowedOrigin(req, origin) {
  if (!origin) return true;
  if (configuredOrigins.includes(origin.replace(/\/$/, ''))) return true;
  try {
    return new URL(origin).host === requestHost(req);
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(req, origin)) return callback(null, true);
      const error = new Error('Origin not allowed by CORS.');
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  })(req, res, next);
});

app.use(express.json({ limit: process.env.JSON_LIMIT || '20mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '20mb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.get('/api/health', async (_req, res) => {
  if (startupState.database !== 'ready') {
    return res.status(503).json({
      status: startupState.database,
      database,
      environment: process.env.NODE_ENV || 'development',
      message: startupState.error || 'Database initialization is still in progress.',
      serverTime: new Date().toISOString(),
    });
  }

  try {
    await testConnection();
    return res.json({
      status: 'ok',
      database,
      environment: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    startupState.database = 'error';
    startupState.error = error.message;
    return res.status(503).json({
      status: 'error',
      database,
      environment: process.env.NODE_ENV || 'development',
      message: error.message,
      serverTime: new Date().toISOString(),
    });
  }
});

// Keep database-backed API requests from failing unpredictably while the
// asynchronous production bootstrap is still running.
app.use('/api', (req, res, next) => {
  if (startupState.database === 'ready') return next();
  return res.status(503).json({
    message: startupState.error || 'The database is still initializing. Please retry shortly.',
    status: startupState.database,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api', publicRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

if (hasFrontendBuild) {
  app.use(express.static(buildPath, {
    index: false,
    maxAge: isProduction ? '1d' : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
      if (/\.[a-f0-9]{8,}\.(js|css)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexPath);
  });
}

app.use((req, res) => {
  res.status(404).json({
    message: hasFrontendBuild
      ? `Route not found: ${req.method} ${req.originalUrl}`
      : 'The React production build is missing. Run npm run build before starting the application.',
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with the same unique value already exists.' });
  }
  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({
      message: 'The MySQL database is not initialized. Apply database/hostinger-schema.sql or enable DB_AUTO_MIGRATE.',
    });
  }
  return res.status(error.status || 500).json({ message: error.message || 'An unexpected server error occurred.' });
});

async function prepareDatabase() {
  if (boolEnv('DB_AUTO_MIGRATE', false)) {
    await applySchema({ createDatabase: boolEnv('DB_CREATE_DATABASE', false) });
    console.log(`Database schema is up to date: ${database}`);
  }

  await testConnection();

  if (boolEnv('DB_SEED_CONTENT', false)) {
    const result = await seedProductionContent({ onlyIfEmpty: true });
    console.log(
      result.skipped
        ? 'Production content seed skipped; content already exists.'
        : `Inserted ${result.inserted} production content records.`
    );
  }

  const adminResult = await ensureBootstrapAdmin({ optional: true });
  if (adminResult.created) console.log(`Bootstrap administrator created: ${adminResult.user.email}`);
  else if (adminResult.updated) console.log(`Bootstrap administrator updated: ${adminResult.user.email}`);

  const repaired = await reconcileApprovedClaims();
  if (repaired) console.log(`Repaired ownership for ${repaired} approved claim(s).`);
}

// IMPORTANT: This top-level listen call is required by Hostinger managed
// Node.js hosting. Do not wrap it in `if (require.main === module)` and do not
// wait for MySQL before calling it.
const server = app.listen(port, host, () => {
  const publicUrl = configuredOrigins[0] || `http://localhost:${port}`;
  console.log(`Crescent Startup Lab listening on ${host}:${port}`);
  console.log(`Public URL: ${publicUrl}`);
  console.log(`API health: ${publicUrl.replace(/\/$/, '')}/api/health`);
});

server.on('error', (error) => {
  console.error(`HTTP server error: ${error.message}`);
});

// Initialize MySQL after the HTTP listener is active so Hostinger's startup
// watchdog can detect the application within its three-second window.
setImmediate(() => {
  prepareDatabase()
    .then(() => {
      startupState.database = 'ready';
      startupState.error = null;
      console.log(`Database initialization completed: ${database}`);
    })
    .catch((error) => {
      startupState.database = 'error';
      startupState.error = error.message;
      console.error(`Database initialization failed: ${error.message}`);
      console.error('The HTTP server remains online so /api/health can report the configuration error.');
    });
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  await new Promise((resolve) => server.close(resolve));
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM').catch((error) => {
  console.error(error);
  process.exit(1);
}));
process.on('SIGINT', () => shutdown('SIGINT').catch((error) => {
  console.error(error);
  process.exit(1);
}));

module.exports = { app, server, prepareDatabase, startupState };
