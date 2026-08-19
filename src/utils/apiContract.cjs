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

module.exports = {
  ApiContractError,
  REQUIRED_MEASUREMENTS,
  SUPPORTED_MODEL_TYPES,
  V2_ENDPOINTS,
  appendCsvModelType,
  createAssessmentRequest,
  isSupportedModelType,
  validateAssessmentResponse,
  validateCsvRowsResponse,
};
