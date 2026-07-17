const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { COLLECTIONS, ADMIN_ONLY, MEMBER_OWNED, STARTUP_LINKED } = require('./collectionConfig');

function parseJson(value, fallback = {}) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function safeUser(row) {
  if (!row) return null;
  const profile = parseJson(row.profile, {});
  return {
    ...profile,
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    country: row.country || '',
    status: row.status,
    verified: Boolean(row.verified),
    joinedAt: row.joined_at ? new Date(row.joined_at).toISOString().slice(0, 10) : '',
  };
}

async function listUsers() {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(safeUser);
}

async function getUserByEmail(email, includePassword = false) {
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email]);
  if (!rows[0]) return null;
  return includePassword ? rows[0] : safeUser(rows[0]);
}

async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
  return safeUser(rows[0]);
}

async function createUser(record) {
  const id = record.id || `u-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
  const passwordHash = await bcrypt.hash(record.password || 'ChangeMe123!', 12);
  const profile = { ...record };
  delete profile.password;
  await pool.query(
    `INSERT INTO users (id,name,email,password_hash,role,country,status,verified,joined_at,profile)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, record.name, String(record.email).toLowerCase(), passwordHash, record.role || 'General User', record.country || null, record.status || 'Active', record.verified ? 1 : 0, record.joinedAt || new Date().toISOString().slice(0,10), JSON.stringify(profile)]
  );
  return getUserById(id);
}

async function updateUser(id, changes) {
  const current = await getUserById(id);
  if (!current) return null;
  const merged = { ...current, ...changes, id };
  const profile = { ...merged };
  delete profile.password;
  const fields = ['name=?','email=?','role=?','country=?','status=?','verified=?','joined_at=?','profile=?'];
  const params = [merged.name, String(merged.email).toLowerCase(), merged.role, merged.country || null, merged.status || 'Active', merged.verified ? 1 : 0, merged.joinedAt || null, JSON.stringify(profile)];
  if (changes.password) {
    fields.push('password_hash=?');
    params.push(await bcrypt.hash(changes.password, 12));
  }
  params.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, params);
  return getUserById(id);
}

async function deleteUser(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id=?', [id]);
  return result.affectedRows > 0;
}

function hydrateRow(row) {
  return parseJson(row.data, {});
}

async function listRaw(collection, executor = pool) {
  const config = COLLECTIONS[collection];
  if (!config) throw new Error(`Unknown collection: ${collection}`);
  const order = collection === 'activity' ? 'created_at DESC' : collection === 'categories' ? 'display_order ASC, name ASC' : 'updated_at DESC';
  const [rows] = await executor.query(`SELECT * FROM \`${config.table}\` ORDER BY ${order}`);
  return rows.map(hydrateRow);
}

function isPublished(record) {
  return !['Draft','Pending','Rejected','Archived','Blocked','Inactive','Revoked','Cancelled'].includes(record.status || 'Published');
}

async function getOwnedStartupSlugs(userId, executor = pool) {
  const owned = new Set();
  if (!userId) return owned;
  const [startups, claims] = await Promise.all([
    listRaw('startups', executor),
    listRaw('claims', executor),
  ]);
  startups.forEach((startup) => {
    if (startup.ownerId === userId) owned.add(startup.slug);
  });
  claims.forEach((claim) => {
    if (claim.ownerId === userId && claim.status === 'Approved' && claim.startupSlug) owned.add(claim.startupSlug);
  });
  return owned;
}

async function userOwnsStartup(userId, startupSlug, executor = pool) {
  if (!userId || !startupSlug) return false;
  const startup = await getRecord('startups', startupSlug, executor);
  if (startup?.ownerId === userId) return true;
  const claims = await listRaw('claims', executor);
  return claims.some((claim) => claim.ownerId === userId && claim.startupSlug === startupSlug && claim.status === 'Approved');
}

function canReadRecord(collection, record, user, ownedStartupSlugs = new Set()) {
  if (user?.role === 'Admin') return true;
  if (ADMIN_ONLY.has(collection)) return false;
  if (collection === 'claims') return Boolean(user && record.ownerId === user.id);
  if (collection === 'pitches') {
    if (user && (record.ownerId === user.id || ownedStartupSlugs.has(record.startupSlug))) return true;
    return record.reviewStatus === 'Approved' && record.status !== 'Archived' && record.visibility === 'Public';
  }
  if (collection === 'pages') return record.status === 'Published';
  if (collection === 'categories') return record.status !== 'Inactive';
  if (collection === 'startups' && user && ownedStartupSlugs.has(record.slug)) return true;
  if (STARTUP_LINKED.has(collection) && user && ownedStartupSlugs.has(record.startupSlug)) return true;
  if (MEMBER_OWNED.has(collection) && user && record.ownerId === user.id) return true;
  return isPublished(record);
}

