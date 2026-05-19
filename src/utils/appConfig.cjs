function normalizeBaseUrl(url) {
  return (url || 'http://localhost:8001').replace(/\/+$/, '');
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Supported model types for WQI5 assessment.
 * Must be kept in sync with WQSurrogateModels backend.
 */
const SUPPORTED_MODEL_TYPES = [
  'direct_wqi5',
  'lr',
  'mpr',
  'svm',
  'rf',
  'xgboost',
  'lightgbm',
];

function isSupportedModelType(modelType) {
  return SUPPORTED_MODEL_TYPES.includes(modelType);
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

  return {
    apiBaseUrl: normalizeBaseUrl(env.EXPO_PUBLIC_API_BASE_URL),
    defaultModelType: isSupportedModelType(defaultModelType) ? defaultModelType : 'direct_wqi5',
    requestTimeoutMs: parseInteger(env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, 10000),
    supportedModelTypes: SUPPORTED_MODEL_TYPES,
  };
}

module.exports = {
  buildAppConfig,
  normalizeBaseUrl,
  SUPPORTED_MODEL_TYPES,
  isSupportedModelType,
};
