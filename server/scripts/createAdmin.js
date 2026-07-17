const { getUserByEmail, createUser, updateUser } = require('../services/recordService');
const { boolEnv } = require('../config/env');

function adminConfig() {
  return {
    name: String(process.env.ADMIN_NAME || '').trim(),
    email: String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: String(process.env.ADMIN_PASSWORD || ''),
    country: String(process.env.ADMIN_COUNTRY || '').trim(),
  };
}

function validateAdminConfig(config, { optional = false } = {}) {
  const supplied = Boolean(config.name || config.email || config.password);
  if (optional && !supplied) return false;
  if (!config.name || /^(your name|admin name)$/i.test(config.name)) throw new Error('ADMIN_NAME is required and must not be placeholder text.');
  if (!/^\S+@\S+\.\S+$/.test(config.email) || /@example\.(com|org|net)$/i.test(config.email)) {
    throw new Error('ADMIN_EMAIL must be a real private email address, not an example address.');
  }
  if (config.password.length < 12 || /(use_a_|your_|example|changeme|password_of|at_least)/i.test(config.password)) {
    throw new Error('ADMIN_PASSWORD must be a unique non-placeholder password of at least 12 characters.');
  }
  return true;
}

async function ensureBootstrapAdmin({ optional = true } = {}) {
  const config = adminConfig();
  if (!validateAdminConfig(config, { optional })) return { skipped:true };

  const existing = await getUserByEmail(config.email);
  if (existing) {
    if (existing.role !== 'Admin') {
      throw new Error(`ADMIN_EMAIL already belongs to a non-admin account (${existing.role}). Choose another email.`);
    }
    if (boolEnv('ADMIN_FORCE_UPDATE', false)) {
      const user = await updateUser(existing.id, {
        name:config.name,
        password:config.password,
        country:config.country || existing.country,
        role:'Admin',
        status:'Active',
        verified:true,
      });
      return { created:false, updated:true, user };
    }
    return { created:false, updated:false, user:existing };
  }

  const user = await createUser({
    name:config.name,
    email:config.email,
    password:config.password,
    role:'Admin',
    country:config.country,
    status:'Active',
    verified:true,
    joinedAt:new Date().toISOString().slice(0,10),
  });
  return { created:true, updated:false, user };
}

async function main() {
  const result = await ensureBootstrapAdmin({ optional:false });
  if (result.created) console.log(`Administrator created: ${result.user.email}`);
  else if (result.updated) console.log(`Administrator updated: ${result.user.email}`);
  else console.log(`Administrator already exists: ${result.user.email}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Administrator setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { ensureBootstrapAdmin };
