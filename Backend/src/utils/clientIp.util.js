/**
 * clientIp.util.js — Trusted Client IP Resolution
 *
 * Production topology:
 *   Client → Cloudflare → Render (10.x.x.x) → Express
 *
 * Problem:
 *   With trust proxy = 1, Express resolves req.ip to the Render internal
 *   10.x.x.x address because Render's own load balancer is the innermost
 *   hop in X-Forwarded-For that Express can see. This collapses all users
 *   into a single rate-limit bucket.
 *
 * Solution:
 *   When traffic passes through Cloudflare, Cloudflare injects:
 *     CF-Connecting-IP  — the real public client IP (single value, not a list)
 *     CF-Ray            — a unique Cloudflare edge request identifier
 *
 *   Both headers are set by Cloudflare's edge infrastructure. CF-Connecting-IP
 *   is the authoritative source for the real client IP when Cloudflare is in
 *   the chain. CF-Ray is used as a discriminator to detect whether the request
 *   passed through Cloudflare at all.
 *
 * Security boundary:
 *   If the Render origin is publicly reachable (not firewalled to Cloudflare
 *   IPs only), a client reaching Render directly can forge any header, including
 *   CF-Connecting-IP and CF-Ray. The software-level discriminator narrows this
 *   risk but does NOT eliminate it. The recommended production control is to
 *   restrict Render's inbound traffic to Cloudflare IP ranges only (see
 *   DIRECT_ORIGIN_STATUS in the security report).
 *
 * Strategy:
 *   1. Check if CF-Connecting-IP is present AND non-empty.
 *   2. Additionally verify CF-Ray is present (Cloudflare request fingerprint).
 *   3. Validate CF-Connecting-IP is a well-formed IPv4 or IPv6 address.
 *   4. Normalize IPv4-mapped IPv6 (::ffff:x.x.x.x) → plain IPv4.
 *   5. If all checks pass → return CF-Connecting-IP as the trusted client IP.
 *   6. Fallback: use req.ip (Express trust-proxy resolved value).
 *   7. Final fallback: req.socket.remoteAddress (raw TCP peer).
 *   8. If nothing resolves to a valid IP → return 'unknown'.
 *
 * This utility is the ONLY place in the codebase that performs IP extraction.
 * All security-sensitive consumers (rate limiters, audit logs) MUST use this.
 *
 * @module utils/clientIp.util
 */

'use strict';

const net = require('net');

// ---------------------------------------------------------------------------
// CF-Ray header format: 16 hex digits + '-' + IATA airport code (3 letters)
// Examples: "8f1a2b3c4d5e6f7a-BOM", "abc123def456ab12-SIN"
// This regex is deliberately strict to make forgery non-trivial at the
// application layer. Note: infrastructure-level firewall is the real defence.
// ---------------------------------------------------------------------------
const CF_RAY_REGEX = /^[0-9a-f]{16}-[A-Z]{3}$/i;

/**
 * Normalizes an IPv4-mapped IPv6 address to plain IPv4.
 * ::ffff:203.0.113.10  →  203.0.113.10
 * 203.0.113.10          →  203.0.113.10 (unchanged)
 * ::1                   →  ::1 (unchanged — valid IPv6 loopback)
 *
 * @param {string} ip
 * @returns {string}
 */
function normalizeIp(ip) {
  if (typeof ip !== 'string') return ip;
  // IPv4-mapped IPv6: "::ffff:x.x.x.x"
  const ipv4Mapped = ip.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (ipv4Mapped) {
    return ipv4Mapped[1];
  }
  return ip;
}

/**
 * Returns true if the given string is a well-formed IPv4 or IPv6 address.
 * Uses Node's net.isIP() which is authoritative.
 *
 * @param {string} ip
 * @returns {boolean}
 */
function isValidIp(ip) {
  if (typeof ip !== 'string' || ip.trim() === '') return false;
  return net.isIP(ip) !== 0;
}

/**
 * Returns true if the request appears to have passed through Cloudflare.
 *
 * Both CF-Connecting-IP AND CF-Ray must be present.
 * CF-Connecting-IP alone is not sufficient because a client reaching the
 * Render origin directly can supply an arbitrary CF-Connecting-IP header.
 * CF-Ray provides a second discriminator (Cloudflare's per-edge-request ID).
 *
 * IMPORTANT: This is a software-layer heuristic only. The hard guarantee
 * requires the Render origin to be firewalled to Cloudflare IPs exclusively.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function looksLikeCloudflareRequest(req) {
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  const cfRay = req.headers['cf-ray'];

  if (!cfConnectingIp || !cfRay) return false;

  // Validate CF-Ray format as a secondary discriminator.
  // A direct-origin attacker would need to forge both this AND CF-Connecting-IP.
  if (!CF_RAY_REGEX.test(String(cfRay).trim())) return false;

  return true;
}

/**
 * Resolves the canonical trusted client IP for a given Express request.
 *
 * Call this function instead of reading req.ip, req.ips, CF-Connecting-IP,
 * or X-Forwarded-For directly anywhere in the codebase.
 *
 * Resolution order:
 *   1. CF-Connecting-IP (only if Cloudflare discriminator check passes)
 *   2. req.ip (Express trust-proxy resolved value)
 *   3. req.socket.remoteAddress (raw TCP peer — last resort)
 *   4. 'unknown' (if all sources fail validation)
 *
 * @param {import('express').Request} req
 * @returns {string} Normalized, validated client IP address, or 'unknown'.
 */
function getClientIp(req) {
  // -------------------------------------------------------------------------
  // Path 1: Cloudflare-originated request
  // -------------------------------------------------------------------------
  if (looksLikeCloudflareRequest(req)) {
    const rawCfIp = String(req.headers['cf-connecting-ip']).trim();

    // CF-Connecting-IP is a single value (not a comma-separated list like XFF).
    // Reject if it somehow contains a comma (potential injection attempt).
    if (rawCfIp.includes(',')) {
      // Fall through to non-CF path. Log the anomaly.
      console.warn('[clientIp] CF-Connecting-IP contained comma — rejected:', rawCfIp);
    } else {
      const normalized = normalizeIp(rawCfIp);
      if (isValidIp(normalized)) {
        return normalized;
      }
      // CF-Connecting-IP was present but malformed — fall through.
      console.warn('[clientIp] CF-Connecting-IP malformed — falling back:', rawCfIp);
    }
  }

  // -------------------------------------------------------------------------
  // Path 2: Non-Cloudflare (direct origin, local development, staging)
  // Use req.ip which is trust-proxy resolved.
  // -------------------------------------------------------------------------
  if (req.ip) {
    const normalized = normalizeIp(req.ip);
    if (isValidIp(normalized)) {
      return normalized;
    }
  }

  // -------------------------------------------------------------------------
  // Path 3: Raw TCP remote address (absolute fallback — ignore trust proxy)
  // -------------------------------------------------------------------------
  if (req.socket && req.socket.remoteAddress) {
    const normalized = normalizeIp(req.socket.remoteAddress);
    if (isValidIp(normalized)) {
      return normalized;
    }
  }

  // -------------------------------------------------------------------------
  // Path 4: Cannot determine IP — safe sentinel
  // -------------------------------------------------------------------------
  return 'unknown';
}

module.exports = {
  getClientIp,
  // Exported for unit testing only — do not use in application code:
  _internal: {
    normalizeIp,
    isValidIp,
    looksLikeCloudflareRequest
  }
};
