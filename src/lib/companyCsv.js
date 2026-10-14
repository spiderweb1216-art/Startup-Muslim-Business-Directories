// Company CSV import: no external parser dependency; supports RFC 4180 quoted cells,
// embedded commas, escaped quotes, UTF-8 BOM and multiline values.
export const COMPANY_CSV_MAX_BYTES = 2 * 1024 * 1024;
export const COMPANY_CSV_MAX_ROWS = 500;

export const COMPANY_TEMPLATE_HEADERS = [
  'name', 'slug', 'tagline', 'category', 'country', 'hq', 'stage',
  'website', 'description', 'status', 'foundedYear', 'teamSize',
  'totalRaised', 'featured', 'verified', 'contact.email', 'contact.phone',
];

const SIMPLE_FIELDS = [
  'name', 'slug', 'id', 'tagline', 'category', 'country', 'flag', 'hq',
  'stage', 'fundingStage', 'businessModel', 'status', 'website', 'banner',
  'description', 'revenue', 'users', 'growth', 'addedAt', 'ownerId',
  'foundedYear', 'teamSize', 'totalRaised', 'views', 'featured', 'verified',
  'hiring', 'pitching', 'openToFunding', 'claimed', 'claimVerified',
  'founderSlugs', 'similarSlugs', 'productImages', 'products', 'overviewBlocks',
  'logo', 'contact', 'updatedAt',
];
const DOT_FIELDS = [
  'logo.mark', 'logo.color', 'contact.public', 'contact.name', 'contact.role',
  'contact.email', 'contact.phone', 'contact.whatsapp', 'contact.address',
  'contact.linkedin', 'contact.note',
];
const normalized = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const FIELDS = new Map([...SIMPLE_FIELDS, ...DOT_FIELDS].map((key) => [normalized(key), key]));
const ALIASES = {
  company:'name', companyname:'name', startupname:'name', businessname:'name',
  urlslug:'slug', industry:'category', sector:'category', headquarters:'hq',
  companywebsite:'website', url:'website', founded:'foundedYear',
  yearfounded:'foundedYear', employees:'teamSize', amountraised:'totalRaised',
  totalraisedusd:'totalRaised', summary:'description',
  contactemail:'contact.email', contactphone:'contact.phone',
  logoinitials:'logo.mark', logocolor:'logo.color',
};
const BOOLEAN_FIELDS = new Set(['featured', 'verified', 'hiring', 'pitching', 'openToFunding', 'claimed', 'claimVerified', 'contact.public']);
const NUMBER_FIELDS = new Set(['totalRaised', 'foundedYear', 'teamSize', 'views']);
const ARRAY_FIELDS = new Set(['founderSlugs', 'similarSlugs', 'productImages', 'products', 'overviewBlocks']);
const OBJECT_FIELDS = new Set(['contact', 'logo']);
const STATUS = ['Published', 'Pending', 'Draft', 'Rejected', 'Archived'];
const slugify = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function parseCells(source) {
  const rows = [];
  let cells = [], cell = '', quoted = false, afterQuote = false, rowStart = 1, line = 1;
  const pushRow = () => { cells.push(cell); if (cells.some((v) => v.trim() !== '')) rows.push({ cells, line:rowStart }); cells = []; cell = ''; rowStart = line; afterQuote = false; };
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i+1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') { quoted = false; afterQuote = true; }
      else if (char === '\r') { if (source[i+1] === '\n') i += 1; cell += '\n'; line += 1; }
      else { cell += char; if (char === '\n') line += 1; }
    } else if (afterQuote) {
      if (char === ',') { cells.push(cell); cell = ''; afterQuote = false; }
      else if (char === '\r' || char === '\n') { if (char === '\r' && source[i+1] === '\n') i += 1; line += 1; pushRow(); }
      else if (char !== ' ' && char !== '\t') throw new Error(`Invalid characters after a closing quote on line ${line}.`);
    } else if (char === '"' && !cell) { quoted = true; }
    else if (char === '"') { throw new Error(`Unexpected quote on line ${line}. Enclose the entire cell in double quotes.`); }
    else if (char === ',') { cells.push(cell); cell = ''; }
    else if (char === '\r' || char === '\n') { if (char === '\r' && source[i+1] === '\n') i += 1; line += 1; pushRow(); }
    else { cell += char; }
  }
  if (quoted) throw new Error('The CSV has an unclosed quoted value.');
  if (cell !== '' || cells.length) pushRow();
  return rows;
}

