const categoryKeyMap = {
  Excellent: 'excellent',
  Good: 'good',
  Fair: 'fair',
  Poor: 'poor',
  Bad: 'bad',
  Terrible: 'terrible',
};

const categoryColorMap = {
  Excellent: 'green',
  Good: 'blue',
  Fair: 'goldenrod',
  Poor: 'orange',
  Bad: 'red',
  Terrible: 'brown',
};

const assessmentKeyMap = {
  Good: 'good',
  Fair: 'fair',
  Poor: 'poor',
  OutOfRange: 'error',
};

function getCategoryTranslationKey(category) {
  return categoryKeyMap[category] || null;
}

function getCategoryColor(category) {
  return categoryColorMap[category] || '#666';
}

function getAssessmentTranslationKey(label) {
  return assessmentKeyMap[label] || 'error';
}

function normalizeResultPayload(result) {
  if (!result || typeof result !== 'object') {
    return null;
  }

  if ('score' in result && 'category' in result) {
    return {
      score: Number(result.score),
      category: result.category,
      rating_range: result.rating_range || '',
      model_type: result.model_type || 'direct_wqi5',
      latency_ms: Number(result.latency_ms || 0),
      assessment: result.assessment || {},
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
    };
  }

  if ('data' in result && 'assessment' in result) {
    return {
      score: Number(result.data),
      category: '',
      rating_range: '',
      model_type: 'legacy',
      latency_ms: 0,
      assessment: result.assessment || {},
      warnings: [],
    };
  }

  return null;
}

module.exports = {
  getAssessmentTranslationKey,
  getCategoryColor,
  getCategoryTranslationKey,
  normalizeResultPayload,
};
