const { SUPPORTED_MODEL_TYPES, isSupportedModelType } = require('./apiContract.cjs');

function normalizeBaseUrl(url) {
  return (url || 'http://localhost:8001').replace(/\/+$/, '');
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildAppConfig(env) {
  const defaultModelType = env.EXPO_PUBLIC_DEFAULT_MODEL || 'direct_wqi5';

  // Warn in development if an unsupported model type is configured
  if (!isSupportedModelType(defaultModelType)) {
    console.warn(
      `[WaterMirror] Unsupported defaultModelType: "${defaultModelType}". ` +
      `Falling back to "direct_wqi5". Supported: ${SUPPORTED_MODEL_TYPES.join(', ')}`
    );
  }

  const requestTimeoutMs = parseInteger(env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, 10000);
  // Keep an explicitly configured general timeout as the fallback for existing builds.
  const hasGeneralOverride = parseInteger(env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, null) !== null;

  return {
    apiBaseUrl: normalizeBaseUrl(env.EXPO_PUBLIC_API_BASE_URL),
    defaultModelType: isSupportedModelType(defaultModelType) ? defaultModelType : 'direct_wqi5',
    requestTimeoutMs,
    readinessTimeoutMs: parseInteger(env.EXPO_PUBLIC_READINESS_TIMEOUT_MS, hasGeneralOverride ? requestTimeoutMs : 60000),
    assessmentTimeoutMs: parseInteger(env.EXPO_PUBLIC_ASSESSMENT_TIMEOUT_MS, hasGeneralOverride ? requestTimeoutMs : 240000),
    supportedModelTypes: SUPPORTED_MODEL_TYPES,
  };
}

module.exports = {
  buildAppConfig,
  normalizeBaseUrl,
  SUPPORTED_MODEL_TYPES,
  isSupportedModelType,
};
