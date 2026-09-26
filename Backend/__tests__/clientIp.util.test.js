/**
 * clientIp.util.test.js
 *
 * Tests for the centralized trusted client IP resolver.
 *
 * Tests cover:
 *   - T1:  Normal Cloudflare request → CF-Connecting-IP returned
 *   - T2:  Different CF-Connecting-IP values → correct IPs returned
 *   - T3:  Malformed CF-Connecting-IP → falls back safely
 *   - T4:  Spoofed CF-Connecting-IP without valid CF-Ray → not trusted
 *   - T5:  CF-Connecting-IP with comma (injection attempt) → rejected
 *   - T6:  Missing CF-Connecting-IP → falls back to req.ip
 *   - T7:  Both headers absent → uses req.ip
 *   - T8:  IPv6 client via CF-Connecting-IP → returned as-is
 *   - T9:  IPv4-mapped IPv6 → normalized to plain IPv4
 *   - T10: IPv4-mapped IPv6 in req.ip → normalized
 *   - T11: looksLikeCloudflareRequest: missing CF-Ray → false
 *   - T12: looksLikeCloudflareRequest: malformed CF-Ray → false
 *   - T13: looksLikeCloudflareRequest: valid both headers → true
 *   - T14: No IP resolvable at all → 'unknown'
 *   - T15: normalizeIp various cases
 *   - T16: isValidIp various cases
 */

'use strict';

const { getClientIp, _internal } = require('../src/utils/clientIp.util');
const { normalizeIp, isValidIp, looksLikeCloudflareRequest } = _internal;

// ---------------------------------------------------------------------------
// Helper: build a minimal mock Express request object
// ---------------------------------------------------------------------------
function makeReq({
  cfConnectingIp = undefined,
  cfRay = undefined,
  ip = undefined,
  socketRemoteAddress = undefined,
  xForwardedFor = undefined
} = {}) {
  const headers = {};
  if (cfConnectingIp !== undefined) headers['cf-connecting-ip'] = cfConnectingIp;
  if (cfRay !== undefined) headers['cf-ray'] = cfRay;
  if (xForwardedFor !== undefined) headers['x-forwarded-for'] = xForwardedFor;

  return {
    headers,
    ip: ip,
    socket: socketRemoteAddress ? { remoteAddress: socketRemoteAddress } : { remoteAddress: undefined }
  };
}

// ---------------------------------------------------------------------------
// Valid CF-Ray string for tests (16 hex + '-' + 3-letter airport)
// ---------------------------------------------------------------------------
const VALID_CF_RAY = '8f1a2b3c4d5e6f7a-BOM';

// ===========================================================================
// TEST SUITE: normalizeIp
// ===========================================================================
describe('normalizeIp()', () => {
  test('T15a: plain IPv4 unchanged', () => {
    expect(normalizeIp('203.0.113.10')).toBe('203.0.113.10');
  });

  test('T15b: IPv4-mapped IPv6 → plain IPv4', () => {
    expect(normalizeIp('::ffff:203.0.113.10')).toBe('203.0.113.10');
  });

  test('T15c: IPv4-mapped IPv6 uppercase prefix → plain IPv4', () => {
    expect(normalizeIp('::FFFF:10.0.0.1')).toBe('10.0.0.1');
  });

  test('T15d: pure IPv6 loopback unchanged', () => {
    expect(normalizeIp('::1')).toBe('::1');
  });

  test('T15e: full IPv6 address unchanged', () => {
    expect(normalizeIp('2001:db8::1')).toBe('2001:db8::1');
  });

  test('T15f: non-string input returned as-is', () => {
    expect(normalizeIp(null)).toBe(null);
  });
});

// ===========================================================================
// TEST SUITE: isValidIp
// ===========================================================================
describe('isValidIp()', () => {
  test('T16a: valid IPv4', () => {
    expect(isValidIp('203.0.113.10')).toBe(true);
  });

  test('T16b: valid IPv6', () => {
    expect(isValidIp('2001:db8::1')).toBe(true);
  });

  test('T16c: valid IPv6 loopback', () => {
    expect(isValidIp('::1')).toBe(true);
  });

  test('T16d: invalid string', () => {
    expect(isValidIp('not-an-ip')).toBe(false);
  });

  test('T16e: empty string', () => {
    expect(isValidIp('')).toBe(false);
  });

  test('T16f: null', () => {
    expect(isValidIp(null)).toBe(false);
  });

  test('T16g: undefined', () => {
    expect(isValidIp(undefined)).toBe(false);
  });

  test('T16h: number', () => {
    expect(isValidIp(12345)).toBe(false);
  });

  test('T16i: hostname (not an IP)', () => {
    expect(isValidIp('example.com')).toBe(false);
  });

  test('T16j: IPv4-mapped IPv6 is valid after normalization', () => {
    const normalized = normalizeIp('::ffff:203.0.113.10');
    expect(isValidIp(normalized)).toBe(true);
    expect(normalized).toBe('203.0.113.10');
  });
});

