// Funding-round-only CSV import. This module intentionally does not touch
// companyCsv.js or the existing Companies import mode.
export const FUNDING_CSV_MAX_BYTES = 2 * 1024 * 1024;
export const FUNDING_CSV_MAX_ROWS = 500;
export const FUNDING_CSV_TEMPLATE_HEADERS = [
  'slug', 'roundName', 'date', 'amount', 'valuation',
  'leadInvestor', 'investors', 'stage', 'notes', 'status',
];

const VALID_COLUMNS = new Map([
  ['slug','slug'],['companyslug','slug'],['startupslug','slug'],
  ['roundname','roundName'],['round','roundName'],['fundinground','roundName'],
  ['date','date'],['rounddate','date'],
  ['amount','amount'],['amountusd','amount'],['raised','amount'],
  ['valuation','valuation'],['valuationusd','valuation'],
  ['leadinvestor','leadInvestor'],['lead','leadInvestor'],
  ['investors','investors'],['participatinginvestors','investors'],
  ['stage','stage'],['notes','notes'],['status','status'],
]);
const norm = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedStatuses = ['Published', 'Pending', 'Draft', 'Rejected', 'Archived'];

// RFC 4180-aware reader; quoted commas, escaped quotes and newlines supported.
function readCsv(source) {
  const rows = [];
  let row = [], field = '', quoted = false, closed = false, line = 1, startLine = 1;
  const push = () => {
    row.push(field);
    if (row.some((v) => v.trim())) rows.push({cells:row, line:startLine});
    row = []; field = ''; closed = false; startLine = line;
  };
  for (let i=0; i<source.length; i+=1) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i+1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else if (c === '\r') { if (source[i+1] === '\n') i++; field += '\n'; line++; }
      else { field += c; if (c === '\n') line++; }
    } else if (closed) {
      if (c === ',') { row.push(field); field=''; closed=false; }
      else if (c === '\r' || c === '\n') { if (c==='\r' && source[i+1]==='\n') i++; line++; push(); }
      else if (c !== ' ' && c !== '\t') throw new Error(`Unexpected characters after a closing quote on line ${line}.`);
    } else if (c === '"' && !field) { quoted=true; }
    else if (c === '"') throw new Error(`Unexpected quote on line ${line}.`);
    else if (c === ',') { row.push(field); field=''; }
    else if (c === '\r' || c === '\n') { if (c==='\r' && source[i+1]==='\n') i++; line++; push(); }
    else field += c;
  }
  if (quoted) throw new Error('An investor or note has an unclosed quoted CSV cell.');
  if (field !== '' || row.length) push();
  return rows;
}

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m-1, d));
  return dt.getUTCFullYear()===y && dt.getUTCMonth()===m-1 && dt.getUTCDate()===d;
};
const listNames = (raw, line) => {
  const values = raw.startsWith('[') ? (() => {
    let result;
    try { result = JSON.parse(raw); } catch { throw new Error(`Line ${line}: invalid investors JSON array.`); }
    if (!Array.isArray(result) || result.some((v) => typeof v !== 'string')) throw new Error(`Line ${line}: investors JSON must be an array of names.`);
    return result;
  })() : raw.split(/[;|]/);
  const unique = new Set();
  for (const text of values) {
    const name = text.trim().replace(/\s+/g, ' ');
    if (!name) continue;
    if (name.length > 160) throw new Error(`Line ${line}: investor name is too long (160 max).`);
    unique.add(name.toLocaleLowerCase());
  }
  if (unique.size > 40) throw new Error(`Line ${line}: at most 40 participating investors per round.`);
  return [...new Map(values.map((v) => [String(v).trim().replace(/\s+/g, ' ').toLowerCase(), String(v).trim().replace(/\s+/g, ' ')])).values()].filter(Boolean);
};
function valueFor(key, value, line) {
  if (key === 'amount' || key === 'valuation') {
    // USD values, with up to two decimal places. 0 is valid for undisclosed amounts.
    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error(`Line ${line}: ${key} must be an unsigned USD number with up to 2 decimals (no currency signs or commas).`);
    const n = Number(value);
    if (!Number.isFinite(n) || n > 9000000000000) throw new Error(`Line ${line}: ${key} exceeds the supported range.`);
    return n;
  }
  if (key === 'date' && !validDate(value)) throw new Error(`Line ${line}: date must be a real YYYY-MM-DD date.`);
  if (key === 'status') {
    const result = allowedStatuses.find((v) => v.toLowerCase() === value.toLowerCase());
    if (!result) throw new Error(`Line ${line}: status must be ${allowedStatuses.join(', ')}.`);
    return result;
  }
  if (key === 'investors') return listNames(value, line);
  const lengths = {slug:191, roundName:190, leadInvestor:160, stage:120, notes:10000};
  if (value.length > (lengths[key] || 2000)) throw new Error(`Line ${line}: ${key} is too long.`);
  return value;
}