async function listCollection(collection, user = null) {
  if (collection === 'users') {
    if (user?.role === 'Admin') return listUsers();
    return user ? [await getUserById(user.id)].filter(Boolean) : [];
  }
  const records = await listRaw(collection);
  const ownedStartupSlugs = user && user.role !== 'Admin' ? await getOwnedStartupSlugs(user.id) : new Set();
  return records.filter((record) => canReadRecord(collection, record, user, ownedStartupSlugs));
}

function buildRecordRow(collection, record) {
  const config = COLLECTIONS[collection];
  const key = String(record[config.idField]);
  const name = String(record[config.nameField] || key);
  const row = { record_key:key, name, data:JSON.stringify(record), ...config.indexed(record) };
  if (collection === 'activity') delete row.name;
  return row;
}

async function upsertRecordWithExecutor(executor, collection, record) {
  const config = COLLECTIONS[collection];
  if (!config) throw new Error(`Unknown collection: ${collection}`);
  const row = buildRecordRow(collection, record);
  const columns = Object.keys(row);
  const values = Object.values(row);
  const updates = columns.filter((c) => c !== 'record_key').map((c) => `\`${c}\`=VALUES(\`${c}\`)`).join(', ');
  await executor.query(
    `INSERT INTO \`${config.table}\` (${columns.map((c)=>`\`${c}\``).join(',')}) VALUES (${columns.map(()=>'?').join(',')}) ON DUPLICATE KEY UPDATE ${updates}`,
    values
  );
  return record;
}

async function upsertRecord(collection, record) {
  return upsertRecordWithExecutor(pool, collection, record);
}

async function getRecord(collection, id, executor = pool) {
  if (collection === 'users') return getUserById(id);
  const config = COLLECTIONS[collection];
  const [rows] = await executor.query(`SELECT data FROM \`${config.table}\` WHERE record_key=? LIMIT 1`, [id]);
  return rows[0] ? hydrateRow(rows[0]) : null;
}

async function createRecord(collection, record) {
  if (collection === 'users') return createUser(record);
  await upsertRecord(collection, record);
  return record;
}

async function updateRecord(collection, id, changes) {
  if (collection === 'users') return updateUser(id, changes);
  const config = COLLECTIONS[collection];
  const current = await getRecord(collection, id);
  if (!current) return null;
  const merged = { ...current, ...changes, [config.idField]: current[config.idField] };
  await upsertRecord(collection, merged);
  return merged;
}

async function deleteRecord(collection, id) {
  if (collection === 'users') return deleteUser(id);
  const config = COLLECTIONS[collection];
  const [result] = await pool.query(`DELETE FROM \`${config.table}\` WHERE record_key=?`, [id]);
  return result.affectedRows > 0;
}

function mergeNote(existing, addition) {
  return [existing, addition].filter(Boolean).join(existing ? '\n' : '');
}

