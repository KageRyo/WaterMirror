const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const { buildAppConfig } = require('../src/utils/appConfig.cjs');
const { createBackendStatusClient } = require('../src/utils/backendStatusClient.cjs');

// Exercise the settings button itself: a saved URL must not replace the draft
// candidate, and its readiness request must receive the configured budget.
test('settings tests the candidate URL using the same readiness policy as the saved backend', async () => {
  const config = buildAppConfig({ EXPO_PUBLIC_REQUEST_TIMEOUT_MS: '7000',
    EXPO_PUBLIC_READINESS_TIMEOUT_MS: '95000' });
  const calls = [];
  const fetchWithTimeout = async (url, options, timeout) => {
    calls.push({ url, timeout });
    return { ok: true, headers: { get: () => null }, json: async () => url.endsWith('/health')
      ? { status: 'ok', message: 'healthy', default_model: 'direct_wqi5' }
      : { status: 'ready', message: 'ready', default_model: 'direct_wqi5',
        dataset_available: false, dataset_required: false,
        models: [{ model_type: 'direct_wqi5', available: true }] } };
  };
  const states = [];
  let stateIndex = 0;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (value) => {
      const index = stateIndex++;
      return [index === 0 ? 'https://candidate.example.com/' : value,
        (next) => { states[index] = next; }];
    },
  };
  let saved = false;
  const mocks = {
    react: React,
    'react-native': { Button: 'Button', ScrollView: 'ScrollView', Text: 'Text',
      TextInput: 'TextInput', View: 'View', StyleSheet: { create: (styles) => styles } },
    'react-i18next': { useTranslation: () => ({ t: (key) => key }) },
    '../contexts/BackendContext': { useBackend: () => ({ url: 'https://saved.example.com',
      saveUrl: async () => { saved = true; }, loadFailed: false }) },
    './config': config,
    './utils/apiClient': { fetchWithTimeout },
    './utils/backendSettings.cjs': require('../src/utils/backendSettings.cjs'),
    './utils/backendStatusClient.cjs': { createBackendStatusClient },
  };
  const compiled = babel.transformSync(fs.readFileSync('src/BackendSettings.js', 'utf8'), {
    babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (id) => {
    assert.ok(Object.hasOwn(mocks, id), `Unexpected dependency: ${id}`);
    return mocks[id];
  } });
  const screen = module.exports.default();
  function findTestButton(node) {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'Button' && node.props.title === 'backend.test') return node;
    return node.children.map(findTestButton).find(Boolean);
  }
  await findTestButton(screen).props.onPress();
  assert.deepEqual(calls, [
    { url: 'https://candidate.example.com/api/v2/health', timeout: 3000 },
    { url: 'https://candidate.example.com/api/v2/ready', timeout: 95000 },
  ]);
  assert.equal(states[2], 'ready');
  assert.equal(saved, false);
  calls.length = 0;
  await createBackendStatusClient({ v2: (path) => `https://saved.example.com/api/v2${path}`,
    fetchWithTimeout, config }).backendStatus();
  assert.equal(calls[1].timeout, 95000);
});

test('API assessment budgets do not slow ordinary requests or health probes', async () => {
  const config = buildAppConfig({});
  const budgets = [];
  const compiled = babel.transformSync(fs.readFileSync('src/utils/apiClient.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports,
    process: { env: {} }, __DEV__: true,
    fetch: async () => ({ ok: true }),
    setTimeout: (_, timeout) => { budgets.push(timeout); },
    require: (id) => {
      if (id === '@/config') return config;
      if (id === '@react-native-async-storage/async-storage') return {};
      return require(`../src/utils/${id.slice(2)}`);
    },
  });
  const { apiClient } = module.exports;
  await apiClient.health();
  await apiClient.ready();
  await apiClient.assess({ DO: 6, BOD: 2, NH3N: 0.1, EC: 100, SS: 10, model_type: 'rf' });
  await apiClient.assessCsvSummary({ append() {} });
  await apiClient.assessCsvRows({ append() {} });
  await apiClient.getCategories();
  assert.deepEqual(budgets, [3000, 60000, 240000, 240000, 240000, 10000]);
});