function parseValue(key, raw, line) {
  if (BOOLEAN_FIELDS.has(key)) {
    if (/^(true|1|yes|y|on)$/i.test(raw)) return true;
    if (/^(false|0|no|n|off)$/i.test(raw)) return false;
    throw new Error(`Line ${line}: ${key} must be Yes/No or True/False.`);
  }
  if (NUMBER_FIELDS.has(key)) {
    const value = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(value) || value < 0 || (key !== 'totalRaised' && !Number.isInteger(value))) throw new Error(`Line ${line}: ${key} must be a valid nonnegative number.`);
    return value;
  }
  if (key === 'status') {
    const status = STATUS.find((value) => value.toLowerCase() === raw.toLowerCase());
    if (!status) throw new Error(`Line ${line}: status must be ${STATUS.join(', ')}.`);
    return status;
  }
  if (ARRAY_FIELDS.has(key) || OBJECT_FIELDS.has(key)) {
    if (raw.startsWith('[') || raw.startsWith('{')) {
      let parsed;
      try { parsed = JSON.parse(raw); } catch { throw new Error(`Line ${line}: ${key} has invalid JSON.`); }
      if (ARRAY_FIELDS.has(key) ? !Array.isArray(parsed) : !parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error(`Line ${line}: ${key} must be ${ARRAY_FIELDS.has(key) ? 'a JSON array' : 'a JSON object'}.`);
      return parsed;
    }
    if (key === 'founderSlugs' || key === 'similarSlugs' || key === 'productImages') return raw.split(/[;|]/).map((v) => v.trim()).filter(Boolean);
    throw new Error(`Line ${line}: ${key} must contain JSON.`);
  }
  return raw;
}

export function parseCompanyCsv(text) {
  if (typeof text !== 'string' || new Blob([text]).size > COMPANY_CSV_MAX_BYTES) throw new Error('Choose a CSV smaller than 2 MB.');
  const rows = parseCells(text.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('The CSV needs a header and at least one company row.');
  if (rows.length - 1 > COMPANY_CSV_MAX_ROWS) throw new Error(`Import up to ${COMPANY_CSV_MAX_ROWS} companies per file.`);
  const originalHeaders = rows[0].cells.map((v) => v.trim());
  const mapped = originalHeaders.map((header) => FIELDS.get(normalized(header)) || ALIASES[normalized(header)] || null);
  if (!mapped.includes('name')) throw new Error('Missing company name column. Use "name" or "Company Name".');
  const duplicates = mapped.filter((key, index) => key && mapped.indexOf(key) !== index);
  if (duplicates.length) throw new Error(`Repeated CSV column: ${duplicates[0]}.`);
  const ignored = originalHeaders.filter((header, index) => !mapped[index] && header);
  const errors = [], items = [], seen = new Set();
  for (const row of rows.slice(1)) {
    if (row.cells.length !== mapped.length) { errors.push(`Line ${row.line}: expected ${mapped.length} columns but found ${row.cells.length}.`); continue; }
    try {
      const item = {};
      mapped.forEach((key, index) => {
        if (!key || ['id', 'updatedAt'].includes(key)) return;
        const raw = row.cells[index].trim();
        if (!raw) return; // Blank cells do not erase existing database values.
        const value = parseValue(key, raw, row.line);
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          item[parent] = { ...(item[parent] || {}), [child]:value };
        } else { item[key] = value; }
      });
      if (!item.name || typeof item.name !== 'string') throw new Error(`Line ${row.line}: company name is required.`);
      item.name = item.name.trim();
      item.slug = item.slug ? String(item.slug).trim() : slugify(item.name);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error(`Line ${row.line}: invalid URL slug "${item.slug}".`);
      if (seen.has(item.slug)) throw new Error(`Line ${row.line}: duplicate slug "${item.slug}" within the file.`);
      seen.add(item.slug);
      items.push(item);
    } catch (error) { errors.push(error.message); }
  }
  return { items, errors, ignored, headerCount:originalHeaders.length };
}

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
export const companyCsvTemplate = () => [
  COMPANY_TEMPLATE_HEADERS.join(','),
  ['Example Company', 'example-company', 'A short tagline', 'AI & SaaS', 'Pakistan', 'Lahore', 'Seed',
    'https://example.com', 'A brief company description', 'Draft', '2025', '8', '250000',
    'No', 'No', 'hello@example.com', '+92 300 0000000'].map(csvCell).join(','),
].join('\r\n');
