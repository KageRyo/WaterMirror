const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeBackendUrl, createBackendUrlStore } = require('../src/utils/backendSettings.cjs');

function storage(initial = null) {
  let saved = initial;
  return { getItem: async () => saved, setItem: async (_, value) => { saved = value; } };
}

test('backend URLs accept explicit HTTP IPs and HTTPS service roots', () => {
  assert.equal(normalizeBackendUrl('  http://192.168.1.20:8001/// '), 'http://192.168.1.20:8001');
  assert.equal(normalizeBackendUrl('https://example.com/proxy/'), 'https://example.com/proxy');
  for (const url of ['', '192.168.1.20:8001', 'ftp://example.com', 'https://user:pass@example.com',
    'https://example.com?token=abc', 'https://example.com/#fragment', 'http://example.com/api/v2']) {
    assert.throws(() => normalizeBackendUrl(url));
  }
});

test('stored backend applies after restart and requests use the new address', async () => {
  const saved = storage();
  const store = createBackendUrlStore({ storage: saved });
  assert.throws(() => store.v2('/health'));
  await store.save('http://192.168.1.20:8001');
  assert.equal(store.v2('/assessment'), 'http://192.168.1.20:8001/api/v2/assessment');
  const restarted = createBackendUrlStore({ storage: saved });
  await restarted.load();
  assert.equal(restarted.getUrl(), 'http://192.168.1.20:8001');
  await restarted.save('https://other.example.com');
  assert.equal(restarted.v2('/ready'), 'https://other.example.com/api/v2/ready');
});

test('invalid storage and failed saves cannot silently replace the current backend', async () => {
  const store = createBackendUrlStore({ storage: storage('bad'), defaultUrl: 'https://default.example.com' });
  await store.load();
  assert.equal(store.getUrl(), 'https://default.example.com');
  await assert.rejects(store.save('bad'));
  assert.equal(store.getUrl(), 'https://default.example.com');
  const failed = createBackendUrlStore({ storage: { setItem: async () => { throw new Error('storage full'); } }, defaultUrl: 'https://old.example.com' });
  await assert.rejects(failed.save('https://new.example.com'));
  assert.equal(failed.getUrl(), 'https://old.example.com');
});

test('URL validation also rejects malformed addresses with the native React Native URL implementation', () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const babel = require('@babel/core');
  const nativeSource = fs.readFileSync(require.resolve('react-native/Libraries/Blob/URL'), 'utf8');
  const nativeModule = { exports: {} };
  const compiled = babel.transformSync(nativeSource.slice(nativeSource.indexOf('export class URL {')), {
    babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-flow-strip-types', '@babel/plugin-transform-modules-commonjs'],
  }).code;
  vm.runInNewContext(compiled, { module: nativeModule, exports: nativeModule.exports });
  const settingsModule = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/utils/backendSettings.cjs'), 'utf8'), {
    module: settingsModule, URL: nativeModule.exports.URL,
  });
  const normalize = settingsModule.exports.normalizeBackendUrl;
  assert.equal(normalize('http://192.168.1.20:8001'), 'http://192.168.1.20:8001');
  for (const invalid of ['http://bad host:8001', 'http://example.com:bad', 'http://example.com:70000']) {
    assert.throws(() => normalize(invalid));
  }
});
