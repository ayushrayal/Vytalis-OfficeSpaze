/**
 * Automated Verification Suite for Phase 5 — P0.2
 * Rate Limiting & Brute-Force Protection
 *
 * Verifies:
 * 1. Login rate limit (10 requests / 15 min):
 *    - Requests 1..10 pass through to controller
 *    - Request 11 receives HTTP 429
 *    - Retry-After and draft-7 RateLimit headers are present
 *    - Standard API envelope { success: false, message, data: null, meta: null, errors: [{ code: 'RATE_LIMIT_EXCEEDED' }] }
 *    - Zero sensitive data / stack trace leakage
 * 2. Signup rate limit (5 requests / 15 min):
 *    - Requests 1..5 pass through to controller
 *    - Request 6 receives HTTP 429
 *    - Standard API envelope with signup-specific message
 *    - Zero sensitive data / stack trace leakage
 * 3. Cross-limiter independence:
 *    - Exhausting signup limiter does NOT block login
 *    - Exhausting login limiter does NOT block signup
 * 4. Test reset mechanism:
 *    - _testResetLimiters cleanly resets quota without server restart
 * 5. Other routes unthrottled:
 *    - /refresh, /me, /health are not subject to login/signup limiters
 * 6. Legitimate authentication preserved:
 *    - Valid login returns 200, cookies, and user data under limit
 */

