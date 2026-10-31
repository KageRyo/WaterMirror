const { getBackendStatus, V2_ENDPOINTS } = require('./apiContract.cjs');

// Resolve the URL at request time for saved backends, or bind a candidate URL
// without saving it when the user tests their settings.
function createBackendStatusClient({ v2, fetchWithTimeout, config }) {
  const client = {
    health: () => fetchWithTimeout(v2('/health'), {}, 3000),
    ready: () => fetchWithTimeout(v2(V2_ENDPOINTS.ready), {}, config.readinessTimeoutMs),
  };
  return { ...client, backendStatus: () => getBackendStatus(client) };
}

module.exports = { createBackendStatusClient };
