const express=require('express');
const crypto=require('crypto');
const {COLLECTIONS}=require('../services/collectionConfig');
const {requireAuth,requireAdmin}=require('../middleware/auth');
const {listCollection,getSettings,createRecord,updateRecord,getUserById,updateSettings,addActivity}=require('../services/recordService');
const {seedDatabase}=require('../scripts/setupDatabase');
const {pool}=require('../config/db');
const router=express.Router();
router.use(requireAuth,requireAdmin);
const collections=['startups','founders','investors','rounds','opportunities','jobs','pitches','claims','categories','users','messages','subscribers','pages','media','activity'];

// Admin-only, cross-device cache revision. Changes only the site_settings JSON
// and activity log; company/user records and sessions are never deleted.
router.post('/cache/clear', async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT settings FROM site_settings WHERE id=1 FOR UPDATE');
    const current = rows[0] ? JSON.parse(rows[0].settings || '{}') : {};
    const revision = `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}`;
    const clearedAt = new Date().toISOString();
    const settings = { ...current, siteCacheRevision: revision, siteCacheClearedAt: clearedAt };
    await connection.query(
      'INSERT INTO site_settings (id,settings) VALUES (1,?) ON DUPLICATE KEY UPDATE settings=VALUES(settings)',
      [JSON.stringify(settings)]
    );
    await connection.commit();
    // Log the action, but do not mark the clear as failed if logging is unavailable.
    try { await addActivity('Site cache refreshed', 'Administrator requested a site-wide cache refresh.', req.user.name); }
    catch (logError) { console.warn('Cache refresh activity logging failed:', logError.message); }
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, revision, clearedAt, scope: 'application-managed caches and browser refresh signals' });
  } catch (error) {
    if (connection) { try { await connection.rollback(); } catch {} }
    next(error);
  } finally { if (connection) connection.release(); }
});

router.get('/export',async(req,res,next)=>{try{const values=await Promise.all(collections.map(c=>listCollection(c,req.user)));const data=Object.fromEntries(collections.map((c,i)=>[c,values[i]]));data.settings=await getSettings();const [savedRows]=await pool.query('SELECT user_id AS userId,item_type AS itemType,item_key AS itemKey,created_at AS createdAt FROM saved_items ORDER BY id');data.savedItems=savedRows;res.json({data,exportedAt:new Date().toISOString()});}catch(e){next(e);}});

router.post('/import',async(req,res,next)=>{
  const connection=await pool.getConnection();
  try{
    const payload=req.body?.data||req.body;
    if(!payload||typeof payload!=='object')return res.status(400).json({message:'A valid backup object is required.'});
    await connection.beginTransaction();
    const tableMap={startups:'startups',founders:'founders',investors:'investors',rounds:'funding_rounds',opportunities:'opportunities',jobs:'jobs',pitches:'pitches',claims:'claim_requests',categories:'categories',messages:'contact_messages',subscribers:'newsletter_subscribers',pages:'pages',media:'media',activity:'activity_logs'};
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    for(const table of Object.values(tableMap))await connection.query(`TRUNCATE TABLE \`${table}\``);
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    await connection.commit();
    for(const [collection,table] of Object.entries(tableMap)){void table;for(const item of payload[collection]||[])await createRecord(collection,item);}
    for(const user of payload.users||[]){const existing=await getUserById(user.id);if(existing)await updateRecord('users',user.id,user);else await createRecord('users',{...user,password:user.password||'Imported123!'});}
    if(payload.settings)await updateSettings(payload.settings);
    if(Array.isArray(payload.savedItems)){
      await pool.query('DELETE FROM saved_items');
      for(const item of payload.savedItems){await pool.query('INSERT IGNORE INTO saved_items (user_id,item_type,item_key) VALUES (?,?,?)',[item.userId,item.itemType,item.itemKey]);}
    }
    await addActivity('Database backup imported','The administrator imported a complete JSON backup.',req.user.name);
    res.json({ok:true});
  }catch(e){try{await connection.rollback();}catch{}next(e);}finally{connection.release();}
});