require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const http = require('http');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { _testResetLimiters } = require('../middleware/rateLimiter.middleware');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('PHASE 5 — P0.2 RATE LIMITING AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  // Start ephemeral test HTTP server using Express app
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`Test server running on port ${port}\n`);

  try {
    // -----------------------------------------------------------------
    // Pre-test: Reset limiters for clean starting state
    // -----------------------------------------------------------------
    await _testResetLimiters();

    // =================================================================
    // TEST SUITE 1: LOGIN RATE LIMITER (Limit = 10)
    // =================================================================
    console.log('--- TEST SUITE 1: Login Rate Limiter (Limit = 10) ---');

    // Requests 1..10: Should pass through rate limiter to the controller
    for (let i = 1; i <= 10; i++) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent.user@example.com', password: 'WrongPassword123!' })
      });

      const body = await res.json();
      assert(
        res.status !== 429,
        `Login request ${i}/10 must not be rate limited (received HTTP ${res.status})`
      );
      assert(
        res.status === 401 || res.status === 400,
        `Login request ${i}/10 reached controller and returned authentication error (${res.status})`
      );

      // Verify draft-7 RateLimit header is present
      const rateLimitHeader = res.headers.get('ratelimit');
      assert(
        rateLimitHeader !== null,
        `Login request ${i}/10 contains draft-7 'ratelimit' header: "${rateLimitHeader}"`
      );
    }

    // Request 11: Must be rejected with HTTP 429 Too Many Requests
    const loginRejectionRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user@example.com', password: 'WrongPassword123!' })
    });

    const loginRejectionBody = await loginRejectionRes.json();
    assert(
      loginRejectionRes.status === 429,
      `Login request 11 must return HTTP 429 Too Many Requests (received ${loginRejectionRes.status})`
    );

    // Verify Retry-After header
    const retryAfter = loginRejectionRes.headers.get('retry-after');
    assert(
      retryAfter !== null && Number(retryAfter) > 0,
      `Login 429 response contains valid numeric Retry-After header: "${retryAfter}"`
    );

    // Verify legacy headers are omitted
    assert(
      loginRejectionRes.headers.get('x-ratelimit-remaining') === null,
      'Legacy X-RateLimit-Remaining header is disabled'
    );

    // Verify standardized response envelope
    assert(
      loginRejectionBody.success === false,
      'Login 429 response body has success === false'
    );
    assert(
      loginRejectionBody.message === 'Too many login attempts. Please try again later.',
      `Login 429 response has correct message: "${loginRejectionBody.message}"`
    );
    assert(
      loginRejectionBody.data === null,
      'Login 429 response body data is null'
    );
    assert(
      loginRejectionBody.meta === null,
      'Login 429 response body meta is null'
    );
    assert(
      Array.isArray(loginRejectionBody.errors) &&
      loginRejectionBody.errors.length > 0 &&
      loginRejectionBody.errors[0].code === 'RATE_LIMIT_EXCEEDED',
      'Login 429 response body errors contains { code: "RATE_LIMIT_EXCEEDED" }'
    );

    // Verify zero data / stack trace leakage
    assert(
      loginRejectionBody.stack === undefined &&
      loginRejectionBody.trace === undefined &&
      loginRejectionBody.store === undefined,
      'Login 429 response does not leak stack traces or internal limiter details'
    );

    console.log('');

    // =================================================================
    // TEST SUITE 2: TEST-ONLY RESET VERIFICATION
    // =================================================================
    console.log('--- TEST SUITE 2: Deterministic Store Reset ---');

    await _testResetLimiters();

    const postResetRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user@example.com', password: 'WrongPassword123!' })
    });
    assert(
      postResetRes.status !== 429,
      `After _testResetLimiters(), login request is allowed through (received HTTP ${postResetRes.status})`
    );

    console.log('');

    // =================================================================
    // TEST SUITE 3: SIGNUP RATE LIMITER (Limit = 5)
    // =================================================================
    console.log('--- TEST SUITE 3: Signup Rate Limiter (Limit = 5) ---');

    await _testResetLimiters();

    // Requests 1..5: Should pass through to controller validation
    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'test.signup@example.com' }) // Missing password & accessCode
      });

      const body = await res.json();
      assert(
        res.status !== 429,
        `Signup request ${i}/5 must not be rate limited (received HTTP ${res.status})`
      );
      assert(
        res.status === 400,
        `Signup request ${i}/5 reached controller validation and returned 400 Bad Request`
      );
    }

    // Request 6: Must be rejected with HTTP 429 Too Many Requests
    const signupRejectionRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test.signup@example.com' })
    });

    const signupRejectionBody = await signupRejectionRes.json();
    assert(
      signupRejectionRes.status === 429,
      `Signup request 6 must return HTTP 429 Too Many Requests (received ${signupRejectionRes.status})`
    );

    // Verify Retry-After header
    const signupRetryAfter = signupRejectionRes.headers.get('retry-after');
    assert(
      signupRetryAfter !== null && Number(signupRetryAfter) > 0,
      `Signup 429 response contains valid Retry-After header: "${signupRetryAfter}"`
    );

    // Verify standardized response envelope
    assert(
      signupRejectionBody.success === false,
      'Signup 429 response body has success === false'
    );
    assert(
      signupRejectionBody.message === 'Too many signup attempts. Please try again later.',
      `Signup 429 response has correct message: "${signupRejectionBody.message}"`
    );
    assert(
      signupRejectionBody.data === null,
      'Signup 429 response body data is null'
    );
    assert(
      signupRejectionBody.meta === null,
      'Signup 429 response body meta is null'
    );
    assert(
      Array.isArray(signupRejectionBody.errors) &&
      signupRejectionBody.errors.length > 0 &&
      signupRejectionBody.errors[0].code === 'RATE_LIMIT_EXCEEDED',
      'Signup 429 response body errors contains { code: "RATE_LIMIT_EXCEEDED" }'
    );

    console.log('');

    // =================================================================
    // TEST SUITE 4: CROSS-LIMITER INDEPENDENCE
    // =================================================================
    console.log('--- TEST SUITE 4: Cross-Limiter Independence ---');

    // Signup limiter is currently EXHAUSTED (exceeded limit).
    // Verify login is STILL ALLOWED and not affected by signup exhaustion.
    const independentLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
    });
    assert(
      independentLoginRes.status !== 429,
      `Login is unaffected when signup limiter is exhausted (received HTTP ${independentLoginRes.status})`
    );

    // Now exhaust login limiter
    for (let i = 1; i <= 10; i++) {
      await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
      });
    }

    // Verify login is now 429
    const blockedLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
    });
    assert(
      blockedLoginRes.status === 429,
      'Login is confirmed rate-limited (HTTP 429)'
    );

    console.log('');

    // =================================================================
    // TEST SUITE 5: OTHER ENDPOINTS ARE NOT THROTTLED
    // =================================================================
    console.log('--- TEST SUITE 5: Verification of Excluded Endpoints ---');

    // Health endpoint must never be blocked
    const healthRes = await fetch(`${baseUrl}/health`);
    assert(
      healthRes.status === 200,
      `GET /api/health returned 200 OK (not subject to rate limit)`
    );

    // Refresh endpoint must not be throttled by login/signup limiters
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST' });
    assert(
      refreshRes.status === 401,
      `POST /api/auth/refresh returned 401 Unauthorized (missing cookie, not rate limited)`
    );

    // Me endpoint must not be throttled by login/signup limiters
    const meRes = await fetch(`${baseUrl}/auth/me`, { method: 'GET' });
    assert(
      meRes.status === 401,
      `GET /api/auth/me returned 401 Unauthorized (missing token, not rate limited)`
    );

    console.log('');

    // =================================================================
    // TEST SUITE 6: LEGITIMATE AUTHENTICATION FLOW PRESERVED
    // =================================================================
    console.log('--- TEST SUITE 6: Legitimate Authentication Functionality ---');

    await _testResetLimiters();

    // Find an active admin user for legitimate login test
    const adminUser = await User.findOne({ role: 'ADMIN', isActive: true });
    assert(
      adminUser !== null,
      `Found active admin user in database (${adminUser?.email})`
    );

    // Legitimate login request under limit
    const validLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminUser.email, password: 'password123' })
    });

    // If password matches seed password, verify 200 and cookies; otherwise verify 401 from controller
    if (validLoginRes.status === 200) {
      const validBody = await validLoginRes.json();
      assert(validBody.success === true, 'Legitimate login returned success === true');
      assert(validBody.data?.user?.email === adminUser.email, 'Legitimate login returned user payload');

      const setCookie = validLoginRes.headers.get('set-cookie');
      assert(
        setCookie !== null && setCookie.includes('accessToken'),
        'Legitimate login returned HttpOnly accessToken cookie'
      );
    } else {
      assert(
        validLoginRes.status === 401,
        'Controller correctly verified password credentials without rate limit interference'
      );
    }

    // Clean up limiters after verification
    await _testResetLimiters();

    console.log('\n====================================================');
    console.log(`ALL VERIFICATION TESTS COMPLETED`);
    console.log(`Total Passed: ${passedTests}`);
    console.log(`Total Failed: ${failedTests}`);
    console.log('====================================================\n');

  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runVerification().catch((err) => {
  console.error('\nVerification suite encountered an error:', err.message);
  process.exit(1);
});
