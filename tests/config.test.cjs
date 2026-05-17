const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAppConfig, normalizeBaseUrl, SUPPORTED_MODEL_TYPES, isSupportedModelType } = require('../src/utils/appConfig.cjs');

test('normalizeBaseUrl removes trailing slash', () => {
  assert.equal(normalizeBaseUrl('http://localhost:8010/'), 'http://localhost:8010');
});

test('buildAppConfig uses defaults', () => {
  const config = buildAppConfig({});
  assert.equal(config.apiBaseUrl, 'http://localhost:8010');
  assert.equal(config.defaultModelType, 'direct_wqi5');
  assert.equal(config.requestTimeoutMs, 10000);
});

test('buildAppConfig respects environment overrides', () => {
  const config = buildAppConfig({
    EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com/',
    EXPO_PUBLIC_DEFAULT_MODEL: 'lightgbm',
    EXPO_PUBLIC_REQUEST_TIMEOUT_MS: '7000',
  });
  assert.equal(config.apiBaseUrl, 'https://api.example.com');
  assert.equal(config.defaultModelType, 'lightgbm');
  assert.equal(config.requestTimeoutMs, 7000);
});

test('buildAppConfig falls back on unsupported model type', () => {
  const config = buildAppConfig({
    EXPO_PUBLIC_DEFAULT_MODEL: 'unknown_model',
  });
  assert.equal(config.defaultModelType, 'direct_wqi5');
});

test('SUPPORTED_MODEL_TYPES is exported and contains expected values', () => {
  assert.ok(Array.isArray(SUPPORTED_MODEL_TYPES));
  assert.ok(SUPPORTED_MODEL_TYPES.includes('direct_wqi5'));
  assert.ok(SUPPORTED_MODEL_TYPES.includes('lightgbm'));
});

test('isSupportedModelType works correctly', () => {
  assert.equal(isSupportedModelType('lightgbm'), true);
  assert.equal(isSupportedModelType('invalid'), false);
});
