const assert = require('node:assert/strict');
const test = require('node:test');

const packageMetadata = require('../package.json');
const appMetadata = require('../app.json');

test('package and Expo release versions stay aligned', () => {
  assert.equal(packageMetadata.version, appMetadata.expo.version);
});
