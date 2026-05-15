const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('app.json keeps android permissions outside adaptiveIcon', () => {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
  const androidConfig = appJson.expo.android || {};

  assert.equal(typeof androidConfig.adaptiveIcon, 'object');
  assert.equal('permissions' in (androidConfig.adaptiveIcon || {}), false);
});
