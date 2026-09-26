/**
 * cors.test.js — P0.3 CORS Hardening Tests
 *
 * Tests the exact-match CORS allowlist implementation against both
 * legitimate and malicious origins.
 *
 * Suite 1: corsOptions.util unit tests
 *   - parseOriginList()
 *   - buildAllowedOriginsSet() in dev and prod modes
 *   - corsOriginValidator() positive and negative cases
 *
 * Suite 2: Integration tests against a real Express app via supertest
 *   - Positive: exact allowed origins (simple + preflight)
 *   - Negative: substring-bypass attacks, arbitrary origins, malformed
 *   - Credentials: Access-Control-Allow-Credentials header present/absent
 *   - Exposed headers: RateLimit headers visible to client
 *   - API regression: health endpoint still reachable
 */

'use strict';

// Must be set before requiring corsOptions (reads process.env at module load)
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_CORS_ENV = process.env.CORS_ALLOWED_ORIGINS;

afterAll(() => {
  process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  if (ORIGINAL_CORS_ENV === undefined) {
    delete process.env.CORS_ALLOWED_ORIGINS;
  } else {
    process.env.CORS_ALLOWED_ORIGINS = ORIGINAL_CORS_ENV;
  }
});

// ===========================================================================
// Helper: fresh-require corsOptions.util (bypass module cache for env tests)
// ===========================================================================
function freshRequireCorsUtil() {
  // Clear module cache for this specific module
  const modulePath = require.resolve('../src/utils/corsOptions.util');
  delete require.cache[modulePath];
  return require('../src/utils/corsOptions.util');
}

// ===========================================================================
// Helper: build a minimal Express app using a given corsOptions
// ===========================================================================
function buildApp(corsOpts) {
  const express = require('express');
  const cors = require('cors');
  const app = express();
  app.use(cors(corsOpts));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true });
  });
  app.post('/api/auth/login', (req, res) => {
    res.status(200).json({ success: true });
  });
  return app;
}