// Admin-only, transactional company CSV import. The browser parses the CSV and
// previews changes; this endpoint validates again before touching MySQL.
const COMPANY_FIELDS = new Set([
  'name','slug','tagline','category','country','flag','hq','stage','fundingStage',
  'businessModel','status','website','banner','description','revenue','users',
  'growth','addedAt','ownerId','foundedYear','teamSize','totalRaised','views',
  'featured','verified','hiring','pitching','openToFunding','claimed',
  'claimVerified','founderSlugs','founderProfiles','similarSlugs','productImages','products',
  'overviewBlocks','logo','contact',
]);
const COMPANY_BOOL = new Set(['featured','verified','hiring','pitching','openToFunding','claimed','claimVerified']);
const COMPANY_NUM = new Set(['foundedYear','teamSize','totalRaised','views']);
const COMPANY_ARRAY = new Set(['founderSlugs','founderProfiles','similarSlugs','productImages','products','overviewBlocks']);
const COMPANY_STATUS = new Set(['Published','Pending','Draft','Rejected','Archived']);
const logoFields = new Set(['mark','color']);
const contactFields = new Set(['public','name','role','email','phone','whatsapp','address','linkedin','note','demo']);
const companySlug = (name) => String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const plainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const csvError = (message) => Object.assign(new Error(message), {status:400});

// Founder names are NOT the same as founderSlugs. CSV founderProfiles creates
// real founder records on existing companies, in the same transaction.
const FOUNDER_CSV_FIELDS = new Set(['name','slug','role','bio','linkedin','photo']);
function cleanFounderProfiles(value, row) {
  if (!Array.isArray(value) || value.length > 15) throw csvError(`Row ${row}: founderProfiles must be an array with at most 15 founders.`);
  const seen = new Set();
  return value.map((raw, index) => {
    if (!plainObject(raw) || Object.keys(raw).some((key) => !FOUNDER_CSV_FIELDS.has(key))) throw csvError(`Row ${row}, founder ${index+1}: unsupported founder field.`);
    const founder = {};
    for (const field of FOUNDER_CSV_FIELDS) {
      if (raw[field] == null || raw[field] === '') continue;
      if (typeof raw[field] !== 'string') throw csvError(`Row ${row}, founder ${index+1}: ${field} must be text.`);
      founder[field] = raw[field].trim();
    }
    if (!founder.name || founder.name.length > 190) throw csvError(`Row ${row}, founder ${index+1}: name is required (max 190).`);
    if (!founder.slug || founder.slug.length > 191 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(founder.slug)) throw csvError(`Row ${row}, founder ${index+1}: invalid slug.`);
    if (seen.has(founder.slug)) throw csvError(`Row ${row}: duplicate founder slug ${founder.slug}.`);
    seen.add(founder.slug);
    if ((founder.role || '').length > 190 || (founder.bio || '').length > 4000) throw csvError(`Row ${row}, founder ${index+1}: role or bio too long.`);
    for (const field of ['photo','linkedin']) if (founder[field] && (founder[field].length > 2048 || !/^https:\/\/[^\s]+$/i.test(founder[field]))) throw csvError(`Row ${row}, founder ${index+1}: ${field} must be a valid HTTPS URL.`);
    return founder;
  });
}

