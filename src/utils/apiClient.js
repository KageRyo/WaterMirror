import config from '@/config';

const {
  V2_ENDPOINTS,
  appendCsvModelType,
  createAssessmentRequest,
  getBackendStatus,
  normalizeClientError,
  parseBackendError,
  RequestTimeoutError,
  validateAssessmentResponse,
  validateCsvRowsResponse,
} = require('./apiContract.cjs');

const BASE_URL = config.apiBaseUrl.replace(/\/$/, ''); // remove trailing slash if any
const V2_BASE = `${BASE_URL}/api/v2`;

/**
 * 帶超時的 fetch（可重用）
 */
export function fetchWithTimeout(url, options = {}, timeout = config.requestTimeoutMs) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new RequestTimeoutError()), timeout)
    ),
  ]);
}

/**
 * 產生 v2 路徑的工具函數
 * 用法: apiClient.v2('/assessment') → http://.../api/v2/assessment
 */
export function v2(path) {
  if (!path) return V2_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${V2_BASE}${cleanPath}`;
}

/**
 * 統一的 API Client
 * 所有對後端的呼叫都應該透過這個物件
 */
export const apiClient = {
  // ==================== 低階工具 ====================
  v2,

  fetchWithTimeout,

  endpoints: V2_ENDPOINTS,

  parseAssessmentResponse: validateAssessmentResponse,

  parseCsvRowsResponse: validateCsvRowsResponse,

  parseErrorResponse: parseBackendError,

  toClientError: normalizeClientError,

  // ==================== 高階 API 方法 ====================

  /**
   * 健康檢查（用於連線狀態）
   */
  health: () => fetchWithTimeout(v2('/health'), {}, 3000),

  ready: () => fetchWithTimeout(v2(V2_ENDPOINTS.ready), {}, 3000),

  backendStatus: () => getBackendStatus(apiClient),

  /**
   * 單筆水質資料評估
   */
  assess: (data) =>
    fetchWithTimeout(
      v2(V2_ENDPOINTS.assessment),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createAssessmentRequest(data)),
      },
      config.requestTimeoutMs
    ),

  /**
   * CSV 批次上傳（回傳平均分數）
   */
  assessCsvSummary: (formData, modelType = config.defaultModelType) =>
    fetchWithTimeout(
      v2(V2_ENDPOINTS.csvSummary),
      {
        method: 'POST',
        body: appendCsvModelType(formData, modelType),
      },
      config.requestTimeoutMs
    ),

  assessCsvRows: (formData, modelType = config.defaultModelType) =>
    fetchWithTimeout(
      v2(V2_ENDPOINTS.csvRows),
      {
        method: 'POST',
        body: appendCsvModelType(formData, modelType),
      },
      config.requestTimeoutMs
    ),

  /**
   * 取得分數的百分位數
   */
  getPercentile: (score) =>
    fetchWithTimeout(
      v2(`/percentile?score=${encodeURIComponent(score)}`),
      {},
      config.requestTimeoutMs
    ),

  /**
   * 取得 WQI5 分類分布
   */
  getCategories: () =>
    fetchWithTimeout(v2('/categories'), {}, config.requestTimeoutMs),
};

export default apiClient;