async function applyClaimDecision(claimId, changes, reviewer = {}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const claim = await getRecord('claims', claimId, connection);
    if (!claim) { await connection.rollback(); return null; }

    const nextStatus = changes.status || claim.status || 'Pending';
    const reviewedAt = new Date().toISOString();
    const reviewedBy = reviewer.name || reviewer.email || reviewer.id || 'Administrator';
    const mergedClaim = {
      ...claim,
      ...changes,
      id: claim.id,
      reviewedAt,
      reviewedBy,
      updatedAt: reviewedAt.slice(0,10),
    };

    if (nextStatus === 'Approved') {
      if (!mergedClaim.ownerId || !mergedClaim.startupSlug) {
        const error = new Error('This claim is missing its user or startup reference.');
        error.status = 400;
        throw error;
      }
      const startup = await getRecord('startups', mergedClaim.startupSlug, connection);
      if (!startup) {
        const error = new Error('The startup linked to this claim no longer exists.');
        error.status = 404;
        throw error;
      }

      const approvedStartup = {
        ...startup,
        ownerId: mergedClaim.ownerId,
        claimed: true,
        claimVerified: true,
        claimId: mergedClaim.id,
        claimedAt: reviewedAt,
        claimedByUserId: mergedClaim.ownerId,
        updatedAt: reviewedAt.slice(0,10),
      };
      await upsertRecordWithExecutor(connection, 'startups', approvedStartup);

      mergedClaim.status = 'Approved';
      mergedClaim.approvedAt = reviewedAt;
      mergedClaim.approvedBy = reviewedBy;

      const allClaims = await listRaw('claims', connection);
      for (const other of allClaims) {
        if (other.id === mergedClaim.id || other.startupSlug !== mergedClaim.startupSlug) continue;
        if (['Pending','Under Review','More Information Required','Approved'].includes(other.status)) {
          const replacementStatus = other.status === 'Approved' ? 'Revoked' : 'Rejected';
          await upsertRecordWithExecutor(connection, 'claims', {
            ...other,
            status: replacementStatus,
            reviewedAt,
            reviewedBy,
            notes: mergeNote(other.notes, `Automatically ${replacementStatus.toLowerCase()} because claim ${mergedClaim.id} was approved.`),
            updatedAt: reviewedAt.slice(0,10),
          });
        }
      }
    } else if (['Rejected','Revoked','Cancelled'].includes(nextStatus)) {
      mergedClaim.status = nextStatus;
      mergedClaim.decisionAt = reviewedAt;
      mergedClaim.decisionBy = reviewedBy;
      if (claim.status === 'Approved' && claim.startupSlug && claim.ownerId) {
        const startup = await getRecord('startups', claim.startupSlug, connection);
        if (startup?.ownerId === claim.ownerId && startup?.claimId === claim.id) {
          await upsertRecordWithExecutor(connection, 'startups', {
            ...startup,
            ownerId: '',
            claimed: false,
            claimVerified: false,
            claimId: '',
            claimedAt: '',
            claimedByUserId: '',
            updatedAt: reviewedAt.slice(0,10),
          });
        }
      }
    }

    await upsertRecordWithExecutor(connection, 'claims', mergedClaim);
    await connection.commit();
    return mergedClaim;
  } catch (error) {
    try { await connection.rollback(); } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function reconcileApprovedClaims() {
  const claims = await listRaw('claims');
  const winners = new Map();
  let repaired = 0;

  for (const claim of claims) {
    if (claim.status !== 'Approved' || !claim.ownerId || !claim.startupSlug) continue;
    if (!winners.has(claim.startupSlug)) {
      winners.set(claim.startupSlug, claim);
      continue;
    }
    await upsertRecord('claims', {
      ...claim,
      status:'Revoked',
      reviewedAt:new Date().toISOString(),
      reviewedBy:'System reconciliation',
      notes:mergeNote(claim.notes, `Automatically revoked because a newer approved claim exists for ${claim.startupSlug}.`),
      updatedAt:new Date().toISOString().slice(0,10),
    });
  }

  for (const claim of winners.values()) {
    const startup = await getRecord('startups', claim.startupSlug);
    if (!startup) continue;
    if (startup.ownerId === claim.ownerId && startup.claimed && startup.claimId === claim.id) continue;
    await upsertRecord('startups', {
      ...startup,
      ownerId:claim.ownerId,
      claimed:true,
      claimVerified:true,
      claimId:claim.id,
      claimedAt:claim.approvedAt || claim.reviewedAt || new Date().toISOString(),
      claimedByUserId:claim.ownerId,
      updatedAt:new Date().toISOString().slice(0,10),
    });
    repaired += 1;
  }
  return repaired;
}

async function addActivity(action, detail, actor = 'System') {
  const record = { id:`a-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`, action, detail, actor, createdAt:new Date().toISOString() };
  await upsertRecord('activity', record);
  return record;
}

async function getSettings() {
  const [rows] = await pool.query('SELECT settings FROM site_settings WHERE id=1');
  return rows[0] ? parseJson(rows[0].settings, {}) : {};
}

async function updateSettings(changes) {
  const current = await getSettings();
  const settings = { ...current, ...changes, updatedAt:new Date().toISOString() };
  await pool.query('INSERT INTO site_settings (id,settings) VALUES (1,?) ON DUPLICATE KEY UPDATE settings=VALUES(settings)', [JSON.stringify(settings)]);
  return settings;
}

async function getSavedItems(userId) {
  const [rows] = await pool.query('SELECT item_type,item_key FROM saved_items WHERE user_id=? ORDER BY created_at DESC', [userId]);
  const saved = { startups:[], pitches:[], investors:[], founders:[], opportunities:[], jobs:[], follows:[] };
  rows.forEach((r) => {
    if (!saved[r.item_type]) saved[r.item_type] = [];
    saved[r.item_type].push(r.item_key);
  });
  return saved;
}

async function toggleSavedItem(userId, itemType, itemKey) {
  const [rows] = await pool.query('SELECT id FROM saved_items WHERE user_id=? AND item_type=? AND item_key=? LIMIT 1', [userId,itemType,itemKey]);
  if (rows[0]) {
    await pool.query('DELETE FROM saved_items WHERE id=?', [rows[0].id]);
    return { saved:false };
  }
  await pool.query('INSERT INTO saved_items (user_id,item_type,item_key) VALUES (?,?,?)', [userId,itemType,itemKey]);
  return { saved:true };
}

module.exports = {
  safeUser, listUsers, getUserByEmail, getUserById, createUser, updateUser, deleteUser,
  listCollection, getRecord, createRecord, updateRecord, deleteRecord, upsertRecord,
  addActivity, getSettings, updateSettings, getSavedItems, toggleSavedItem,
  getOwnedStartupSlugs, userOwnsStartup, applyClaimDecision, reconcileApprovedClaims,
};
