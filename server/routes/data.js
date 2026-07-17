const express = require('express');
const crypto = require('crypto');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { COLLECTIONS, MEMBER_OWNED, STARTUP_LINKED } = require('../services/collectionConfig');
const {
  listCollection, getRecord, createRecord, updateRecord, deleteRecord, addActivity,
  getSettings, updateSettings, userOwnsStartup, applyClaimDecision,
} = require('../services/recordService');

const router = express.Router();
const ALL_COLLECTIONS = ['startups','founders','investors','rounds','opportunities','jobs','pitches','claims','categories','users','messages','subscribers','pages','media','activity'];
const REVIEW_STATUSES = new Set(['Pending','Under Review','More Information Required','Approved','Rejected','Revoked','Cancelled']);

function slugify(value='') {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function generatedId(collection) {
  return `${collection.slice(0,2)}-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
}
function ensureKnown(collection) {
  if (collection !== 'users' && !COLLECTIONS[collection]) {
    const error = new Error('Unknown data collection.'); error.status = 404; throw error;
  }
}
function actor(req) { return req.user?.name || req.user?.email || 'Website visitor'; }

async function assertOwnedStartup(req, startupSlug) {
  if (!startupSlug) {
    const error = new Error('Choose the startup this record belongs to.');
    error.status = 400;
    throw error;
  }
  if (!(await userOwnsStartup(req.user.id, startupSlug))) {
    const error = new Error('You can only manage records linked to a startup you own or have an approved claim for.');
    error.status = 403;
    throw error;
  }
}

function memberDefaults(collection, item, user) {
  const next = { ...item, ownerId:user.id };
  if (collection === 'startups') {
    next.status = 'Pending';
    next.verified = false;
    next.featured = false;
    next.claimed = false;
    next.claimVerified = false;
    next.views = Number(next.views || 0);
  }
  if (collection === 'pitches') {
    next.status = next.status === 'Closed' ? 'Closed' : 'Active';
    next.reviewStatus = 'Pending';
    next.featured = false;
    next.views = Number(next.views || 0);
  }
  if (['founders','rounds','jobs','opportunities'].includes(collection)) {
    next.status = 'Pending';
    next.featured = false;
    next.verified = false;
  }
  if (collection === 'claims') {
    next.status = 'Pending';
    next.requester = user.name;
    next.requesterEmail = user.email;
    next.submitted = next.submitted || new Date().toISOString().slice(0,10);
  }
  return next;
}

function sanitizeMemberChanges(collection, changes) {
  const next = { ...changes };
  const commonProtected = ['ownerId','featured','verified','views','addedAt','claimed','claimVerified','claimId','claimedAt','claimedByUserId'];
  commonProtected.forEach((field) => delete next[field]);

  if (collection === 'startups') {
    delete next.slug;
    delete next.status;
  }
  if (collection === 'pitches') {
    delete next.reviewStatus;
    delete next.startupSlug;
  }
  if (STARTUP_LINKED.has(collection)) {
    delete next.startupSlug;
    delete next.status;
  }
  if (collection === 'claims') {
    const allowed = {};
    if (typeof next.notes === 'string') allowed.notes = next.notes;
    if (typeof next.evidence === 'string') allowed.evidence = next.evidence;
    if (next.status === 'Cancelled') allowed.status = 'Cancelled';
    return allowed;
  }
  return next;
}

router.get('/bootstrap', optionalAuth, async (req, res, next) => {
  try {
    const values = await Promise.all(ALL_COLLECTIONS.map((name) => listCollection(name, req.user)));
    const data = Object.fromEntries(ALL_COLLECTIONS.map((name,i)=>[name,values[i]]));
    data.settings = await getSettings();
    res.json({ data, authenticated:Boolean(req.user), role:req.user?.role || null });
  } catch (error) { next(error); }
});

router.get('/collections/:collection', optionalAuth, async (req, res, next) => {
  try {
    ensureKnown(req.params.collection);
    res.json({ items:await listCollection(req.params.collection, req.user) });
  } catch (error) { next(error); }
});

router.post('/collections/:collection', requireAuth, async (req, res, next) => {
  try {
    const collection = req.params.collection; ensureKnown(collection);
    if (req.user.role !== 'Admin' && !MEMBER_OWNED.has(collection)) return res.status(403).json({ message:'You cannot create records in this section.' });
    const config = COLLECTIONS[collection];
    let item = { ...req.body };
    if (collection === 'users' && req.user.role !== 'Admin') return res.status(403).json({ message:'Administrator access is required.' });

    if (collection !== 'users') {
      if (!item[config.idField]) item[config.idField] = config.idField === 'slug' ? slugify(item[config.nameField] || generatedId(collection)) : generatedId(collection);
      if (req.user.role !== 'Admin') {
        if (STARTUP_LINKED.has(collection)) await assertOwnedStartup(req, item.startupSlug);
        if (collection === 'claims') {
          const startup = await getRecord('startups', item.startupSlug);
          if (!startup) return res.status(404).json({ message:'The startup profile no longer exists.' });
          if (startup.ownerId === req.user.id) return res.status(409).json({ message:'This startup is already assigned to your account.' });
          if (startup.ownerId && startup.ownerId !== req.user.id) return res.status(409).json({ message:'This startup profile has already been claimed.' });
          const claims = await listCollection('claims', req.user);
          const duplicate = claims.find((claim) => claim.startupSlug === item.startupSlug && ['Pending','Under Review','More Information Required','Approved'].includes(claim.status));
          if (duplicate) return res.status(409).json({ message:`You already have a ${String(duplicate.status).toLowerCase()} claim for this startup.` });
        }
        item = memberDefaults(collection, item, req.user);
      }
    }
    const created = await createRecord(collection, item);
    await addActivity(`${collection} created`, `${created[config?.nameField] || created.name || created.email || created.id} was added.`, actor(req));
    res.status(201).json({ item:created });
  } catch (error) { next(error); }
});

async function assertCanChange(req, collection, id) {
  if (req.user.role === 'Admin') return true;
  if (!MEMBER_OWNED.has(collection)) return false;
  const record = await getRecord(collection,id);
  if (!record) return false;
  if (record.ownerId === req.user.id) return true;
  if (collection === 'startups') return userOwnsStartup(req.user.id, record.slug);
  if (STARTUP_LINKED.has(collection) && record.startupSlug) return userOwnsStartup(req.user.id, record.startupSlug);
  return false;
}

router.put('/collections/:collection/:id', requireAuth, async (req, res, next) => {
  try {
    const collection=req.params.collection; ensureKnown(collection);
    if (!(await assertCanChange(req,collection,req.params.id))) return res.status(403).json({ message:'You cannot edit this record.' });

    let item;
    if (collection === 'claims' && req.user.role === 'Admin') {
      if (req.body.status && !REVIEW_STATUSES.has(req.body.status)) return res.status(400).json({ message:'Unknown claim status.' });
      item = await applyClaimDecision(req.params.id, req.body, req.user);
    } else {
      const changes = req.user.role === 'Admin' ? { ...req.body } : sanitizeMemberChanges(collection, req.body);
      if(req.user.role!=='Admin'&&collection==='pitches')changes.reviewStatus='Pending';
      if(req.user.role!=='Admin'&&['founders','rounds','jobs','opportunities'].includes(collection))changes.status='Pending';
      item = await updateRecord(collection,req.params.id,changes);
    }
    if (!item) return res.status(404).json({ message:'Record not found.' });
    await addActivity(`${collection} updated`, collection === 'claims' && item.status === 'Approved' ? `${item.startupSlug} ownership was assigned to ${item.requester}.` : `Record ${req.params.id} was updated.`, actor(req));
    res.json({ item });
  } catch(error){next(error);}
});

router.delete('/collections/:collection/:id', requireAuth, async (req,res,next)=>{
  try{
    const collection=req.params.collection; ensureKnown(collection);
    if (!(await assertCanChange(req,collection,req.params.id))) return res.status(403).json({message:'You cannot delete this record.'});
    if (req.user.role !== 'Admin' && collection === 'startups') {
      const startup = await getRecord('startups', req.params.id);
      if (startup?.claimed || startup?.status === 'Published') return res.status(403).json({ message:'Published or claimed startups cannot be deleted by members. Contact an administrator for removal.' });
    }
    const removed=await deleteRecord(collection,req.params.id);
    if(!removed)return res.status(404).json({message:'Record not found.'});
    await addActivity(`${collection} deleted`,`Record ${req.params.id} was deleted.`,actor(req));
    res.status(204).end();
  }catch(error){next(error);}
});

router.post('/collections/:collection/bulk-update', requireAuth, async(req,res,next)=>{
  try{
    const collection=req.params.collection;ensureKnown(collection);
    if(req.user.role!=='Admin')return res.status(403).json({message:'Administrator access is required.'});
    const ids=Array.isArray(req.body.ids)?req.body.ids:[];
    const items=[];
    for(const id of ids){
      const item = collection === 'claims'
        ? await applyClaimDecision(id, req.body.changes || {}, req.user)
        : await updateRecord(collection,id,req.body.changes||{});
      if(item)items.push(item);
    }
    await addActivity(`${collection} bulk updated`,`${items.length} records were updated.`,actor(req));
    res.json({items});
  }catch(error){next(error);}
});

router.post('/collections/:collection/bulk-delete', requireAuth, async(req,res,next)=>{
  try{
    const collection=req.params.collection;ensureKnown(collection);
    if(req.user.role!=='Admin')return res.status(403).json({message:'Administrator access is required.'});
    const ids=Array.isArray(req.body.ids)?req.body.ids:[];let count=0;
    for(const id of ids)if(await deleteRecord(collection,id))count++;
    await addActivity(`${collection} bulk deleted`,`${count} records were deleted.`,actor(req));
    res.json({count});
  }catch(error){next(error);}
});

router.put('/settings', requireAuth, async(req,res,next)=>{
  try{
    if(req.user.role!=='Admin')return res.status(403).json({message:'Administrator access is required.'});
    const settings=await updateSettings(req.body||{});
    await addActivity('Site settings updated','Global website settings were changed.',actor(req));
    res.json({settings});
  }catch(error){next(error);}
});

module.exports = router;