// ===========================================================================
// TEST SUITE: looksLikeCloudflareRequest
// ===========================================================================
describe('looksLikeCloudflareRequest()', () => {
  test('T11: missing CF-Ray → false', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.10' });
    expect(looksLikeCloudflareRequest(req)).toBe(false);
  });

  test('T12a: malformed CF-Ray (too short) → false', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.10', cfRay: 'abc123-BOM' });
    expect(looksLikeCloudflareRequest(req)).toBe(false);
  });

  test('T12b: malformed CF-Ray (no airport code) → false', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.10', cfRay: '8f1a2b3c4d5e6f7a' });
    expect(looksLikeCloudflareRequest(req)).toBe(false);
  });

  test('T12c: CF-Ray with invalid chars → false', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.10', cfRay: 'XXXXXXXXXXXXXXXX-BOM' });
    // 'X' is not a hex digit → false
    expect(looksLikeCloudflareRequest(req)).toBe(false);
  });

  test('T13: valid CF-Connecting-IP + valid CF-Ray → true', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.10', cfRay: VALID_CF_RAY });
    expect(looksLikeCloudflareRequest(req)).toBe(true);
  });

  test('missing CF-Connecting-IP even with valid CF-Ray → false', () => {
    const req = makeReq({ cfRay: VALID_CF_RAY });
    expect(looksLikeCloudflareRequest(req)).toBe(false);
  });

  test('both headers missing → false', () => {
    const req = makeReq();
    expect(looksLikeCloudflareRequest(req)).toBe(false);
  });
});

