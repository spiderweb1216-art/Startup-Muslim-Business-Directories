// Client-side pagination for the public archives. Filtering happens before
// slicing so the total, page count and numbered controls stay accurate.
export const ARCHIVE_PAGE_SIZE = 60;

export function paginateRecords(records = [], requestedPage = 1, pageSize = ARCHIVE_PAGE_SIZE) {
  const safeRecords = Array.isArray(records) ? records : [];
  const size = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : ARCHIVE_PAGE_SIZE;
  const total = safeRecords.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const parsedPage = Number(requestedPage);
  const page = Number.isFinite(parsedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage)))
    : 1;
  const offset = (page - 1) * size;
  return {
    items: safeRecords.slice(offset, offset + size),
    page,
    total,
    totalPages,
    from: total === 0 ? 0 : offset + 1,
    to: Math.min(total, offset + size),
    offset,
  };
}

// Include the first/last page, near-current pages, and ellipses for long lists.
export function visiblePageNumbers(currentPage, totalPages) {
  if (totalPages < 2) return [1];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const page = Math.min(totalPages, Math.max(1, currentPage));
  const important = new Set([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1]);
  const numbers = [...important].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < numbers.length; i += 1) {
    const number = numbers[i];
    if (i > 0) {
      const gap = number - numbers[i - 1];
      if (gap === 2) result.push(number - 1);
      else if (gap > 2) result.push('ellipsis');
    }
    result.push(number);
  }
  return result;
}
