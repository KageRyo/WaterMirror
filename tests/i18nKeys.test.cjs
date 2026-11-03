const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const load = (locale) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'i18n', `${locale}.json`), 'utf8'));

const flatten = (messages, prefix = '') =>
  Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

// A key missing from a locale silently falls back to zh-TW, so Japanese or
// Simplified Chinese users would see Traditional Chinese text.
test('every locale defines the same keys as zh-TW', () => {
  const expected = flatten(load('zh-TW')).sort();
  for (const locale of ['en', 'zh-CN', 'ja']) {
    assert.deepEqual(flatten(load(locale)).sort(), expected, locale);
  }
});