// ===========================================================================
// SUITE 1 — Unit tests for corsOptions.util internals
// ===========================================================================
describe('corsOptions.util — unit tests', () => {
  let util;

  beforeAll(() => {
    // Run in development mode so we can test both paths
    process.env.NODE_ENV = 'test';
    delete process.env.CORS_ALLOWED_ORIGINS;
    util = freshRequireCorsUtil();
  });

  // -------------------------------------------------------------------------
  // parseOriginList
  // -------------------------------------------------------------------------
  describe('parseOriginList()', () => {
    const { parseOriginList } = (() => freshRequireCorsUtil())()._internal;

    test('parses comma-separated origins', () => {
      const result = parseOriginList('https://a.com,https://b.com');
      expect(result).toEqual(['https://a.com', 'https://b.com']);
    });

    test('trims whitespace around each entry', () => {
      const result = parseOriginList(' https://a.com , https://b.com ');
      expect(result).toEqual(['https://a.com', 'https://b.com']);
    });

    test('strips trailing slash from each entry', () => {
      const result = parseOriginList('https://a.com/,https://b.com/');
      expect(result).toEqual(['https://a.com', 'https://b.com']);
    });

    test('filters empty entries', () => {
      const result = parseOriginList(',,,https://a.com,,,');
      expect(result).toEqual(['https://a.com']);
    });

    test('returns empty array for empty string', () => {
      expect(parseOriginList('')).toEqual([]);
    });

    test('returns empty array for null', () => {
      expect(parseOriginList(null)).toEqual([]);
    });

    test('returns empty array for undefined', () => {
      expect(parseOriginList(undefined)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // getAllowedOrigins — development mode
  // -------------------------------------------------------------------------
  describe('getAllowedOrigins() — development mode', () => {
    test('includes all 4 dev localhost origins by default', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.CORS_ALLOWED_ORIGINS;
      delete process.env.FRONTEND_URL;
      const { getAllowedOrigins, DEV_DEFAULT_ORIGINS } = freshRequireCorsUtil()._internal;
      const set = getAllowedOrigins();
      DEV_DEFAULT_ORIGINS.forEach((o) => {
        expect(set.has(o)).toBe(true);
      });
    });

    test('merges CORS_ALLOWED_ORIGINS with dev defaults in dev mode', () => {
      process.env.NODE_ENV = 'test';
      process.env.CORS_ALLOWED_ORIGINS = 'https://staging.example.com';
      const { getAllowedOrigins } = freshRequireCorsUtil()._internal;
      const set = getAllowedOrigins();
      expect(set.has('https://staging.example.com')).toBe(true);
      expect(set.has('http://localhost:5173')).toBe(true); // dev default still present
      delete process.env.CORS_ALLOWED_ORIGINS;
    });
  });

  // -------------------------------------------------------------------------
  // getAllowedOrigins — production mode
  // -------------------------------------------------------------------------
  describe('getAllowedOrigins() — production mode', () => {
    test('does NOT include dev defaults in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ALLOWED_ORIGINS = 'https://prod.example.com';
      const { getAllowedOrigins, DEV_DEFAULT_ORIGINS } = freshRequireCorsUtil()._internal;
      const set = getAllowedOrigins();
      // Dev origins must NOT be in production set
      DEV_DEFAULT_ORIGINS.forEach((o) => {
        expect(set.has(o)).toBe(false);
      });
      expect(set.has('https://prod.example.com')).toBe(true);
      process.env.NODE_ENV = 'test';
      delete process.env.CORS_ALLOWED_ORIGINS;
    });

    test('empty Set when CORS_ALLOWED_ORIGINS and FRONTEND_URL are unset in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.CORS_ALLOWED_ORIGINS;
      delete process.env.FRONTEND_URL;
      const { getAllowedOrigins } = freshRequireCorsUtil()._internal;
      const set = getAllowedOrigins();
      expect(set.size).toBe(0);
      process.env.NODE_ENV = 'test';
    });
  });

  // -------------------------------------------------------------------------
  // corsOriginValidator — positive cases
  // -------------------------------------------------------------------------
  describe('corsOriginValidator() — positive (allowed) cases', () => {
    let validator;

    beforeAll(() => {
      process.env.NODE_ENV = 'test';
      process.env.CORS_ALLOWED_ORIGINS = 'https://prod.example.com';
      validator = freshRequireCorsUtil()._internal.corsOriginValidator;
    });

    afterAll(() => {
      delete process.env.CORS_ALLOWED_ORIGINS;
    });

    test('null origin → allowed (no-browser / same-origin request)', (done) => {
      validator(null, (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    test('undefined origin → allowed', (done) => {
      validator(undefined, (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    test('exact dev origin → allowed', (done) => {
      validator('http://localhost:5173', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    test('exact dev origin localhost:5000 → allowed', (done) => {
      validator('http://localhost:5000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    test('exact dev origin 127.0.0.1:5000 → allowed', (done) => {
      validator('http://127.0.0.1:5000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    test('exact prod origin from CORS_ALLOWED_ORIGINS → allowed', (done) => {
      validator('https://prod.example.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    test('origin with trailing slash is normalized and allowed', (done) => {
      // Browser never sends trailing slash, but be defensive
      validator('http://localhost:5173/', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });
  });

  // -------------------------------------------------------------------------
  // corsOriginValidator — negative / attack cases
  // -------------------------------------------------------------------------
  describe('corsOriginValidator() — negative (attack) cases', () => {
    let validator;

    beforeAll(() => {
      process.env.NODE_ENV = 'test';
      process.env.CORS_ALLOWED_ORIGINS = 'https://prod.example.com';
      validator = freshRequireCorsUtil()._internal.corsOriginValidator;
    });

    afterAll(() => {
      delete process.env.CORS_ALLOWED_ORIGINS;
    });

    test('ATTACK — substring bypass: https://localhost:5000.attacker.com → rejected', (done) => {
      validator('https://localhost:5000.attacker.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('ATTACK — subdomain bypass: https://attacker-localhost:5000.example.com → rejected', (done) => {
      validator('https://attacker-localhost:5000.example.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('ATTACK — query param injection: https://evil.com/?allowed=http://localhost:5000 → rejected', (done) => {
      validator('https://evil.com/?allowed=http://localhost:5000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('ATTACK — prefix match: https://localhost:5000evil.com → rejected', (done) => {
      validator('https://localhost:5000evil.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('ATTACK — suffix inclusion: https://evillocalhost:5000.com → rejected', (done) => {
      validator('https://evillocalhost:5000.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('arbitrary unconfigured origin → rejected', (done) => {
      validator('https://evil.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('malformed origin string → rejected', (done) => {
      validator('not-a-valid-origin', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('http://localhost:5000 allowed but https://localhost:5000 (wrong scheme) → rejected', (done) => {
      // Scheme is part of the exact match — different scheme = different origin
      validator('https://localhost:5000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('ATTACK — prod bypass: https://prod.example.com.evil.com → rejected', (done) => {
      validator('https://prod.example.com.evil.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });

    test('ATTACK — localhost with different port → rejected', (done) => {
      // 5001 is not in the allowlist
      validator('http://localhost:5001', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
        done();
      });
    });
  });
});

// ===========================================================================
// SUITE 2 — Integration tests against Express app
// ===========================================================================
describe('CORS integration — HTTP requests via supertest', () => {
  const request = require('supertest');
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CORS_ALLOWED_ORIGINS = 'https://prod.example.com';
    const { corsOptions } = freshRequireCorsUtil();
    app = buildApp(corsOptions);
  });

  afterAll(() => {
    delete process.env.CORS_ALLOWED_ORIGINS;
  });

  // -------------------------------------------------------------------------
  // Positive: simple GET with allowed origin
  // -------------------------------------------------------------------------
  test('P1: exact allowed origin (dev) → 200 + ACAO header set', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('P2: exact allowed origin localhost:5000 → ACAO set', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5000');
  });

  test('P3: exact allowed origin localhost:5174 → ACAO set', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5174');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5174');
  });

  test('P4: exact prod origin from CORS_ALLOWED_ORIGINS → ACAO set', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://prod.example.com');
    expect(res.headers['access-control-allow-origin']).toBe('https://prod.example.com');
  });

  test('P5: credentials flag → Access-Control-Allow-Credentials: true', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  test('P6: no Origin header (API/curl) → 200 response (no CORS rejection)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  test('P7: exposed rate-limit headers present in allowed origin response', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    const exposed = res.headers['access-control-expose-headers'] || '';
    expect(exposed.toLowerCase()).toContain('retry-after');
  });

  // -------------------------------------------------------------------------
  // Positive: OPTIONS preflight
  // -------------------------------------------------------------------------
  test('P8: preflight OPTIONS from allowed origin → 204', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');
    expect([200, 204]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('P9: preflight OPTIONS with credentials → ACAC: true', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  // -------------------------------------------------------------------------
  // Negative: attack origins
  // -------------------------------------------------------------------------
  test('N1: ATTACK — https://localhost:5000.attacker.com → NO ACAO header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://localhost:5000.attacker.com');
    // CORS rejected: no ACAO header, or header must NOT equal the attacking origin
    expect(res.headers['access-control-allow-origin']).not.toBe('https://localhost:5000.attacker.com');
    // And credentials must NOT be allowed for this origin
    expect(res.headers['access-control-allow-credentials']).not.toBe('true');
  });

  test('N2: ATTACK — https://attacker-localhost:5000.example.com → NO ACAO header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://attacker-localhost:5000.example.com');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://attacker-localhost:5000.example.com');
  });

  test('N3: ATTACK — https://evil.com/?allowed=http://localhost:5000 → NO ACAO header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://evil.com/?allowed=http://localhost:5000');
    expect(res.headers['access-control-allow-origin']).not.toBe(
      'https://evil.com/?allowed=http://localhost:5000'
    );
  });

  test('N4: arbitrary unconfigured origin → NO ACAO header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://arbitrary-evil.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('N5: malformed origin → NO ACAO header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'not-a-valid-origin');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('N6: preflight from attack origin → NO ACAO header', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://localhost:5000.attacker.com')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://localhost:5000.attacker.com');
  });

  test('N7: https://localhost:5000 (wrong scheme) → NO ACAO header', async () => {
    // http://localhost:5000 is allowed; https:// version is not
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://localhost:5000');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://localhost:5000');
  });

  test('N8: ATTACK — prod.example.com.evil.com → NO ACAO header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://prod.example.com.evil.com');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://prod.example.com.evil.com');
  });

  // -------------------------------------------------------------------------
  // API regression: routes still work from allowed origins
  // -------------------------------------------------------------------------
  test('R1: POST /api/auth/login from allowed origin → 200', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  // -------------------------------------------------------------------------
  // Production mode: dev origins must be rejected
  // -------------------------------------------------------------------------
  describe('Production mode — dev origins rejected', () => {
    let prodApp;

    beforeAll(() => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ALLOWED_ORIGINS = 'https://prod.example.com';
      const { corsOptions: prodCorsOptions } = freshRequireCorsUtil();
      prodApp = buildApp(prodCorsOptions);
    });

    afterAll(() => {
      process.env.NODE_ENV = 'test';
      delete process.env.CORS_ALLOWED_ORIGINS;
    });

    test('PROD-N1: http://localhost:5173 → rejected in production', async () => {
      const res = await request(prodApp)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');
      // In production, localhost origins are not in the allowlist
      expect(res.headers['access-control-allow-origin']).not.toBe('http://localhost:5173');
    });

    test('PROD-P1: https://prod.example.com → allowed in production', async () => {
      const res = await request(prodApp)
        .get('/api/health')
        .set('Origin', 'https://prod.example.com');
      expect(res.headers['access-control-allow-origin']).toBe('https://prod.example.com');
    });
  });
});
