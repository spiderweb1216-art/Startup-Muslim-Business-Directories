const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection, database } = require('./config/db');
const { reconcileApprovedClaims, ensureStartupContacts } = require('./services/recordService');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const publicRoutes = require('./routes/public');
const savedRoutes = require('./routes/saved');
const adminRoutes = require('./routes/admin');

const app = express();

// Hosting providers such as Hostinger expose their own PORT.
// API_PORT remains useful for local development.
const port = Number(process.env.PORT || process.env.API_PORT || 5000);

const configuredOrigins = String(process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));

// Same-origin requests do not need a configured CLIENT_URL.
// Configured external origins are still supported for local/dev use.
app.use((req, res, next) => {
  const requestOrigin = req.get('origin');
  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
  const sameOrigin = `${protocol}://${req.get('host')}`;

  return cors({
    origin(origin, callback) {
      if (!origin || origin === sameOrigin || configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })(req, res, next);
});

app.use(express.json({ limit: process.env.JSON_LIMIT || '20mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '20mb' }));
app.use(morgan('dev'));

// ---------- API ----------
app.get('/api/health', async (_req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', database, serverTime: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', database, message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api', publicRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRoutes);

// Unknown API routes should return JSON instead of the React app.
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.path}` });
});

// ---------- React production frontend ----------
const buildPath = path.resolve(__dirname, '../build');
app.use(express.static(buildPath));

// React Router fallback: every non-API GET route serves index.html.
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  return res.sendFile(path.join(buildPath, 'index.html'));
});

// Final non-API fallback.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with the same unique value already exists.' });
  }

  if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ message: 'The MySQL database is not initialized. Run npm run db:setup.' });
  }

  return res.status(error.status || 500).json({
    message: error.message || 'An unexpected server error occurred.',
  });
});

async function startServer() {
  try {
    await testConnection();
    const repaired = await reconcileApprovedClaims();
    if (repaired) console.log(`Repaired ownership for ${repaired} approved claim(s).`);

    const contactsAdded = await ensureStartupContacts();
    if (contactsAdded) {
      console.log(`Added default public contact profiles to ${contactsAdded} company record(s).`);
    }
  } catch (error) {
    console.warn(`Database startup check: ${error.message}`);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Crescent app running on port ${port} (database: ${database})`);
  });
}

startServer();
