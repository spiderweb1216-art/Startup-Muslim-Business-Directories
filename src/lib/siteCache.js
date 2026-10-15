// Site-wide refresh is coordinated through a revision stored in MySQL.
// Keep member sessions, bookmarks, saved items and other localStorage values intact.
export const SITE_CACHE_REVISION_KEY = 'csl_site_cache_revision_v1';

export function savedCacheRevision() {
  try { return window.localStorage.getItem(SITE_CACHE_REVISION_KEY) || ''; }
  catch { return ''; }
}

export function saveCacheRevision(revision) {
  if (!revision || typeof revision !== 'string') return;
  try { window.localStorage.setItem(SITE_CACHE_REVISION_KEY, revision); }
  catch { /* Storage may be disabled; refreshing still works. */ }
}

export async function purgeLocalSiteCaches() {
  const report = { cacheStoresDeleted: 0, serviceWorkersUnregistered: 0, warnings: [] };
  // Cache Storage holds origin-scoped service-worker/application response caches.
  // Browsers do not expose an API to erase their entire HTTP cache.
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const names = await window.caches.keys();
      const deleted = await Promise.all(names.map((name) => window.caches.delete(name)));
      report.cacheStoresDeleted = deleted.filter(Boolean).length;
    } catch (error) { report.warnings.push(`Cache Storage: ${error.message}`); }
  }
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const removed = await Promise.all(registrations.map((registration) => registration.unregister()));
      report.serviceWorkersUnregistered = removed.filter(Boolean).length;
    } catch (error) { report.warnings.push(`Service workers: ${error.message}`); }
  }
  return report;
}

export async function refreshSiteForCacheRevision(revision) {
  // Save before reloading to avoid a second reload on the next revision poll.
  saveCacheRevision(revision);
  const report = await purgeLocalSiteCaches();
  if (report.warnings.length) console.warn('Some application caches could not be removed:', report.warnings);
  // Unique URL defeats a cached HTML shell on most browsers/proxies. The server
  // also returns no-store for HTML and API requests.
  const url = new URL(window.location.href);
  url.searchParams.set('_site_refresh', revision);
  window.location.replace(url.toString());
  return report;
}