function cleanCompanyImport(raw, row) {
  if (!plainObject(raw)) throw csvError(`Row ${row}: a company object is required.`);
  const incoming = {};
  for (const [key,value] of Object.entries(raw)) {
    if (!COMPANY_FIELDS.has(key) || value == null || value === '') continue;
    if (key === 'contact' || key === 'logo') {
      if (!plainObject(value)) throw csvError(`Row ${row}: ${key} must be an object.`);
      const allowed = key === 'contact' ? contactFields : logoFields;
      incoming[key] = Object.fromEntries(Object.entries(value).filter(([field]) => allowed.has(field)));
      if (key === 'contact' && incoming.contact.public !== undefined && typeof incoming.contact.public !== 'boolean') throw csvError(`Row ${row}: contact.public must be a boolean.`);
      continue;
    }
    if (COMPANY_BOOL.has(key) && typeof value !== 'boolean') throw csvError(`Row ${row}: ${key} must be true or false.`);
    if (COMPANY_NUM.has(key) && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (key !== 'totalRaised' && !Number.isInteger(value)))) throw csvError(`Row ${row}: ${key} must be a nonnegative number.`);
    if (COMPANY_ARRAY.has(key) && !Array.isArray(value)) throw csvError(`Row ${row}: ${key} must be an array.`);
    if (key === 'founderProfiles') { incoming.founderProfiles = cleanFounderProfiles(value,row); continue; }
    if (!COMPANY_BOOL.has(key) && !COMPANY_NUM.has(key) && !COMPANY_ARRAY.has(key) && typeof value !== 'string') throw csvError(`Row ${row}: ${key} must be text.`);
    incoming[key] = value;
  }
  const name = String(incoming.name || '').trim();
  if (!name || name.length > 190) throw csvError(`Row ${row}: company name is required (maximum 190 characters).`);
  const slug = incoming.slug ? String(incoming.slug).trim() : companySlug(name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 191) throw csvError(`Row ${row}: invalid company slug.`);
  const lengths = {country:120,category:120,stage:80,ownerId:64};
  for (const [key,max] of Object.entries(lengths)) {
    if (incoming[key] && String(incoming[key]).length > max) throw csvError(`Row ${row}: ${key} is too long (maximum ${max} characters).`);
  }
  if (incoming.status && !COMPANY_STATUS.has(incoming.status)) throw csvError(`Row ${row}: invalid publication status.`);
  if (JSON.stringify(incoming).length > 100000) throw csvError(`Row ${row}: company data is too large.`);
  return {...incoming,name,slug};
}

