const express=require('express');
const crypto=require('crypto');
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
    for(const user of payload.users||[]){const existing=await getUserById(user.id);if(existing){await updateRecord('users',user.id,user);}else{const generatedPassword=crypto.randomBytes(32).toString('base64url');await createRecord('users',{...user,password:user.password||generatedPassword,status:user.password?(user.status||'Active'):'Pending'});}}
    if(payload.settings)await updateSettings(payload.settings);
    if(Array.isArray(payload.savedItems)){
      await pool.query('DELETE FROM saved_items');
      for(const item of payload.savedItems){await pool.query('INSERT IGNORE INTO saved_items (user_id,item_type,item_key) VALUES (?,?,?)',[item.userId,item.itemType,item.itemKey]);}
    }
    await addActivity('Database backup imported','The administrator imported a complete JSON backup.',req.user.name);
    res.json({ok:true});
  }catch(e){try{await connection.rollback();}catch{}next(e);}finally{connection.release();}
});

router.post('/reset',async(req,res,next)=>{try{await seedDatabase({clear:true});res.json({ok:true});}catch(e){next(e);}});
module.exports=router;
