const { rateLimit, MemoryStore } = require('express-rate-limit');

/**
 * P0.2 — Rate Limiting & Brute-Force Protection
 *
 * Scope:
 * - POST /api/auth/login (10 requests / 15 minutes / IP default)
 * - POST /api/auth/signup (5 requests / 15 minutes / IP default)
 *
 * Explicitly excluded from rate limiting in this phase:
 * - Refresh token, logout, me
 * - General /api traffic
 * - Leads, Windsor, CRM, ERP, SSE, document access, PDF generation
 *
 * Store Architecture:
 * - Currently uses in-memory MemoryStore for single backend process.
 * - Prior to horizontal scaling across multiple instances, a shared
 *   distributed store (e.g., Redis) will be required.
 */

// Memory stores for process-local tracking
const loginStore = new MemoryStore();
const signupStore = new MemoryStore();

// Window & Max configuration with production-safe fallbacks
const LOGIN_WINDOW_MS = Number(process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX = Number(process.env.AUTH_LOGIN_RATE_LIMIT_MAX) || 10;

const SIGNUP_WINDOW_MS = Number(process.env.AUTH_SIGNUP_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const SIGNUP_MAX = Number(process.env.AUTH_SIGNUP_RATE_LIMIT_MAX) || 5;

/**
 * Standard 429 error responder adhering to application envelope
 */
const createRateLimitHandler = (message) => {
  return (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message,
      data: null,
      meta: null,
      errors: [
        {
          code: 'RATE_LIMIT_EXCEEDED'
        }
      ]
    });
  };
};

/**
 * Login Rate Limiter: 10 requests / 15 min / IP
 * Protects against credential stuffing & brute-force password guessing.
 */
const loginRateLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: LOGIN_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: loginStore,
  handler: createRateLimitHandler('Too many login attempts. Please try again later.')
});

/**
 * Signup Rate Limiter: 5 requests / 15 min / IP
 * Protects against automated account creation abuse.
 */
const signupRateLimiter = rateLimit({
  windowMs: SIGNUP_WINDOW_MS,
  limit: SIGNUP_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: signupStore,
  handler: createRateLimitHandler('Too many signup attempts. Please try again later.')
});

/**
 * Test-only utility to deterministically reset limiter stores between automated test cases.
 * Never exposed via HTTP route or frontend.
 */
const _testResetLimiters = async () => {
  if (typeof loginStore.resetAll === 'function') {
    loginStore.resetAll();
  }
  if (typeof signupStore.resetAll === 'function') {
    signupStore.resetAll();
  }
};

module.exports = {
  loginRateLimiter,
  signupRateLimiter,
  _testResetLimiters
};
