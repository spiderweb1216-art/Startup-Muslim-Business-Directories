const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path:path.resolve(__dirname,'../../.env') });
const { mysql, baseConfig, database } = require('../config/db');

const seed = require('../seed/seed-data.json');
const TABLES = [
  'saved_items','activity_logs','media','pages','newsletter_subscribers','contact_messages',
  'claim_requests','opportunities','jobs','pitches','funding_rounds','investors','founders',
  'startups','categories','users','site_settings'
];

function validDatabaseName(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('DB_NAME may contain only letters, numbers, and underscores.');
  return name;
}

async function applySchema() {
  const dbName = validDatabaseName(database);
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');
  sql = sql.replaceAll('`crescent_startup_lab`', `\`${dbName}\``);
  const connection = await mysql.createConnection({ ...baseConfig, multipleStatements:true });
  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}

async function clearDatabase(connection) {
  await connection.query('SET FOREIGN_KEY_CHECKS=0');
  for (const table of TABLES) await connection.query(`TRUNCATE TABLE \`${table}\``);
  await connection.query('SET FOREIGN_KEY_CHECKS=1');
}

function configFor(collection) {
  const configs = {
    categories:['categories','slug','name',(r)=>({status:r.status||'Active',display_order:Number(r.order||0),featured:r.featured?1:0})],
    startups:['startups','slug','name',(r)=>({status:r.status||'Pending',owner_id:r.ownerId||null,featured:r.featured?1:0,verified:r.verified?1:0,category:r.category||null,country:r.country||null,stage:r.stage||null,total_raised:Number(r.totalRaised||0),views:Number(r.views||0)})],
    founders:['founders','slug','name',(r)=>({status:r.status||'Published',owner_id:r.ownerId||null,verified:r.verified?1:0,startup_slug:r.startupSlug||null,country:r.country||null,industry:r.industry||null})],
    investors:['investors','slug','name',(r)=>({status:r.status||'Published',owner_id:r.ownerId||null,verified:r.verified?1:0,featured:r.featured?1:0,investor_type:r.type||null,country:r.country||null})],
    rounds:['funding_rounds','id','roundName',(r)=>({status:r.status||'Published',startup_slug:r.startupSlug||null,amount:Number(r.amount||0),valuation:Number(r.valuation||0),round_date:r.date||null})],
    pitches:['pitches','id','pitchTitle',(r)=>({status:r.status||'Active',review_status:r.reviewStatus||'Pending',visibility:r.visibility||'Private',owner_id:r.ownerId||null,startup_slug:r.startupSlug||null,featured:r.featured?1:0,requested:Number(r.requested||0),views:Number(r.views||0)})],
    jobs:['jobs','id','title',(r)=>({status:r.status||'Published',startup_slug:r.startupSlug||null,location:r.location||null,arrangement:r.arrangement||null,job_type:r.type||null})],
    opportunities:['opportunities','id','title',(r)=>({status:r.status||'Published',opportunity_type:r.type||null,organization:r.organization||null,country:r.country||null,deadline:r.deadline||null,featured:r.featured?1:0})],
    claims:['claim_requests','id','requester',(r)=>({status:r.status||'Pending',owner_id:r.ownerId||null,startup_slug:r.startupSlug||null,requester_email:r.requesterEmail||r.email||null})],
    messages:['contact_messages','id','name',(r)=>({email:r.email||null,topic:r.topic||null,status:r.status||'Unread'})],
    subscribers:['newsletter_subscribers','id','email',(r)=>({email:r.email,status:r.status||'Subscribed',source:r.source||null})],
    pages:['pages','slug','title',(r)=>({status:r.status||'Draft',seo_title:r.seoTitle||null})],
    media:['media','id','name',(r)=>({media_type:r.type||null,media_url:r.url||null})],
    activity:['activity_logs','id','action',(r)=>({action:r.action,actor:r.actor||null,detail:r.detail||null,created_at:r.createdAt||new Date()})],
  };
  return configs[collection];
}

async function insertEntity(connection, collection, record) {
  const [table,idField,nameField,indexedFn] = configFor(collection);
  const row = { record_key:String(record[idField]), name:String(record[nameField]||record[idField]), data:JSON.stringify(record), ...indexedFn(record) };
  if (collection === 'activity') delete row.name;
  const columns = Object.keys(row);
  await connection.query(
    `INSERT INTO \`${table}\` (${columns.map((c)=>`\`${c}\``).join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,
    Object.values(row)
  );
}

async function seedDatabase({ clear = true } = {}) {
  const connection = await mysql.createConnection({ ...baseConfig, database });
  try {
    if (clear) await clearDatabase(connection);
    for (const user of seed.users) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      const profile = { ...user }; delete profile.password;
      await connection.query(
        `INSERT INTO users (id,name,email,password_hash,role,country,status,verified,joined_at,profile) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [user.id,user.name,user.email.toLowerCase(),passwordHash,user.role,user.country||null,user.status||'Active',user.verified?1:0,user.joinedAt||null,JSON.stringify(profile)]
      );
    }
    for (const collection of ['categories','startups','founders','investors','rounds','pitches','jobs','opportunities','claims','messages','subscribers','pages','media','activity']) {
      for (const record of seed[collection] || []) await insertEntity(connection, collection, record);
    }
    await connection.query('INSERT INTO site_settings (id,settings) VALUES (1,?)', [JSON.stringify(seed.settings)]);
    for (const item of seed.savedItems || []) {
      await connection.query('INSERT INTO saved_items (user_id,item_type,item_key) VALUES (?,?,?)', [item.userId,item.itemType,item.itemKey]);
    }
  } finally {
    await connection.end();
  }
}

async function main() {
  console.log(`\nCreating MySQL database: ${database}`);
  await applySchema();
  console.log('Schema created.');
  await seedDatabase({ clear:true });
  console.log('Seed data inserted.');
  console.log('\nDatabase setup complete.');
  console.log('Admin:   admin@startupmuslim.com / Admin123!');
  console.log('Founder: founder@startupmuslim.com / Founder123!\n');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('\nDatabase setup failed:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') console.error('Start MySQL/XAMPP and confirm DB_HOST and DB_PORT in .env.');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') console.error('Check DB_USER and DB_PASSWORD in .env.');
    process.exit(1);
  });
}

module.exports = { applySchema, seedDatabase };
