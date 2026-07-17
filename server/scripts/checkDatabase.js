const { testConnection, pool, database } = require('../config/db');
(async()=>{
  try {
    await testConnection();
    const [rows] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema=? ORDER BY table_name", [database]);
    console.log(`Connected to ${database}. ${rows.length} tables found:`);
    console.log(rows.map((r)=>r.TABLE_NAME || r.table_name).join('\n'));
    process.exit(0);
  } catch (error) {
    console.error('Database check failed:', error.message);
    process.exit(1);
  }
})();
