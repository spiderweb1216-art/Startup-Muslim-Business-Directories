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
  'claimVerified','founderSlugs','similarSlugs','productImages','products',
  'overviewBlocks','logo','contact',
]);
const COMPANY_BOOL = new Set(['featured','verified','hiring','pitching','openToFunding','claimed','claimVerified']);
const COMPANY_NUM = new Set(['foundedYear','teamSize','totalRaised','views']);
const COMPANY_ARRAY = new Set(['founderSlugs','similarSlugs','productImages','products','overviewBlocks']);
const COMPANY_STATUS = new Set(['Published','Pending','Draft','Rejected','Archived']);
const logoFields = new Set(['mark','color']);
const contactFields = new Set(['public','name','role','email','phone','whatsapp','address','linkedin','note','demo']);
const companySlug = (name) => String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const plainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const csvError = (message) => Object.assign(new Error(message), {status:400});

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

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let created = 0, updated = 0, skipped = 0;
    const cfg = COLLECTIONS.startups;
    for (const item of normalized) {
      const [found] = await connection.query('SELECT data FROM startups WHERE record_key=? FOR UPDATE',[item.slug]);
      const existing = found.length ? JSON.parse(found[0].data) : null;
      if (existing && onDuplicate === 'skip') { skipped += 1; continue; }
      const merged = {
        ...(existing || {}), ...item,
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
    const action = {id:`a-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,action:'Companies imported from CSV',detail:`${created} created, ${updated} updated, ${skipped} skipped.`,actor:req.user.name || req.user.email || 'Admin',createdAt:new Date().toISOString()};
    const activityRow = {record_key:action.id,action:action.action,actor:action.actor,detail:action.detail,data:JSON.stringify(action),created_at:new Date(action.createdAt)};
    await connection.query(`INSERT INTO activity_logs (${Object.keys(activityRow).map((key)=>`\`${key}\``).join(',')}) VALUES (?,?,?,?,?,?)`,Object.values(activityRow));
    await connection.commit();
    res.json({ok:true,created,updated,skipped,total:normalized.length});
  } catch (error) {
    if (connection) try { await connection.rollback(); } catch (_) {}
    next(error);
  } finally { if (connection) connection.release(); }
});

function nameInitials(name) {
  return String(name || 'Company').trim().split(/\s+/).slice(0,2).map((part)=>part.slice(0,1)).join('').toUpperCase();
}

router.post('/reset',async(req,res,next)=>{try{await seedDatabase({clear:true});res.json({ok:true});}catch(e){next(e);}});
module.exports=router;
