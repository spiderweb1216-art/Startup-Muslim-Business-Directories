const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'change-this-development-secret';

function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, secret);
  } catch {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Authentication is required.' });
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Administrator access is required.' });
  }
  next();
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { optionalAuth, requireAuth, requireAdmin, signUser };
