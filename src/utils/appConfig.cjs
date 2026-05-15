function normalizeBaseUrl(url) {
  return (url || 'http://localhost:8001').replace(/\/+$/, '');
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildAppConfig(env) {
  return {
    apiBaseUrl: normalizeBaseUrl(env.EXPO_PUBLIC_API_BASE_URL),
    defaultModelType: env.EXPO_PUBLIC_DEFAULT_MODEL || 'direct_wqi5',
    requestTimeoutMs: parseInteger(env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, 10000),
  };
}

module.exports = {
  buildAppConfig,
  normalizeBaseUrl,
};
