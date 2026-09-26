const makeId = (prefix = 'overview') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const OVERVIEW_BLOCK_TYPES = ['heading', 'paragraph', 'image', 'gallery'];

export function createOverviewBlock(type = 'paragraph') {
  const id = makeId(type);
  if (type === 'heading') return { id, type, text: '', level: 2 };
  if (type === 'image') return { id, type, src: '', alt: '', caption: '', size: 'wide' };
  if (type === 'gallery') return { id, type, images: [], columns: 2 };
  return { id, type: 'paragraph', text: '' };
}

const cleanText = (value, max = 12000) => String(value || '').slice(0, max);

export function normalizeOverviewBlocks(blocks = []) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter((block) => block && OVERVIEW_BLOCK_TYPES.includes(block.type))
    .slice(0, 50)
    .map((block, index) => {
      const base = { id: String(block.id || `overview-${index + 1}`), type: block.type };
      if (block.type === 'heading') {
        return { ...base, text: cleanText(block.text, 500), level: [2, 3, 4].includes(Number(block.level)) ? Number(block.level) : 2 };
      }
      if (block.type === 'paragraph') return { ...base, text: cleanText(block.text) };
      if (block.type === 'image') {
        return {
          ...base,
          src: cleanText(block.src, 10_000_000),
          alt: cleanText(block.alt, 500),
          caption: cleanText(block.caption, 1000),
          size: ['medium', 'wide', 'full'].includes(block.size) ? block.size : 'wide',
        };
      }
      const images = Array.isArray(block.images) ? block.images : [];
      return {
        ...base,
        columns: [2, 3, 4].includes(Number(block.columns)) ? Number(block.columns) : 2,
        images: images.slice(0, 12).map((image, imageIndex) => typeof image === 'string'
          ? { id: `${base.id}-image-${imageIndex + 1}`, src: image, alt: '', caption: '' }
          : {
              id: String(image?.id || `${base.id}-image-${imageIndex + 1}`),
              src: cleanText(image?.src, 10_000_000),
              alt: cleanText(image?.alt, 500),
              caption: cleanText(image?.caption, 1000),
            }).filter((image) => image.src),
      };
    });
}

export function buildLegacyOverviewBlocks(startup = {}) {
  const blocks = [];
  if (startup.description) {
    blocks.push({ id: 'legacy-heading', type: 'heading', text: `What ${startup.name || 'this company'} does`, level: 2 });
    blocks.push({ id: 'legacy-description', type: 'paragraph', text: String(startup.description) });
  }
  const images = Array.isArray(startup.productImages) ? startup.productImages.filter(Boolean) : [];
  if (images.length === 1) {
    blocks.push({ id: 'legacy-image', type: 'image', src: images[0], alt: startup.name || '', caption: '', size: 'wide' });
  } else if (images.length > 1) {
    blocks.push({
      id: 'legacy-gallery',
      type: 'gallery',
      columns: Math.min(3, images.length),
      images: images.slice(0, 12).map((src, index) => ({ id: `legacy-gallery-${index + 1}`, src, alt: `${startup.name || 'Company'} image ${index + 1}`, caption: '' })),
    });
  }
  return blocks;
}

export function getOverviewBlocks(startup = {}) {
  const explicit = normalizeOverviewBlocks(startup.overviewBlocks);
  return explicit.length ? explicit : buildLegacyOverviewBlocks(startup);
}

export function overviewSummary(blocks = [], fallback = '') {
  const normalized = normalizeOverviewBlocks(blocks);
  const paragraph = normalized.find((block) => block.type === 'paragraph' && String(block.text || '').trim());
  if (paragraph) return String(paragraph.text).trim().slice(0, 2000);
  const heading = normalized.find((block) => block.type === 'heading' && String(block.text || '').trim());
  return heading ? String(heading.text).trim().slice(0, 2000) : String(fallback || '').slice(0, 2000);
}
