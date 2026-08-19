const REQUIRED_MEASUREMENTS = ['DO', 'BOD', 'NH3N', 'EC', 'SS'];

const SUPPORTED_MODEL_TYPES = [
  'direct_wqi5',
  'lr',
  'mpr',
  'svm',
  'rf',
  'xgboost',
  'lightgbm',
];

const V2_ENDPOINTS = Object.freeze({
  health: '/health',
  ready: '/ready',
  models: '/models',
  assessment: '/assessment',
  csvSummary: '/assessment/csv/summary',
  csvRows: '/assessment/csv/rows',
  percentile: '/percentile',
  categories: '/categories',
});

class ApiContractError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiContractError';
  }
}

class RequestTimeoutError extends Error {
  constructor() {
    super('The request timed out.');
    this.name = 'RequestTimeoutError';
  }
}

class BackendClientError extends Error {
  constructor(kind, requestId = null) {
    super(kind);
    this.name = 'BackendClientError';
    this.kind = kind;
    this.requestId = requestId;
  }
}

const BACKEND_ERROR_KINDS = {
  invalid_assessment_input: 'invalid_input',
  invalid_csv: 'invalid_csv',
  model_unavailable: 'model_unavailable',
  dataset_unavailable: 'backend_not_ready',
  invalid_configuration: 'backend_not_ready',
  internal_error: 'backend_failure',
};

function isSupportedModelType(modelType) {
  return SUPPORTED_MODEL_TYPES.includes(modelType);
}

function assertSupportedModelType(modelType) {
  if (!isSupportedModelType(modelType)) {
    throw new ApiContractError('Choose a supported assessment model before submitting.');
  }
}

function createAssessmentRequest(input) {
  if (!input || typeof input !== 'object') {
    throw new ApiContractError('Enter valid numeric values for all required measurements.');
  }

  const request = {};
  for (const measurement of REQUIRED_MEASUREMENTS) {
    const value = input[measurement];
    if (!Number.isFinite(value)) {
      throw new ApiContractError('Enter valid numeric values for all required measurements.');
    }
    request[measurement] = value;
  }

  assertSupportedModelType(input.model_type);
  request.model_type = input.model_type;
  return request;
}

function appendCsvModelType(formData, modelType) {
  if (!formData || typeof formData.append !== 'function') {
    throw new ApiContractError('Prepare a CSV file before submitting it.');
  }
  assertSupportedModelType(modelType);
  formData.append('model_type', modelType);
  return formData;
}

function invalidResponse() {
  return new ApiContractError('The backend returned an incompatible assessment response.');
}

function hasRequiredAssessmentFields(payload) {
  return REQUIRED_MEASUREMENTS.every(
    (measurement) => typeof payload.assessment[measurement] === 'string'
  );
}

function validateAssessmentResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw invalidResponse();
  }

  if (
    !Number.isFinite(payload.score) ||
    payload.score < 0 ||
    payload.score > 100 ||
    typeof payload.category !== 'string' ||
    typeof payload.rating_range !== 'string' ||
    !isSupportedModelType(payload.model_type) ||
    !Number.isFinite(payload.latency_ms) ||
    payload.latency_ms < 0 ||
    !payload.assessment ||
    typeof payload.assessment !== 'object' ||
    !hasRequiredAssessmentFields(payload) ||
    !Array.isArray(payload.warnings) ||
    !payload.warnings.every((warning) => typeof warning === 'string')
  ) {
    throw invalidResponse();
  }

  return payload;
}

function validateCsvRowsResponse(payload) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !Array.isArray(payload.scores) ||
    !payload.scores.every((score) => Number.isFinite(score) && score >= 0 && score <= 100) ||
    !isSupportedModelType(payload.model_type) ||
    !Number.isFinite(payload.latency_ms) ||
    payload.latency_ms < 0
  ) {
    throw invalidResponse();
  }

  return payload;
}

function getRequestId(response) {
  return response && response.headers && typeof response.headers.get === 'function'
    ? response.headers.get('X-Request-ID')
    : null;
}

async function parseBackendError(response, payloadOverride) {
  const requestId = getRequestId(response);
  try {
    const payload = payloadOverride === undefined ? await response.json() : payloadOverride;
    const kind = BACKEND_ERROR_KINDS[payload && payload.error && payload.error.code];
    if (kind) {
      return new BackendClientError(kind, requestId);
    }
  } catch {
    // Non-JSON error bodies are intentionally not surfaced to users.
  }
  return new BackendClientError('backend_failure', requestId);
}

function normalizeClientError(error) {
  if (error instanceof BackendClientError) {
    return error;
  }
  if (error instanceof RequestTimeoutError) {
    return new BackendClientError('timeout');
  }
  if (error instanceof ApiContractError) {
    return new BackendClientError('invalid_response');
  }
  return new BackendClientError('backend_unreachable');
}

function validateHealthResponse(payload) {
  if (!payload || payload.status !== 'ok' || typeof payload.default_model !== 'string') {
    throw invalidResponse();
  }
  return payload;
}

function validateReadinessResponse(payload) {
  if (
    !payload ||
    !['ready', 'not_ready'].includes(payload.status) ||
    typeof payload.default_model !== 'string' ||
    typeof payload.dataset_available !== 'boolean' ||
    typeof payload.dataset_required !== 'boolean' ||
    !Array.isArray(payload.models) ||
    !payload.models.every((model) => isSupportedModelType(model.model_type) && typeof model.available === 'boolean')
  ) {
    throw invalidResponse();
  }
  return payload;
}

async function getBackendStatus(client) {
  let healthResponse;
  try {
    healthResponse = await client.health();
  } catch (error) {
    return { state: normalizeClientError(error).kind, requestId: null };
  }
  if (!healthResponse.ok) {
    const error = await parseBackendError(healthResponse);
    return { state: error.kind, requestId: error.requestId };
  }
  try {
    validateHealthResponse(await healthResponse.json());
  } catch (error) {
    return { state: normalizeClientError(error).kind, requestId: getRequestId(healthResponse) };
  }

  let readinessResponse;
  try {
    readinessResponse = await client.ready();
  } catch (error) {
    return { state: normalizeClientError(error).kind, requestId: null };
  }
  let readinessPayload;
  let readiness;
  try {
    readinessPayload = await readinessResponse.json();
    readiness = validateReadinessResponse(readinessPayload);
  } catch (error) {
    if (!readinessResponse.ok) {
      const responseError = await parseBackendError(readinessResponse, readinessPayload);
      return { state: responseError.kind, requestId: responseError.requestId };
    }
    return { state: normalizeClientError(error).kind, requestId: getRequestId(readinessResponse) };
  }
  if (readiness.status === 'not_ready') {
    return { state: 'backend_not_ready', requestId: getRequestId(readinessResponse) };
  }
  if (!readinessResponse.ok) {
    const error = await parseBackendError(readinessResponse, readinessPayload);
    return { state: error.kind, requestId: error.requestId };
  }
  return { state: 'ready', requestId: getRequestId(readinessResponse) };
}

module.exports = {
  ApiContractError,
  BackendClientError,
  REQUIRED_MEASUREMENTS,
  RequestTimeoutError,
  SUPPORTED_MODEL_TYPES,
  V2_ENDPOINTS,
  appendCsvModelType,
  createAssessmentRequest,
  getBackendStatus,
  getRequestId,
  isSupportedModelType,
  normalizeClientError,
  parseBackendError,
  validateAssessmentResponse,
  validateCsvRowsResponse,
  validateHealthResponse,
  validateReadinessResponse,
};
