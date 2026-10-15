// Investor import CSV utilities. No third-party CSV dependency.
// RFC 4180 quoted values, BOM, escaped quotes, CRLF and multiline cells.
export const INVESTOR_CSV_MAX_BYTES = 2 * 1024 * 1024;
export const INVESTOR_CSV_MAX_ROWS = 500;
export const INVESTOR_TEMPLATE_HEADERS = [
  'name', 'slug', 'type', 'country', 'status', 'description', 'website',
  'focus', 'stageFocus', 'ticketRange', 'portfolio', 'featured',
  'verified', 'halalFocus', 'email', 'phone', 'logo.mark', 'logo.color',
];

const FIELDS = [
  'name', 'slug', 'type', 'country', 'flag', 'status', 'verified', 'featured',
  'halalFocus', 'ticketRange', 'foundedYear', 'headquarters', 'aum',
  'teamSize', 'website', 'linkedin', 'email', 'phone', 'description',
  'thesis', 'focus', 'stageFocus', 'portfolio', 'portfolioCount',
  'logo', 'logo.mark', 'logo.color',
];
const normalize = (s) => String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const FIELD_MAP = new Map(FIELDS.map((key) => [normalize(key), key]));
const ALIASES = {
  investor:'name', investorname:'name', fundname:'name', firmname:'name',
  urlslug:'slug', investortype:'type', firmtype:'type', investmenttype:'type',
  location:'country', nationality:'country', firmcountry:'country',
  ticket:'ticketRange', investorticket:'ticketRange', checksize:'ticketRange',
  investmentticket:'ticketRange', typicalticket:'ticketRange',
  founded:'foundedYear', yearfounded:'foundedYear',
  hq:'headquarters', city:'headquarters', assetsundermanagement:'aum',
  employees:'teamSize', staffsize:'teamSize',
  websiteurl:'website', companywebsite:'website', linkedinurl:'linkedin',
  contactemail:'email', publicemail:'email', contactphone:'phone', publicphone:'phone',
  about:'description', summary:'description', investmentthesis:'thesis',
  sectors:'focus', sectorfocus:'focus', industryfocus:'focus', investmentfocus:'focus',
  sectorsfocus:'focus', sectorsinvested:'focus',
  stages:'stageFocus', investmentstages:'stageFocus', stagesfocus:'stageFocus',
  portfoliocompanies:'portfolio', investments:'portfolio', investedcompanies:'portfolio',
  portfoliocount:'portfolioCount', investees:'portfolio',
  logoinitials:'logo.mark', logocolor:'logo.color',
};
const BOOLEAN_FIELDS = new Set(['verified','featured','halalFocus']);
const INTEGER_FIELDS = new Set(['foundedYear','teamSize','portfolioCount']);
const ARRAY_FIELDS = new Set(['focus','stageFocus','portfolio']);
const STATUS_OPTIONS = ['Published', 'Pending', 'Draft', 'Rejected', 'Archived'];
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function parseCsvRows(text) {
  const rows = [];
  let cells = [], value = '', quote = false, closed = false, line = 1, startLine = 1;
  function finishRow() {
    cells.push(value);
    if (cells.some((v) => v.trim())) rows.push({cells, line:startLine});
    cells = []; value = ''; closed = false; startLine = line;
  }
  for (let i=0; i<text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '"' && text[i+1] === '"') { value += '"'; i++; }
      else if (ch === '"') { quote = false; closed = true; }
      else if (ch === '\r') { if (text[i+1] === '\n') i++; value += '\n'; line++; }
      else { value += ch; if (ch === '\n') line++; }
    } else if (closed) {
      if (ch === ',') { cells.push(value); value = ''; closed = false; }
      else if (ch === '\r' || ch === '\n') { if (ch === '\r' && text[i+1] === '\n') i++; line++; finishRow(); }
      else if (ch !== ' ' && ch !== '\t') throw new Error(`Line ${line}: characters after closing quote.`);
    } else if (ch === '"' && !value) { quote = true; }
    else if (ch === '"') throw new Error(`Line ${line}: unexpected quote. Quote the whole cell.`);
    else if (ch === ',') { cells.push(value); value = ''; }
    else if (ch === '\r' || ch === '\n') { if (ch === '\r' && text[i+1] === '\n') i++; line++; finishRow(); }
    else { value += ch; }
  }
  if (quote) throw new Error('The CSV has an unclosed quoted field.');
  if (cells.length || value) finishRow();
  return rows;
}

