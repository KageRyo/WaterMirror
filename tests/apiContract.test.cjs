const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  ApiContractError,
  SUPPORTED_MODEL_TYPES,
  V2_ENDPOINTS,
  appendCsvModelType,
  createAssessmentRequest,
  validateAssessmentResponse,
  validateCsvRowsResponse,
} = require('../src/utils/apiContract.cjs');

const fixtures = path.join(__dirname, 'fixtures', 'wq-v2');

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtures, name), 'utf-8'));
}

test('v2 endpoints and supported model types match the WQSurrogateModels contract', () => {
  assert.deepEqual(V2_ENDPOINTS, {
    health: '/health',
    ready: '/ready',
    models: '/models',
    assessment: '/assessment',
    csvSummary: '/assessment/csv/summary',
    csvRows: '/assessment/csv/rows',
    percentile: '/percentile',
    categories: '/categories',
  });
  assert.deepEqual(SUPPORTED_MODEL_TYPES, [
    'direct_wqi5',
    'lr',
    'mpr',
    'svm',
    'rf',
    'xgboost',
    'lightgbm',
  ]);
});

test('single assessment request preserves the documented WQ v2 payload', () => {
  const request = loadFixture('assessment-request.json');
  assert.deepEqual(createAssessmentRequest(request), request);
});

test('single assessment request rejects malformed measurements and model values before fetch', () => {
  const request = loadFixture('assessment-request.json');
  assert.throws(
    () => createAssessmentRequest({ ...request, DO: Number.NaN }),
    (error) => error instanceof ApiContractError && error.message === 'Enter valid numeric values for all required measurements.'
  );
  assert.throws(
    () => createAssessmentRequest({ ...request, model_type: 'unsupported' }),
    (error) => error instanceof ApiContractError && error.message === 'Choose a supported assessment model before submitting.'
  );
});

test('CSV assessment request appends a supported model value', () => {
  const appended = [];
  const formData = { append: (...args) => appended.push(args) };

  assert.equal(appendCsvModelType(formData, 'lightgbm'), formData);
  assert.deepEqual(appended, [['model_type', 'lightgbm']]);
  assert.throws(() => appendCsvModelType(formData, 'unsupported'), ApiContractError);
});

test('assessment response preserves all fields consumed by the result UI', () => {
  const response = loadFixture('assessment-response.json');
  assert.equal(validateAssessmentResponse(response), response);
});

test('CSV row-level response accepts the documented WQ v2 shape', () => {
  const response = loadFixture('csv-rows-response.json');
  assert.equal(validateCsvRowsResponse(response), response);
});

test('malformed backend responses fail in a controlled way without exposing payload details', () => {
  const malformed = loadFixture('malformed-assessment-response.json');
  assert.throws(
    () => validateAssessmentResponse(malformed),
    (error) => error instanceof ApiContractError && error.message === 'The backend returned an incompatible assessment response.'
  );
  assert.throws(
    () => validateCsvRowsResponse({ scores: ['not-a-score'], model_type: 'direct_wqi5', latency_ms: 1 }),
    (error) => error instanceof ApiContractError && error.message === 'The backend returned an incompatible assessment response.'
  );
});
