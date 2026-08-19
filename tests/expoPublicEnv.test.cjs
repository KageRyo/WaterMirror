const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const configSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'config.js'), 'utf8');

test('Expo public settings use static process.env references', () => {
  for (const variable of [
    'EXPO_PUBLIC_API_BASE_URL',
    'EXPO_PUBLIC_DEFAULT_MODEL',
    'EXPO_PUBLIC_REQUEST_TIMEOUT_MS',
  ]) {
    assert.match(configSource, new RegExp(`process\\.env\\.${variable}`));
  }

  assert.doesNotMatch(configSource, /buildAppConfig\(process\.env\)/);
});
