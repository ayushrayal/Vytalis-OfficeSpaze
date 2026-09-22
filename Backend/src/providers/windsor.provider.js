/**
 * Windsor.ai Provider
 *
 * Dedicated server-side client for Windsor.ai facebook_leads connector.
 * Strict rules:
 * - Backend only (zero frontend exposure)
 * - Zero hardcoding of API key or Account ID
 * - Sanitizes all secrets from URLs, errors, and log outputs
 * - Clean HTTP error and timeout handling
 */

const WINDSOR_BASE_URL = 'https://connectors.windsor.ai';
const FACEBOOK_LEADS_CONNECTOR = 'facebook_leads';

const DEFAULT_LEAD_FIELDS = [
  'id',
  'full_name',
  'email',
  'phone_number',
  'created_time',
  'account_id',
  'account_name',
  'form_id',
  'form_name',
  'campaign',
  'campaign_id',
  'adset_id',
  'adset_name',
  'ad_name',
  'data_fetched_at'
];

/**
 * Sanitizes URLs, errors, and text to ensure API keys are never exposed.
 * @param {string} text
 * @returns {string}
 */
const sanitizeSecrets = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/([?&]api_key=)[^&]+/gi, '$1[REDACTED]')
    .replace(/("api_key":\s*")[^"]+/gi, '$1[REDACTED]');
};

/**
 * Fetches Facebook Lead Ads records from Windsor.ai facebook_leads connector.
 *
 * @param {Object} options
 * @param {string} [options.accountId] - Account ID override (defaults to WINDSOR_META_LEADS_ACCOUNT_ID)
 * @param {string} [options.datePreset='last_90d'] - Windsor date preset
 * @param {string} [options.dateFrom] - Optional custom start date (YYYY-MM-DD)
 * @param {string} [options.dateTo] - Optional custom end date (YYYY-MM-DD)
 * @param {string|string[]} [options.fields=DEFAULT_LEAD_FIELDS] - Field list
 * @param {number} [options.timeoutMs=30000] - Request timeout in milliseconds
 * @returns {Promise<{ rawData: Array<Object>, count: number, accountId: string }>}
 */
const fetchFacebookLeads = async ({
  accountId,
  datePreset = 'last_90d',
  dateFrom,
  dateTo,
  fields = DEFAULT_LEAD_FIELDS,
  timeoutMs = 30000
} = {}) => {
  const apiKey = process.env.WINDSOR_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const error = new Error('Windsor API key is not configured in backend environment variables (WINDSOR_API_KEY)');
    error.statusCode = 500;
    throw error;
  }

  const targetAccountId = accountId || process.env.WINDSOR_META_LEADS_ACCOUNT_ID;
  if (!targetAccountId || !String(targetAccountId).trim()) {
    const error = new Error('WINDSOR_META_LEADS_ACCOUNT_ID is not configured');
    error.statusCode = 400;
    throw error;
  }

  const fieldsParam = Array.isArray(fields) ? fields.join(',') : fields;

  const url = new URL(`${WINDSOR_BASE_URL}/${FACEBOOK_LEADS_CONNECTOR}`);
  url.searchParams.set('api_key', apiKey.trim());
  url.searchParams.set('fields', fieldsParam);

  if (dateFrom && dateTo) {
    url.searchParams.set('date_from', dateFrom.trim());
    url.searchParams.set('date_to', dateTo.trim());
  } else if (datePreset) {
    url.searchParams.set('date_preset', datePreset.trim());
  }

  // Account filter using verified Windsor JSON filter syntax: [["account_id","eq","<accountId>"]]
  const filterArray = [['account_id', 'eq', String(targetAccountId).trim()]];
  url.searchParams.set('filter', JSON.stringify(filterArray));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Windsor.ai facebook_leads request timed out after ${timeoutMs}ms`);
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    const networkError = new Error(`Windsor.ai network communication failed: ${err.message}`);
    networkError.statusCode = 502;
    throw networkError;
  } finally {
    clearTimeout(timer);
  }

  let rawBodyText;
  try {
    rawBodyText = await response.text();
  } catch (readErr) {
    const parseError = new Error('Failed to read Windsor.ai response body');
    parseError.statusCode = 502;
    throw parseError;
  }

  if (!response.ok) {
    let errorMessage = `Windsor.ai responded with HTTP ${response.status} (${response.statusText})`;
    try {
      const parsedErr = JSON.parse(rawBodyText);
      const detail = parsedErr.message || parsedErr.error || parsedErr.description;
      if (detail) {
        errorMessage = `Windsor.ai error: ${sanitizeSecrets(typeof detail === 'string' ? detail : JSON.stringify(detail))}`;
      }
    } catch (_) {
      if (rawBodyText && rawBodyText.length < 300) {
        errorMessage = `Windsor.ai error: ${sanitizeSecrets(rawBodyText)}`;
      }
    }

    const providerError = new Error(errorMessage);
    providerError.statusCode = response.status >= 500 ? 502 : response.status;
    throw providerError;
  }

  let jsonResult;
  try {
    jsonResult = JSON.parse(rawBodyText);
  } catch (jsonErr) {
    const invalidJsonError = new Error('Malformed JSON received from Windsor.ai');
    invalidJsonError.statusCode = 502;
    throw invalidJsonError;
  }

  let recordsArray = [];
  if (Array.isArray(jsonResult)) {
    recordsArray = jsonResult;
  } else if (jsonResult && Array.isArray(jsonResult.data)) {
    recordsArray = jsonResult.data;
  } else if (jsonResult && jsonResult.error) {
    const errMsg = typeof jsonResult.error === 'string' ? jsonResult.error : (jsonResult.message || 'Unknown Windsor error');
    const apiError = new Error(`Windsor API error: ${sanitizeSecrets(errMsg)}`);
    apiError.statusCode = 400;
    throw apiError;
  }

  return {
    rawData: recordsArray,
    count: recordsArray.length,
    accountId: String(targetAccountId).trim()
  };
};

/**
 * Fetches available field metadata for the facebook_leads connector.
 * Used for inspecting available custom question fields or connectors schema.
 *
 * @param {number} [timeoutMs=15000]
 * @returns {Promise<Array<Object>>}
 */
const fetchAvailableFields = async (timeoutMs = 15000) => {
  const apiKey = process.env.WINDSOR_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const error = new Error('Windsor API key is not configured');
    error.statusCode = 500;
    throw error;
  }

  const url = new URL(`${WINDSOR_BASE_URL}/fields`);
  url.searchParams.set('api_key', apiKey.trim());
  url.searchParams.set('connector', FACEBOOK_LEADS_CONNECTOR);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Failed to fetch fields metadata HTTP ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`Windsor fields discovery failure: ${sanitizeSecrets(err.message)}`);
  }
};

module.exports = {
  fetchFacebookLeads,
  fetchAvailableFields,
  sanitizeSecrets,
  DEFAULT_LEAD_FIELDS
};