// ===========================================================================
// TEST SUITE: getClientIp — main API
// ===========================================================================
describe('getClientIp()', () => {
  // -------------------------------------------------------------------------
  // T1 — Normal Cloudflare request: CF-Connecting-IP returned
  // -------------------------------------------------------------------------
  test('T1: Cloudflare request → returns CF-Connecting-IP', () => {
    const req = makeReq({
      cfConnectingIp: '203.0.113.10',
      cfRay: VALID_CF_RAY,
      ip: '10.29.95.36' // Render internal — should be ignored
    });
    expect(getClientIp(req)).toBe('203.0.113.10');
  });

  // -------------------------------------------------------------------------
  // T2 — Different CF-Connecting-IPs → correct distinct IPs
  // -------------------------------------------------------------------------
  test('T2a: client A returns correct IP', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.10', cfRay: VALID_CF_RAY, ip: '10.29.95.36' });
    expect(getClientIp(req)).toBe('203.0.113.10');
  });

  test('T2b: client B returns correct distinct IP', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.11', cfRay: VALID_CF_RAY, ip: '10.29.95.36' });
    expect(getClientIp(req)).toBe('203.0.113.11');
  });

  test('T2c: client C returns correct distinct IP', () => {
    const req = makeReq({ cfConnectingIp: '203.0.113.12', cfRay: VALID_CF_RAY, ip: '10.29.95.36' });
    expect(getClientIp(req)).toBe('203.0.113.12');
  });

  // -------------------------------------------------------------------------
  // T3 — Malformed CF-Connecting-IP → falls back to req.ip
  // -------------------------------------------------------------------------
  test('T7: malformed CF-Connecting-IP → falls back to req.ip', () => {
    // Suppress expected console.warn for this test
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const req = makeReq({
      cfConnectingIp: 'not-a-valid-ip',
      cfRay: VALID_CF_RAY,
      ip: '10.29.95.36'
    });
    const result = getClientIp(req);
    expect(result).toBe('10.29.95.36');
    warnSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // T4 — Spoofed CF-Connecting-IP: CF-Ray absent/malformed → not trusted
  // Direct-origin client supplies CF-Connecting-IP without a valid CF-Ray.
  // -------------------------------------------------------------------------
  test('T4: spoofed CF-Connecting-IP with no CF-Ray → falls back to req.ip (not spoofed IP)', () => {
    const req = makeReq({
      cfConnectingIp: '1.2.3.4', // attacker-supplied
      // cfRay intentionally absent
      ip: '10.0.0.99' // actual TCP peer (Render internal in prod; direct attacker IP otherwise)
    });
    // Without a valid CF-Ray, CF-Connecting-IP is NOT trusted
    expect(getClientIp(req)).toBe('10.0.0.99');
    expect(getClientIp(req)).not.toBe('1.2.3.4');
  });

  test('T4b: spoofed CF-Connecting-IP with malformed CF-Ray → not trusted', () => {
    const req = makeReq({
      cfConnectingIp: '5.5.5.5',
      cfRay: 'fake-ray',
      ip: '10.0.0.50'
    });
    expect(getClientIp(req)).toBe('10.0.0.50');
    expect(getClientIp(req)).not.toBe('5.5.5.5');
  });

  // -------------------------------------------------------------------------
  // T5 — Spoofed X-Forwarded-For: must not affect the resolved IP
  // getClientIp() never reads X-Forwarded-For directly (relies on
  // CF-Connecting-IP or req.ip which Express resolves via trust proxy).
  // -------------------------------------------------------------------------
  test('T5: spoofed X-Forwarded-For cannot change rate-limit identity', () => {
    const req = makeReq({
      cfConnectingIp: '203.0.113.10',
      cfRay: VALID_CF_RAY,
      xForwardedFor: '9.9.9.9, 8.8.8.8', // attacker-supplied XFF
      ip: '10.29.95.36'
    });
    // X-Forwarded-For is ignored; CF-Connecting-IP is used
    expect(getClientIp(req)).toBe('203.0.113.10');
    expect(getClientIp(req)).not.toBe('9.9.9.9');
  });

  // -------------------------------------------------------------------------
  // T6 — Missing CF-Connecting-IP → safe fallback to req.ip
  // -------------------------------------------------------------------------
  test('T6: missing CF-Connecting-IP → falls back to req.ip', () => {
    const req = makeReq({ ip: '10.29.95.36' });
    expect(getClientIp(req)).toBe('10.29.95.36');
  });

  // -------------------------------------------------------------------------
  // T8 — IPv6 client via CF-Connecting-IP
  // -------------------------------------------------------------------------
  test('T8: IPv6 client → valid normalized IP returned', () => {
    const req = makeReq({
      cfConnectingIp: '2001:db8::1',
      cfRay: VALID_CF_RAY,
      ip: '10.0.0.1'
    });
    expect(getClientIp(req)).toBe('2001:db8::1');
  });

  // -------------------------------------------------------------------------
  // T9 — IPv4-mapped IPv6 from CF-Connecting-IP → normalized to plain IPv4
  // -------------------------------------------------------------------------
  test('T9: IPv4-mapped IPv6 in CF-Connecting-IP → normalized to plain IPv4', () => {
    const req = makeReq({
      cfConnectingIp: '::ffff:203.0.113.10',
      cfRay: VALID_CF_RAY,
      ip: '10.0.0.1'
    });
    expect(getClientIp(req)).toBe('203.0.113.10');
  });

  // -------------------------------------------------------------------------
  // T10 — IPv4-mapped IPv6 in req.ip → normalized
  // -------------------------------------------------------------------------
  test('T10: IPv4-mapped IPv6 in req.ip → normalized correctly', () => {
    const req = makeReq({ ip: '::ffff:10.0.0.1' }); // no CF headers
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  // -------------------------------------------------------------------------
  // T14 — No IP resolvable → 'unknown'
  // -------------------------------------------------------------------------
  test('T14: no resolvable IP → returns "unknown"', () => {
    const req = {
      headers: {},
      ip: null,
      socket: { remoteAddress: null }
    };
    expect(getClientIp(req)).toBe('unknown');
  });

  // -------------------------------------------------------------------------
  // CF-Connecting-IP with comma → rejected, falls back to req.ip
  // -------------------------------------------------------------------------
  test('comma-separated CF-Connecting-IP → rejected, falls back to req.ip', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const req = makeReq({
      cfConnectingIp: '1.2.3.4, 5.6.7.8', // injection attempt
      cfRay: VALID_CF_RAY,
      ip: '10.0.0.5'
    });
    expect(getClientIp(req)).toBe('10.0.0.5');
    warnSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Socket fallback when req.ip is null
  // -------------------------------------------------------------------------
  test('req.ip null but socket has address → socket address used', () => {
    const req = {
      headers: {},
      ip: null,
      socket: { remoteAddress: '192.168.1.1' }
    };
    expect(getClientIp(req)).toBe('192.168.1.1');
  });
});
