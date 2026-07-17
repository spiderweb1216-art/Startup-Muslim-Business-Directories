const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const weakJwtSecrets = new Set([
  '',
  'change-this-development-secret',
  'replace-this-with-a-long-random-secret-before-production',
  'generate-a-random-secret-at-least-32-characters',
  'change-me',
]);

function boolEnv(name, fallback = false) {
  const value = process.env[name];
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function listEnv(name) {
  return String(process.env[name] || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function isStrongJwtSecret(value) {
  const normalized = String(value || '').trim();
  const placeholderPattern = /(replace|change|generate|paste|example|your[_-]|unique[_-]|at[_-]least|characters)/i;
  return normalized.length >= 32
    && !weakJwtSecrets.has(normalized.toLowerCase())
    && !placeholderPattern.test(normalized);
}

function resolveJwtSecret() {
  const configured = String(process.env.JWT_SECRET || '').trim();
  if (isStrongJwtSecret(configured)) return configured;

  if (isProduction) {
    throw new Error('JWT_SECRET must be a unique random value of at least 32 characters in production.');
  }

  // Development-only deterministic fallback. The Windows setup script normally
  // creates a random local secret before the server starts.
  const fallback = crypto
    .createHash('sha256')
    .update(`crescent-development-only:${path.resolve(__dirname, '../..')}`)
    .digest('hex');
  console.warn('JWT_SECRET is missing or weak. Using a development-only fallback; do not use this configuration in production.');
  return fallback;
}

function requireProductionDatabaseConfig() {
  if (!isProduction) return;
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((name) => !String(process.env[name] || '').trim());
  if (missing.length) {
    throw new Error(`Missing required production database variables: ${missing.join(', ')}`);
  }
  const placeholders = required.filter((name) => /^(your_|paste_|example|changeme)/i.test(String(process.env[name] || '').trim()));
  if (placeholders.length) {
    throw new Error(`Replace placeholder production database variables: ${placeholders.join(', ')}`);
  }
}

module.exports = {
  isProduction,
  boolEnv,
  listEnv,
  isStrongJwtSecret,
  jwtSecret: resolveJwtSecret(),
  requireProductionDatabaseConfig,
};