function parseValue(key, value, line) {
  if (BOOLEAN_FIELDS.has(key)) {
    if (/^(yes|true|1|y|on)$/i.test(value)) return true;
    if (/^(no|false|0|n|off)$/i.test(value)) return false;
    throw new Error(`Line ${line}: ${key} must be Yes/No or True/False.`);
  }
  if (INTEGER_FIELDS.has(key)) {
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error(`Line ${line}: ${key} must be a whole number (0 or greater).`);
    return Number(value);
  }
  if (key === 'status') {
    const matched = STATUS_OPTIONS.find((s) => s.toLowerCase() === value.toLowerCase());
    if (!matched) throw new Error(`Line ${line}: invalid status. Use ${STATUS_OPTIONS.join(', ')}.`);
    return matched;
  }
  if (ARRAY_FIELDS.has(key)) {
    let list;
    if (value.startsWith('[')) {
      try { list = JSON.parse(value); } catch { throw new Error(`Line ${line}: ${key} has invalid JSON.`); }
    } else list = value.split(/[;|]/).map((v) => v.trim()).filter(Boolean);
    if (!Array.isArray(list) || list.length > 100 || !list.every((entry) => typeof entry === 'string' && entry.trim() && entry.length <= 190)) throw new Error(`Line ${line}: ${key} needs up to 100 text values (separated with semicolons or a JSON array).`);
    return list.map((entry) => entry.trim());
  }
  if (key === 'logo') {
    let object;
    try { object = JSON.parse(value); } catch { throw new Error(`Line ${line}: logo must be a JSON object.`); }
    if (!object || typeof object !== 'object' || Array.isArray(object) || Object.keys(object).some((k) => !['mark','color'].includes(k))) throw new Error(`Line ${line}: logo supports mark and color only.`);
    return object;
  }
  return value;
}

export function parseInvestorCsv(text) {
  if (typeof text !== 'string' || new Blob([text]).size > INVESTOR_CSV_MAX_BYTES) throw new Error('Choose a CSV smaller than 2 MB.');
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('The CSV needs headers and at least one investor row.');
  if (rows.length-1 > INVESTOR_CSV_MAX_ROWS) throw new Error(`Import up to ${INVESTOR_CSV_MAX_ROWS} investors per CSV.`);
  const headers = rows[0].cells.map((v) => v.trim());
  const mapped = headers.map((h) => FIELD_MAP.get(normalize(h)) || ALIASES[normalize(h)] || null);
  if (!mapped.includes('name')) throw new Error('Missing required column: name (or Investor Name).');
  const duplicate = mapped.find((v, i) => v && mapped.indexOf(v) !== i);
  if (duplicate) throw new Error(`Repeated CSV column: ${duplicate}.`);
  const ignored = headers.filter((header, i) => header && !mapped[i]);
  const errors = [], items = [], seen = new Set();
  for (const row of rows.slice(1)) {
    if (row.cells.length !== headers.length) { errors.push(`Line ${row.line}: expected ${headers.length} cells, found ${row.cells.length}.`); continue; }
    try {
      const item = {};
      mapped.forEach((key, i) => {
        if (!key) return;
        const value = row.cells[i].trim();
        if (!value) return; // A blank CSV cell never deletes an existing value.
        const parsed = parseValue(key, value, row.line);
        if (key.startsWith('logo.')) item.logo = {...(item.logo || {}), [key.slice(5)]:parsed};
        else if (key === 'logo') item.logo = {...(item.logo || {}), ...parsed};
        else item[key] = parsed;
      });
      if (!item.name) throw new Error(`Line ${row.line}: investor name is required.`);
      item.name = item.name.trim();
      item.slug = item.slug ? item.slug.trim() : slugify(item.name);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || item.slug.length > 191) throw new Error(`Line ${row.line}: invalid investor slug "${item.slug}".`);
      if (seen.has(item.slug)) throw new Error(`Line ${row.line}: duplicate investor slug "${item.slug}" in the same file.`);
      seen.add(item.slug);
      items.push(item);
    } catch (error) { errors.push(error.message); }
  }
  return {items, errors, ignored, headerCount:headers.length};
}
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export function investorCsvTemplate() {
  return [
    INVESTOR_TEMPLATE_HEADERS.join(','),
    ['Example Ventures','example-ventures','Venture Capital','Pakistan','Draft',
      'An early-stage investment fund.','https://example.com','AI & SaaS; Islamic Finance',
      'Pre-Seed; Seed','$50K - $250K','example-startup', 'No', 'No', 'Yes',
      'hello@example.com','+92 300 0000000','EV','#2F8F5B'].map(csvCell).join(','),
  ].join('\r\n');
}
