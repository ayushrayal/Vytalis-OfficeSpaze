/**
 * corsOptions.util.js — Centralized CORS Configuration
 *
 * P0.3 — Production CORS Hardening
 *
 * Security issue fixed:
 *   The previous implementation used substring matching:
 *     normalizedOrigin.includes('localhost:5000')
 *   This allowed attacker-controlled origins such as:
 *     https://evil.localhost:5000.attacker.com
 *   to pass CORS validation while credentials were enabled — a
 *   credential-leaking CORS bypass vulnerability.
 *
 * Fix:
 *   Replaced with a strict Set-based exact-match allowlist.
 *   Every allowed origin must be a complete, explicit origin string.
 *   No substring matching, no wildcards, no regex on user-supplied values.
 *
 * Origin resolution:
 *   Production (NODE_ENV === 'production'):
 *     - Origins explicitly specified in CORS_ALLOWED_ORIGINS or FRONTEND_URL.
 *     - If neither is set, allowlist is empty (all cross-origin browser requests rejected).
 *
 *   Development / Non-production:
 *     - Environment origins (CORS_ALLOWED_ORIGINS / FRONTEND_URL) merged with
 *       DEV_DEFAULT_ORIGINS (http://localhost:5173, http://localhost:5174,
 *       http://localhost:5000, http://127.0.0.1:5000).
 *
 * Null-origin behavior:
 *   null / undefined origin (no Origin header) occurs for:
 *     - server-to-server requests (curl, Postman without Origin)
 *     - same-origin requests
 *   Allowed so that health checks and server-to-server API calls work.
 *   Does NOT affect cross-origin browser requests because browsers mandatory-send Origin.
 *
 * @module utils/corsOptions.util
 */

'use strict';

// Development-only default origins (exact strings — no wildcards)
const DEV_DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

/**
 * Parses a comma-separated origin list from an env variable string into a cleaned
 * array of exact-match origin strings.
 *
 * @param {string} raw  Raw comma-separated value from environment
 * @returns {string[]}  Array of cleaned origin strings
 */
function parseOriginList(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter((o) => o.length > 0);
}

/**
 * Dynamically evaluates the current Set of allowed origins based on environment.
 *
 * @returns {Set<string>}
 */
function getAllowedOrigins() {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawEnv = process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
  const envOrigins = parseOriginList(rawEnv);

  if (isProduction) {
    // Production: strictly env-driven. No dev defaults injected.
    return new Set(envOrigins);
  }

  // Non-production: merge env origins with local development defaults.
  return new Set([...DEV_DEFAULT_ORIGINS, ...envOrigins]);
}

/**
 * Express CORS origin callback implementing strict exact-match validation.
 *
 * @param {string|undefined} origin  Value of the Origin request header
 * @param {Function} callback        Express CORS callback(err, allow)
 */
function corsOriginValidator(origin, callback) {
  // No Origin header -> server-to-server, curl, same-origin -> allow.
  if (!origin) {
    return callback(null, true);
  }

  // Normalize: strip trailing slash
  const normalized = origin.replace(/\/$/, '');
  const allowedOriginsSet = getAllowedOrigins();

  // Strict exact-match only
  if (allowedOriginsSet.has(normalized)) {
    return callback(null, true);
  }

  // Reject quietly without sending internal error details
  return callback(null, false);
}

/**
 * Complete CORS options object for use with express `cors` middleware.
 */
const corsOptions = {
  origin: corsOriginValidator,
  credentials: true,
  exposedHeaders: ['Retry-After', 'RateLimit', 'RateLimit-Policy']
};

module.exports = {
  corsOptions,
  _internal: {
    corsOriginValidator,
    parseOriginList,
    getAllowedOrigins,
    DEV_DEFAULT_ORIGINS
  }
};
