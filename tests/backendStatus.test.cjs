const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RequestTimeoutError,
  getBackendStatus,
  parseBackendError,
} = require('../src/utils/apiContract.cjs');

function response({ ok = true, status = 200, body, requestId = null }) {
  return {
    ok,
    status,
    headers: { get: (name) => (name === 'X-Request-ID' ? requestId : null) },
    json: async () => body,
  };
}

const healthyResponse = response({
  body: { status: 'ok', message: 'healthy', default_model: 'direct_wqi5' },
  requestId: 'health-id',
});

const readyResponse = response({
  body: {
    status: 'ready',
    message: 'ready',
    default_model: 'direct_wqi5',
    dataset_available: false,
    dataset_required: false,
    models: [{ model_type: 'direct_wqi5', available: true }],
  },
  requestId: 'ready-id',
});

test('backend status reports a healthy and ready backend', async () => {
  const status = await getBackendStatus({ health: async () => healthyResponse, ready: async () => readyResponse });

  assert.deepEqual(status, { state: 'ready', requestId: 'ready-id' });
});

test('backend status distinguishes a running but not-ready backend', async () => {
  const notReady = response({
    ok: false,
    status: 503,
    requestId: 'not-ready-id',
    body: {
      status: 'not_ready',
      message: 'dataset unavailable',
      default_model: 'direct_wqi5',
      dataset_available: false,
      dataset_required: true,
      models: [{ model_type: 'direct_wqi5', available: true }],
    },
  });

  const status = await getBackendStatus({ health: async () => healthyResponse, ready: async () => notReady });

  assert.deepEqual(status, { state: 'backend_not_ready', requestId: 'not-ready-id' });
});

test('backend status reports a timeout without exposing transport details', async () => {
  const status = await getBackendStatus({
    health: async () => { throw new RequestTimeoutError(); },
    ready: async () => readyResponse,
  });

  assert.deepEqual(status, { state: 'timeout', requestId: null });
});

test('backend errors preserve a request ID and map model availability', async () => {
  const error = await parseBackendError(response({
    ok: false,
    status: 503,
    requestId: 'model-id',
    body: { error: { code: 'model_unavailable', message: 'private backend detail' } },
  }));

  assert.equal(error.kind, 'model_unavailable');
  assert.equal(error.requestId, 'model-id');
  assert.equal(error.message, 'model_unavailable');
});

test('malformed ready data produces a controlled invalid-response state', async () => {
  const malformed = response({ ok: true, body: { status: 'ready' }, requestId: 'bad-id' });

  const status = await getBackendStatus({ health: async () => healthyResponse, ready: async () => malformed });

  assert.deepEqual(status, { state: 'invalid_response', requestId: 'bad-id' });
});

test('generic backend failure does not retry non-idempotent requests', async () => {
  let calls = 0;
  const status = await getBackendStatus({
    health: async () => {
      calls += 1;
      throw new Error('network library detail');
    },
    ready: async () => readyResponse,
  });

  assert.deepEqual(status, { state: 'backend_unreachable', requestId: null });
  assert.equal(calls, 1);
});