router.post('/startups/import-csv', async (req,res,next) => {
  const {items,onDuplicate='skip'} = req.body || {};
  if (!Array.isArray(items) || items.length < 1 || items.length > 500) return res.status(400).json({message:'Provide 1–500 companies per import.'});
  if (!['skip','update'].includes(onDuplicate)) return res.status(400).json({message:'Invalid duplicate handling option.'});
  let normalized;
  try {
    const seen = new Set();
    normalized = items.map((item,index) => {
      const clean = cleanCompanyImport(item,index+2);
      if (seen.has(clean.slug)) throw csvError(`Duplicate company slug in CSV: ${clean.slug}.`);
      seen.add(clean.slug);
      return clean;
    });
  } catch (error) { return next(error); }

  const importingFounders = normalized.some((item) => item.founderProfiles?.length);
  if (importingFounders && onDuplicate !== 'update') return next(csvError('Choose Update existing companies to import founder profiles.'));
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let created = 0, updated = 0, skipped = 0, foundersCreated = 0, foundersLinked = 0;
    const cfg = COLLECTIONS.startups;
    const founderCfg = COLLECTIONS.founders;
    for (const item of normalized) {
      const [found] = await connection.query('SELECT data FROM startups WHERE record_key=? FOR UPDATE',[item.slug]);
      const existing = found.length ? JSON.parse(found[0].data) : null;
      if (existing && onDuplicate === 'skip') { skipped += 1; continue; }
      const { founderProfiles = [], ...companyFields } = item;
      if (founderProfiles.length && !existing) throw csvError(`Company ${item.slug} is not in your website database. Founder-only imports must match an existing company.`);
      const linkedSlugs = new Set(Array.isArray(existing?.founderSlugs) ? existing.founderSlugs : []);
      for (const profile of founderProfiles) {
        // Reuse existing profiles by company+name, even if their slug differs.
        const [named] = await connection.query('SELECT record_key, data FROM founders WHERE startup_slug=? AND name=? LIMIT 1',[item.slug,profile.name]);
        if (named.length) {
          linkedSlugs.add(named[0].record_key);
          foundersLinked += 1;
          continue;
        }
        const [sameSlug] = await connection.query('SELECT record_key, data FROM founders WHERE record_key=? FOR UPDATE',[profile.slug]);
        if (sameSlug.length) {
          const saved = JSON.parse(sameSlug[0].data);
          if (saved.startupSlug !== item.slug) throw csvError(`Founder slug ${profile.slug} already belongs to a different company. No records were saved.`);
          linkedSlugs.add(profile.slug);
          foundersLinked += 1;
          continue;
        }
        const founder = {
          ...profile, id:`f-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
          slug:profile.slug, startupSlug:item.slug,
          country: existing?.country || '', flag:existing?.flag || '', industry:existing?.category || '',
          status:'Draft', verified:false, featured:false,
          photo: profile.photo || 'https://api.dicebear.com/9.x/icons/svg?seed=StartupMuslimFounder&backgroundColor=f0f3ed',
          updatedAt:new Date().toISOString().slice(0,10),
        };
        const founderRow = {record_key:founder.slug,name:founder.name,data:JSON.stringify(founder),...founderCfg.indexed(founder)};
        const columns = Object.keys(founderRow);
        await connection.query(`INSERT INTO founders (${columns.map((key)=>'`'+key+'`').join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,Object.values(founderRow));
        linkedSlugs.add(founder.slug);
        foundersCreated += 1;
      }
      const merged = {
        ...(existing || {}), ...companyFields,
        ...(founderProfiles.length ? {founderSlugs:[...linkedSlugs]} : {}),
        ...(existing ? { id:existing.id, ownerId:existing.ownerId, claimed:existing.claimed, claimVerified:existing.claimVerified } : { id:`s-${Date.now()}-${crypto.randomBytes(4).toString('hex')}` }),
        slug:item.slug,
        status:item.status || existing?.status || 'Published',
        addedAt:item.addedAt || existing?.addedAt || new Date().toISOString().slice(0,10),
        updatedAt:new Date().toISOString().slice(0,10),
        logo:{mark:nameInitials(item.name),color:'#2F8F5B',...(existing?.logo || {}),...(item.logo || {})},
        ...(item.contact ? {contact:{...(existing?.contact || {}),...item.contact}} : {}),
      };
      const record = {
        record_key:merged.slug, name:merged.name,
        data:JSON.stringify(merged), ...cfg.indexed(merged),
      };
      const keys = Object.keys(record);
      const values = Object.values(record);
      if (existing) {
        const changes = keys.filter((key) => key !== 'record_key');
        await connection.query(`UPDATE startups SET ${changes.map((key) => `\`${key}\`=?`).join(', ')} WHERE record_key=?`,[...changes.map((key)=>record[key]),merged.slug]);
        updated += 1;
      } else {
        await connection.query(`INSERT INTO startups (${keys.map((key) => `\`${key}\``).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,values);
        created += 1;
      }
    }
    const action = {id:`a-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,action:'Companies imported from CSV',detail:`${created} companies created, ${updated} companies updated, ${skipped} skipped; ${foundersCreated} draft founders created, ${foundersLinked} founders linked.`,actor:req.user.name || req.user.email || 'Admin',createdAt:new Date().toISOString()};
    const activityRow = {record_key:action.id,action:action.action,actor:action.actor,detail:action.detail,data:JSON.stringify(action),created_at:new Date(action.createdAt)};
    await connection.query(`INSERT INTO activity_logs (${Object.keys(activityRow).map((key)=>`\`${key}\``).join(',')}) VALUES (?,?,?,?,?,?)`,Object.values(activityRow));
    await connection.commit();
    res.json({ok:true,created,updated,skipped,foundersCreated,foundersLinked,total:normalized.length});
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch (_) {}
    next(error);
  } finally { if (connection) connection.release(); }
});

function nameInitials(name) {
  return String(name || 'Company').trim().split(/\s+/).slice(0,2).map((part)=>part.slice(0,1)).join('').toUpperCase();
}

// Investor CSV import: admin-only, validated server-side and committed atomically.
// Existing investor ownership, record identity and all omitted fields are kept.
const INVESTOR_CSV_FIELDS = new Set([
  'name','slug','type','country','flag','status','verified','featured','halalFocus',
  'ticketRange','foundedYear','headquarters','aum','teamSize','website',
  'linkedin','email','phone','description','thesis','focus','stageFocus',
  'portfolio','portfolioCount','logo',
]);
const INVESTOR_CSV_BOOLEAN = new Set(['verified','featured','halalFocus']);
const INVESTOR_CSV_INTEGER = new Set(['foundedYear','teamSize','portfolioCount']);
const INVESTOR_CSV_ARRAY = new Set(['focus','stageFocus','portfolio']);
const INVESTOR_CSV_STATUS = new Set(['Published','Pending','Draft','Rejected','Archived']);
const investorSlug = (name) => String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
function cleanInvestorImport(raw, row) {
  if (!plainObject(raw)) throw csvError(`Row ${row}: invalid investor record.`);
  const incoming = {};
  for (const [key, value] of Object.entries(raw)) {
    // Do not allow forged ownership, record IDs, claims or arbitrary JSON keys.
    if (!INVESTOR_CSV_FIELDS.has(key)) throw csvError(`Row ${row}: unsupported investor field ${key}.`);
    if (value == null || value === '') continue;
    if (key === 'logo') {
      if (!plainObject(value) || Object.keys(value).some((k) => !['mark','color'].includes(k))) throw csvError(`Row ${row}: logo supports mark and color only.`);
      const cleanLogo = {};
      if (value.mark !== undefined) {
        if (typeof value.mark !== 'string' || value.mark.length > 20) throw csvError(`Row ${row}: invalid logo initials.`);
        if (value.mark.trim()) cleanLogo.mark = value.mark.trim();
      }
      if (value.color !== undefined) {
        if (typeof value.color !== 'string' || !/^#[a-f0-9]{6}$/i.test(value.color.trim())) throw csvError(`Row ${row}: logo color must be a 6-digit hex color.`);
        cleanLogo.color = value.color.trim();
      }
      if (Object.keys(cleanLogo).length) incoming.logo = cleanLogo;
      continue;
    }
    if (INVESTOR_CSV_BOOLEAN.has(key)) {
      if (typeof value !== 'boolean') throw csvError(`Row ${row}: ${key} must be true or false.`);
    } else if (INVESTOR_CSV_INTEGER.has(key)) {
      if (!Number.isSafeInteger(value) || value < 0) throw csvError(`Row ${row}: ${key} must be a nonnegative whole number.`);
    } else if (INVESTOR_CSV_ARRAY.has(key)) {
      if (!Array.isArray(value) || value.length > 100 || value.some((v)=>typeof v !== 'string' || !v.trim() || v.length > 190)) throw csvError(`Row ${row}: ${key} must contain up to 100 text values.`);
    } else if (typeof value !== 'string') {
      throw csvError(`Row ${row}: ${key} must be text.`);
    }
    if (typeof value === 'string') {
      const limits = {name:190,slug:191,type:120,country:120,flag:20,status:40,email:190,phone:120,website:2048,linkedin:2048,description:20000,thesis:20000};
      if (value.length > (limits[key] || 2000)) throw csvError(`Row ${row}: ${key} is too long.`);
      if (['website','linkedin'].includes(key) && value.trim() && !/^https?:\/\/[^\s]+$/i.test(value.trim())) throw csvError(`Row ${row}: ${key} needs an HTTP(S) URL.`);
      if (key === 'email' && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw csvError(`Row ${row}: invalid contact email.`);
    }
    incoming[key] = typeof value === 'string' ? value.trim() : value;
  }
  if (!incoming.name) throw csvError(`Row ${row}: investor name is required.`);
  const slug = incoming.slug || investorSlug(incoming.name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 191) throw csvError(`Row ${row}: invalid investor slug.`);
  if (incoming.status && !INVESTOR_CSV_STATUS.has(incoming.status)) throw csvError(`Row ${row}: invalid investor status.`);
  if (JSON.stringify(incoming).length > 100000) throw csvError(`Row ${row}: investor data is too large.`);
  return {...incoming,slug};
}

router.post('/investors/import-csv', async (req, res, next) => {
  const {items, onDuplicate='skip'} = req.body || {};
  if (!Array.isArray(items) || items.length < 1 || items.length > 500) return next(csvError('Provide 1–500 investors per import.'));
  if (!['skip','update'].includes(onDuplicate)) return next(csvError('Invalid duplicate-handling choice.'));
  let normalized;
  try {
    const seen = new Set();
    normalized = items.map((item,i) => {
      const clean = cleanInvestorImport(item,i+2);
      if (seen.has(clean.slug)) throw csvError(`Duplicate investor slug in CSV: ${clean.slug}.`);
      seen.add(clean.slug);
      return clean;
    });
  } catch (error) { return next(error); }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let created = 0, updated = 0, skipped = 0;
    const cfg = COLLECTIONS.investors;
    for (const item of normalized) {
      const [rows] = await connection.query('SELECT data FROM investors WHERE record_key=? FOR UPDATE', [item.slug]);
      const existing = rows.length ? (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) : null;
      if (existing && onDuplicate === 'skip') { skipped++; continue; }
      // Never alter record identity, ownership, claim state or unrelated data.
      const merged = {
        ...(existing || {}), ...item,
        ...(existing ? {id:existing.id,ownerId:existing.ownerId,claimed:existing.claimed,claimVerified:existing.claimVerified} : {id:`i-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`}),
        slug:item.slug,
        status:item.status || existing?.status || 'Published',
        updatedAt:new Date().toISOString().slice(0,10),
        logo:{mark:nameInitials(item.name),color:'#2F8F5B',...(existing?.logo || {}),...(item.logo || {})},
      };
      const row = {record_key:merged.slug,name:merged.name,data:JSON.stringify(merged),...cfg.indexed(merged)};
      const columns = Object.keys(row);
      if (existing) {
        const changedColumns = columns.filter((key)=>key !== 'record_key');
        await connection.query(`UPDATE investors SET ${changedColumns.map((key)=>`\`${key}\`=?`).join(', ')} WHERE record_key=?`, [...changedColumns.map((key)=>row[key]),merged.slug]);
        updated++;
      } else {
        await connection.query(`INSERT INTO investors (${columns.map((key)=>`\`${key}\``).join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,Object.values(row));
        created++;
      }
    }
    const action = {id:`a-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,action:'Investors imported from CSV',detail:`${created} investors created, ${updated} updated, ${skipped} skipped.`,actor:req.user.name || req.user.email || 'Admin',createdAt:new Date().toISOString()};
    const log = {record_key:action.id,action:action.action,actor:action.actor,detail:action.detail,data:JSON.stringify(action),created_at:new Date(action.createdAt)};
    await connection.query(`INSERT INTO activity_logs (${Object.keys(log).map((key)=>`\`${key}\``).join(',')}) VALUES (?,?,?,?,?,?)`,Object.values(log));
    await connection.commit();
    res.json({ok:true,created,updated,skipped,total:normalized.length});
  } catch(error) {
    if (connection) try { await connection.rollback(); } catch (_) {}
    next(error);
  } finally { if(connection) connection.release(); }
});

// Funding-round CSV is deliberately a separate admin endpoint. It never writes
// to startups or investors, and never changes the existing company CSV importer.
const FUNDING_IMPORT_KEYS = new Set(['slug','roundName','date','amount','valuation','leadInvestor','investors','stage','notes','status']);
const FUNDING_IMPORT_STATUSES = new Set(['Published','Pending','Draft','Rejected','Archived']);
const fundingSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fundingNameKey = (text) => String(text || '').trim().replace(/\s+/g,' ').toLowerCase();
const cleanDate = (input) => {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const [y,m,d] = input.split('-').map(Number);
  const value = new Date(Date.UTC(y,m-1,d));
  return y>=1000 && y<=9999 && value.getUTCFullYear()===y && value.getUTCMonth()===m-1 && value.getUTCDate()===d;
};
const jsonRecord = (raw) => typeof raw === 'string' ? JSON.parse(raw) : raw;
function cleanFundingImport(raw, row) {
  if (!plainObject(raw)) throw csvError(`Row ${row}: an object is required.`);
  for (const key of Object.keys(raw)) if (!FUNDING_IMPORT_KEYS.has(key)) throw csvError(`Row ${row}: unsupported funding field ${key}.`);
  const data = {};
  for (const [key,value] of Object.entries(raw)) {
    if (value === '' || value == null) continue;
    if (['amount','valuation'].includes(key)) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 9000000000000 || Math.abs(value*100-Math.round(value*100))>1e-7) throw csvError(`Row ${row}: ${key} must be a USD number with at most two decimals.`);
      data[key] = value;
    } else if (key === 'investors') {
      if (!Array.isArray(value) || value.length > 40) throw csvError(`Row ${row}: investors must be an array with up to 40 names.`);
      const known = new Set();
      data.investors = value.map((name) => {
        if (typeof name !== 'string' || !name.trim() || name.trim().length > 160) throw csvError(`Row ${row}: each investor must be a name up to 160 characters.`);
        return name.trim().replace(/\s+/g,' ');
      }).filter((name) => {
        const keyName = fundingNameKey(name);
        if (known.has(keyName)) return false;
        known.add(keyName);
        return true;
      });
    } else {
      if (typeof value !== 'string') throw csvError(`Row ${row}: ${key} must be text.`);
      const trimmed = value.trim();
      const limits = {slug:191,roundName:190,date:10,leadInvestor:160,stage:120,notes:10000,status:40};
      if (trimmed.length > (limits[key] || 10000)) throw csvError(`Row ${row}: ${key} is too long.`);
      data[key] = trimmed;
    }
  }
  if (!data.slug || !fundingSlugPattern.test(data.slug)) throw csvError(`Row ${row}: a valid existing company slug is required.`);
  if (!data.roundName) throw csvError(`Row ${row}: roundName is required.`);
  if (data.date && !cleanDate(data.date)) throw csvError(`Row ${row}: invalid date (use YYYY-MM-DD).`);
  if (data.status && !FUNDING_IMPORT_STATUSES.has(data.status)) throw csvError(`Row ${row}: unknown funding round status.`);
  if (JSON.stringify(data).length > 30000) throw csvError(`Row ${row}: funding record is too large.`);
  return data;
}

router.post('/startups/funding-rounds/import-csv', async (req, res, next) => {
  const {items, onDuplicate='skip'} = req.body || {};
  if (!Array.isArray(items) || !items.length || items.length > 500) return next(csvError('Provide 1–500 funding rounds per file.'));
  if (!['skip','update'].includes(onDuplicate)) return next(csvError('Choose Skip existing or Update existing funding rounds.'));
  let incoming;
  try {
    const identities = new Set(), grouped = new Map();
    incoming = items.map((raw,index) => {
      const item = cleanFundingImport(raw,index+2);
      const group = `${item.slug}|${fundingNameKey(item.roundName)}`;
      const identity = `${group}|${item.date || ''}`;
      if (identities.has(identity)) throw csvError(`Row ${index+2}: repeated company, round name and date in this CSV.`);
      identities.add(identity);
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push({date:item.date, row:index+2});
      return item;
    });
    for (const group of grouped.values()) if (group.length>1 && group.some((item)=>!item.date)) throw csvError('Multiple rounds with the same company and name require a date on every CSV row.');
    // Lock companies in a fixed order for concurrent imports.
    incoming.sort((a,b) => a.slug.localeCompare(b.slug) || a.roundName.localeCompare(b.roundName) || String(a.date||'').localeCompare(String(b.date||'')));
  } catch(error) { return next(error); }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    // Match names/slugs to existing Investors without inserting or updating them.
    const [investorRows] = await connection.query('SELECT record_key, name FROM investors');
    const bySlug = new Map(), byName = new Map();
    for (const item of investorRows) {
      const slug = String(item.record_key || '');
      const name = String(item.name || '');
      bySlug.set(slug.toLowerCase(), {slug,name});
      const key = fundingNameKey(name);
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push({slug,name});
    }
    const resolve = (name) => {
      const token = fundingNameKey(name);
      const direct = bySlug.get(token);
      if (direct) return direct;
      const matches = byName.get(token) || [];
      if (matches.length > 1) throw csvError(`Investor name "${name}" matches multiple profiles. Use its exact investor slug instead.`);
      return matches[0] || null;
    };
    let created=0, updated=0, skipped=0, linked=0, unlisted=0;
    const dateNow = new Date().toISOString().slice(0,10);
    const cfg = COLLECTIONS.rounds;
    for (const item of incoming) {
      const [companies] = await connection.query('SELECT record_key FROM startups WHERE record_key=? FOR UPDATE',[item.slug]);
      if (!companies.length) throw csvError(`Company slug "${item.slug}" does not exist. Nothing has been imported.`);
      const [roundRows] = await connection.query('SELECT record_key, data FROM funding_rounds WHERE startup_slug=? FOR UPDATE',[item.slug]);
      const sameName = roundRows.map((r) => ({id:r.record_key, round:jsonRecord(r.data)}))
        .filter((record) => fundingNameKey(record.round.roundName) === fundingNameKey(item.roundName));
      const found = item.date
        ? sameName.filter(({round}) => round.date === item.date)
        : sameName;
      if (found.length > 1) throw csvError(`Multiple existing "${item.roundName}" rounds found for ${item.slug}. Add an exact date to distinguish them; no changes saved.`);
      const existing = found[0]?.round || null;
      const recordKey = found[0]?.id;
      if (existing && onDuplicate === 'skip') { skipped++; continue; }
      const changed = {};
      for (const key of ['amount','valuation','stage','notes','status']) if (Object.prototype.hasOwnProperty.call(item,key)) changed[key] = item[key];
      if (Object.prototype.hasOwnProperty.call(item,'leadInvestor')) {
        const profile = resolve(item.leadInvestor);
        changed.leadInvestorSlug = profile?.slug || '';
        changed.leadInvestorName = profile ? '' : item.leadInvestor;
        if (profile) linked++; else unlisted++;
      }
      if (Object.prototype.hasOwnProperty.call(item,'investors')) {
        const slugs = new Set(), names = new Map();
        for (const name of item.investors) {
          const profile = resolve(name);
          if (profile) { slugs.add(profile.slug); linked++; }
          else { names.set(fundingNameKey(name),name); unlisted++; }
        }
        changed.investorSlugs = [...slugs];
        changed.investorNames = [...names.values()];
      }
      const result = {
        ...(existing || {}), ...changed,
        id:existing?.id || `r-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
        startupSlug:item.slug,
        roundName:existing?.roundName || item.roundName,
        ...(item.date ? {date:item.date} : {}),
        status:changed.status || existing?.status || 'Draft',
        amount:changed.amount ?? existing?.amount ?? 0,
        valuation:changed.valuation ?? existing?.valuation ?? 0,
        updatedAt:dateNow,
      };
      // Do not duplicate the lead in participating investors.
      if (result.leadInvestorSlug) result.investorSlugs = (result.investorSlugs || []).filter((slug)=>slug!==result.leadInvestorSlug);
      if (result.leadInvestorName) result.investorNames = (result.investorNames || []).filter((name)=>fundingNameKey(name)!==fundingNameKey(result.leadInvestorName));
      const saved = {record_key:recordKey || result.id,name:result.roundName,data:JSON.stringify(result),...cfg.indexed(result)};
      if (existing) {
        const fields = Object.keys(saved).filter((key)=>key!=='record_key');
        await connection.query(`UPDATE funding_rounds SET ${fields.map((key)=>'`'+key+'`=?').join(', ')} WHERE record_key=?`,[...fields.map((key)=>saved[key]),recordKey]);
        updated++;
      } else {
        const fields = Object.keys(saved);
        await connection.query(`INSERT INTO funding_rounds (${fields.map((key)=>'`'+key+'`').join(',')}) VALUES (${fields.map(()=>'?').join(',')})`,Object.values(saved));
        created++;
      }
    }
    const action = {id:`a-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,action:'Funding rounds imported from Companies CSV',detail:`${created} rounds created, ${updated} updated, ${skipped} skipped; ${linked} existing investor references and ${unlisted} round-only names.`,actor:req.user.name||req.user.email||'Admin',createdAt:new Date().toISOString()};
    const log = {record_key:action.id,action:action.action,actor:action.actor,detail:action.detail,data:JSON.stringify(action),created_at:new Date(action.createdAt)};
    await connection.query(`INSERT INTO activity_logs (${Object.keys(log).map((key)=>'`'+key+'`').join(',')}) VALUES (?,?,?,?,?,?)`,Object.values(log));
    await connection.commit();
    res.json({ok:true,created,updated,skipped,linked,unlisted,total:incoming.length});
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch (_) {}
    next(error);
  } finally { if (connection) connection.release(); }
});

router.post('/reset',async(req,res,next)=>{try{await seedDatabase({clear:true});res.json({ok:true});}catch(e){next(e);}});
module.exports=router;
