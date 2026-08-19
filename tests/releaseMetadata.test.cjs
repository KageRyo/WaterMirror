const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const packageMetadata = require('../package.json');
const appMetadata = require('../app.json');

test('package and Expo release versions stay aligned', () => {
  assert.equal(packageMetadata.version, appMetadata.expo.version);
});

test('localized version labels stay aligned with the release version', () => {
  for (const locale of ['en', 'ja', 'zh-CN', 'zh-TW']) {
    const translation = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'i18n', `${locale}.json`), 'utf8')
    );

    assert.match(translation.app.version, new RegExp(`v${appMetadata.expo.version.replaceAll('.', '\\.')}`));
  }
});
