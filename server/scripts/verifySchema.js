const fs = require('fs');
const path = require('path');
const { COLLECTIONS } = require('../services/collectionConfig');
const seed = require('../seed/seed-data.json');

function parseSchemaColumns(sql) {
  const tables = new Map();
  const tablePattern = /CREATE TABLE IF NOT EXISTS\s+`?(\w+)`?\s*\(([\s\S]*?)\)\s*ENGINE=/gi;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(sql))) {
    const [, tableName, body] = tableMatch;
    const columns = new Set();
    for (const rawLine of body.split(/\r?\n/)) {
      const line = rawLine.trim().replace(/,$/, '');
      if (!line || /^(PRIMARY|UNIQUE|CONSTRAINT|INDEX|KEY|FOREIGN)\b/i.test(line)) continue;
      const columnMatch = line.match(/^`?(\w+)`?\s+/);
      if (columnMatch) columns.add(columnMatch[1]);
    }
    tables.set(tableName, columns);
  }
  return tables;
}

function fail(message) {
  console.error(`Schema verification failed: ${message}`);
  process.exit(1);
}

const schemaPath = path.resolve(__dirname, '../../database/hostinger-schema.sql');
const tables = parseSchemaColumns(fs.readFileSync(schemaPath, 'utf8'));
if (tables.size !== 18) fail(`expected 18 tables, found ${tables.size}`);

const seedKeyByCollection = {
  categories: 'categories', startups: 'startups', founders: 'founders', investors: 'investors',
  rounds: 'rounds', pitches: 'pitches', jobs: 'jobs', opportunities: 'opportunities',
  claims: 'claims', messages: 'messages', subscribers: 'subscribers', pages: 'pages',
  media: 'media', activity: 'activity',
};

for (const [collection, config] of Object.entries(COLLECTIONS)) {
  const tableColumns = tables.get(config.table);
  if (!tableColumns) fail(`table ${config.table} is missing for collection ${collection}`);
  const sample = seed[seedKeyByCollection[collection]]?.[0] || {
    [config.idField]: `verify-${collection}`,
    [config.nameField]: `Verify ${collection}`,
  };
  const required = new Set(['record_key', 'name', 'data', ...Object.keys(config.indexed(sample))]);
  if (collection === 'activity') required.delete('name');
  const missing = [...required].filter((column) => !tableColumns.has(column));
  if (missing.length) fail(`${config.table} is missing columns required by ${collection}: ${missing.join(', ')}`);
}

const directRequirements = {
  users: ['id','name','email','password_hash','role','country','status','verified','joined_at','profile'],
  site_settings: ['id','settings'],
  saved_items: ['user_id','item_type','item_key'],
};
for (const [table, required] of Object.entries(directRequirements)) {
  const columns = tables.get(table);
  if (!columns) fail(`table ${table} is missing`);
  const missing = required.filter((column) => !columns.has(column));
  if (missing.length) fail(`${table} is missing columns: ${missing.join(', ')}`);
}

console.log('Database schema verification passed: 18 tables and all application write columns match.');
