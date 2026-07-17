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

if (isProduction && !hasFrontendBuild) {
  throw new Error('Production React build is missing. Run npm run build before npm start.');
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
app.use(express.urlencoded({ extended:true, limit:process.env.JSON_LIMIT || '20mb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.get('/api/health', async (_req, res) => {
  try {
    await testConnection();
    res.json({ status:'ok', database, environment:process.env.NODE_ENV || 'development', serverTime:new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status:'error', database, message:error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api', publicRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message:`API route not found: ${req.method} ${req.originalUrl}` });
});

if (hasFrontendBuild) {
  app.use(express.static(buildPath, {
    index:false,
    maxAge:isProduction ? '1d' : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
      if (/\.[a-f0-9]{8,}\.(js|css)$/i.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }));

  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexPath);
  });
}

app.use((req, res) => {
  res.status(404).json({ message:`Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message:'A record with the same unique value already exists.' });
  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ message:'The MySQL database is not initialized. Apply database/hostinger-schema.sql or run npm run db:schema.' });
  }
  return res.status(error.status || 500).json({ message:error.message || 'An unexpected server error occurred.' });
});

async function prepareDatabase() {
  if (boolEnv('DB_AUTO_MIGRATE', false)) {
    await applySchema({ createDatabase:boolEnv('DB_CREATE_DATABASE', false) });
    console.log(`Database schema is up to date: ${database}`);
  }

  await testConnection();

  if (boolEnv('DB_SEED_CONTENT', false)) {
    const result = await seedProductionContent({ onlyIfEmpty:true });
    console.log(result.skipped ? 'Production content seed skipped; content already exists.' : `Inserted ${result.inserted} production content records.`);
  }

  const adminResult = await ensureBootstrapAdmin({ optional:true });
  if (adminResult.created) console.log(`Bootstrap administrator created: ${adminResult.user.email}`);
  else if (adminResult.updated) console.log(`Bootstrap administrator updated: ${adminResult.user.email}`);

  const repaired = await reconcileApprovedClaims();
  if (repaired) console.log(`Repaired ownership for ${repaired} approved claim(s).`);
}

let server;
async function startServer() {
  await prepareDatabase();
  server = app.listen(port, host, () => {
    const publicUrl = configuredOrigins[0] || `http://localhost:${port}`;
    console.log(`Crescent Startup Lab running on ${publicUrl}`);
    console.log(`API health: ${publicUrl.replace(/\/$/, '')}/api/health`);
  });
  return server;
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM').catch((error) => { console.error(error); process.exit(1); }));
process.on('SIGINT', () => shutdown('SIGINT').catch((error) => { console.error(error); process.exit(1); }));

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { app, startServer };
