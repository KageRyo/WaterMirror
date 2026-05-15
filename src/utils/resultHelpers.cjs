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

/**
 * Returns a user-friendly display name for a model type.
 * Falls back to the raw value if no translation is available.
 *
 * @param {string} modelType - The model type key (e.g. 'lightgbm', 'direct_wqi5')
 * @param {function} t - i18n translation function from LanguageContext
 */
function getModelTypeLabel(modelType, t) {
  if (!modelType) return '';

  const key = `modelTypes.${modelType}`;
  const translated = t(key);

  // If translation key doesn't exist, return the raw value with nice formatting
  if (translated === key) {
    const fallbackNames = {
      direct_wqi5: 'Direct WQI5',
      lr: 'Linear Regression',
      mpr: 'Polynomial Regression',
      svm: 'Support Vector Machine',
      rf: 'Random Forest',
      xgboost: 'XGBoost',
      lightgbm: 'LightGBM',
      legacy: 'Legacy',
    };
    return fallbackNames[modelType] || modelType;
  }

  return translated;
}

function parseStoredResult(raw) {
  if (!raw) {
    return null;
  }

  try {
    return normalizeResultPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

module.exports = {
  getAssessmentTranslationKey,
  getCategoryColor,
  getCategoryTranslationKey,
  normalizeResultPayload,
  parseStoredResult,
  getModelTypeLabel,
};
