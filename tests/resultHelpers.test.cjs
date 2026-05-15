const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getAssessmentTranslationKey,
  getCategoryColor,
  getCategoryTranslationKey,
  normalizeResultPayload,
} = require('../src/utils/resultHelpers.cjs');

test('category helpers map backend categories', () => {
  assert.equal(getCategoryTranslationKey('Good'), 'good');
  assert.equal(getCategoryColor('Poor'), 'orange');
});

test('assessment helper maps backend assessment labels', () => {
  assert.equal(getAssessmentTranslationKey('OutOfRange'), 'error');
  assert.equal(getAssessmentTranslationKey('Good'), 'good');
});

test('normalizeResultPayload keeps modern payload shape', () => {
  const payload = normalizeResultPayload({
    score: 82.5,
    category: 'Good',
    rating_range: '70 < WQI5 ≤ 85',
    model_type: 'direct_wqi5',
    latency_ms: 12.4,
    assessment: { DO: 'Good' },
    warnings: [],
  });
  assert.equal(payload.category, 'Good');
  assert.equal(payload.assessment.DO, 'Good');
});

test('normalizeResultPayload converts legacy route params', () => {
  const payload = normalizeResultPayload({
    data: 82.5,
    assessment: { DO: '良好' },
  });
  assert.equal(payload.score, 82.5);
  assert.equal(payload.model_type, 'legacy');
});