export function parseFundingRoundsCsv(text) {
  if (typeof text !== 'string' || new Blob([text]).size > FUNDING_CSV_MAX_BYTES) throw new Error('CSV must be smaller than 2 MB.');
  const rows = readCsv(text.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('Funding CSV needs a header and at least one funding round.');
  if (rows.length - 1 > FUNDING_CSV_MAX_ROWS) throw new Error(`Import at most ${FUNDING_CSV_MAX_ROWS} funding rounds per file.`);
  const headers = rows[0].cells.map((v) => v.trim());
  const fields = headers.map((value) => VALID_COLUMNS.get(norm(value)) || null);
  if (!fields.includes('slug') || !fields.includes('roundName')) throw new Error('Required columns: slug (existing company slug) and roundName.');
  const dup = fields.find((key, i) => key && fields.indexOf(key) !== i);
  if (dup) throw new Error(`Repeated CSV column: ${dup}.`);
  const ignored = headers.filter((v,i) => v && !fields[i]);
  // Unlike the Companies importer, unknown columns are rejected so they cannot
  // silently create a false impression that company fields are being updated.
  if (ignored.length) throw new Error(`Unsupported funding CSV columns: ${ignored.join(', ')}. Use the funding template instead of a Companies export.`);
  const errors = [], items = [], identities = new Set(), byRound = new Map();
  for (const row of rows.slice(1)) {
    if (row.cells.length !== fields.length) { errors.push(`Line ${row.line}: expected ${fields.length} cells, found ${row.cells.length}.`); continue; }
    try {
      const item = {};
      fields.forEach((key,i) => {
        const raw = row.cells[i].trim();
        if (key && raw) item[key] = valueFor(key, raw, row.line);
      });
      if (!item.slug || !slugRule.test(item.slug)) throw new Error(`Line ${row.line}: valid existing company slug required.`);
      if (!item.roundName) throw new Error(`Line ${row.line}: roundName is required.`);
      const group = `${item.slug}|${item.roundName.trim().toLowerCase()}`;
      const identity = `${group}|${item.date || ''}`;
      if (identities.has(identity)) throw new Error(`Line ${row.line}: repeated company, round name and date within the file.`);
      identities.add(identity);
      if (!byRound.has(group)) byRound.set(group, []);
      byRound.get(group).push({date:item.date, line:row.line});
      items.push(item);
    } catch (error) { errors.push(error.message); }
  }
  for (const group of byRound.values()) {
    if (group.length > 1 && group.some((item) => !item.date)) errors.push(`Line ${group.find((x)=>!x.date).line}: specify a date to distinguish multiple rounds with the same company and round name.`);
  }
  return {items, errors, ignored:[], headerCount:headers.length};
}

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
export function fundingRoundsCsvTemplate() {
  return [FUNDING_CSV_TEMPLATE_HEADERS.join(','),
    ['example-company','Seed','2025-06-20','1500000','','Example Capital','Example Capital; Another Backer','Seed','Illustrative data only','Draft'].map(escapeCsv).join(',')
  ].join('\r\n');
}
