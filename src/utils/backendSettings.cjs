const STORAGE_KEY = 'watermirror-backend-url';

function normalizeBackendUrl(value) {
  const input = String(value || '').trim().replace(/\/+$/, '');
  // React Native's URL parser accepts invalid hosts and ports that browsers reject.
  const address = /^https?:\/\/(\[[0-9a-f:.]+\]|[a-z0-9.-]+)(?::(\d{1,5}))?(\/[^?#\s\\]*)?$/i.exec(input);
  if (!address || (address[2] && (Number(address[2]) < 1 || Number(address[2]) > 65535))) {
    throw new Error('Enter a valid HTTP or HTTPS backend address and port');
  }
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname ||
      url.username || url.password || url.search || url.hash ||
      /\/api\/v2\/?$/.test(url.pathname)) {
    throw new Error('Enter an HTTP or HTTPS service root without /api/v2');
  }
  return url.href.replace(/\/+$/, '');
}

function createBackendUrlStore({ storage, defaultUrl = '' }) {
  let currentUrl = defaultUrl ? normalizeBackendUrl(defaultUrl) : '';
  return {
    getUrl: () => currentUrl,
    async load() {
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        try { currentUrl = normalizeBackendUrl(stored); } catch { /* Keep the default for invalid saved settings. */ }
      }
      return currentUrl;
    },
    async save(value) {
      const normalized = normalizeBackendUrl(value);
      await storage.setItem(STORAGE_KEY, normalized);
      currentUrl = normalized;
      return currentUrl;
    },
    v2(path = '') {
      if (!currentUrl) throw new Error('Configure a backend address first');
      return `${currentUrl}/api/v2${path && !path.startsWith('/') ? '/' : ''}${path}`;
    },
  };
}

module.exports = { normalizeBackendUrl, createBackendUrlStore };
