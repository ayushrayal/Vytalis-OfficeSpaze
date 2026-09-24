import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Parses the Retry-After header into a positive integer representing seconds.
 * Supports:
 * - Integer seconds (e.g. 900, "900", "60")
 * - HTTP-date format (e.g. "Wed, 21 Oct 2026 07:28:00 GMT")
 * Returns null if missing, non-positive, or invalid.
 */
export const parseRetryAfter = (raw) => {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  // Check numeric seconds
  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    const rounded = Math.ceil(numeric);
    return rounded > 0 ? rounded : null;
  }

  // Check HTTP-date format
  if (typeof raw === 'string') {
    const timestamp = Date.parse(raw);
    if (!Number.isNaN(timestamp)) {
      const diffSecs = Math.ceil((timestamp - Date.now()) / 1000);
      return diffSecs > 0 ? diffSecs : null;
    }
  }

  return null;
};

/**
 * Safely extracts Retry-After value from an Axios error response.
 * Inspects both Axios response headers and response body.
 */
export const extractRetryAfterSeconds = (error) => {
  if (!error || !error.response) return null;

  const headers = error.response.headers;
  let raw = null;

  if (headers) {
    if (typeof headers.get === 'function') {
      raw = headers.get('retry-after') || headers.get('Retry-After');
    }
    if (!raw && headers['retry-after'] !== undefined) {
      raw = headers['retry-after'];
    }
    if (!raw && headers['Retry-After'] !== undefined) {
      raw = headers['Retry-After'];
    }
  }

  // Check fallback in payload if present
  if (!raw && error.response.data?.retryAfter !== undefined) {
    raw = error.response.data.retryAfter;
  }

  return parseRetryAfter(raw);
};

/**
 * Extracts rate-limit policy text from server RateLimit-Policy header.
 * Example header: "10;w=900" -> "10 login attempts are allowed every 15 minutes."
 */
export const extractRateLimitPolicy = (error, mode = 'login') => {
  const fallback =
    mode === 'signup'
      ? '5 signup attempts are allowed every 15 minutes.'
      : '10 login attempts are allowed every 15 minutes.';

  if (!error || !error.response) return fallback;

  const headers = error.response.headers;
  let rawPolicy = null;

  if (headers) {
    if (typeof headers.get === 'function') {
      rawPolicy = headers.get('ratelimit-policy') || headers.get('RateLimit-Policy');
    }
    if (!rawPolicy && headers['ratelimit-policy'] !== undefined) {
      rawPolicy = headers['ratelimit-policy'];
    }
    if (!rawPolicy && headers['RateLimit-Policy'] !== undefined) {
      rawPolicy = headers['RateLimit-Policy'];
    }
  }

  if (typeof rawPolicy === 'string') {
    const match = rawPolicy.match(/^(\d+);\s*w=(\d+)/i);
    if (match) {
      const limit = match[1];
      const windowSeconds = Number(match[2]);
      const windowMinutes = Math.round(windowSeconds / 60);
      return `${limit} ${mode} attempts are allowed every ${windowMinutes} minutes.`;
    }
  }

  return fallback;
};

/**
 * Extracts remaining attempts from server RateLimit header if present.
 * Example: "limit=10, remaining=0, reset=900" -> 0
 */
export const extractRateLimitRemaining = (error) => {
  if (!error || !error.response) return null;

  const headers = error.response.headers;
  let raw = null;

  if (headers) {
    if (typeof headers.get === 'function') {
      raw = headers.get('ratelimit') || headers.get('RateLimit');
    }
    if (!raw && headers['ratelimit'] !== undefined) raw = headers['ratelimit'];
    if (!raw && headers['RateLimit'] !== undefined) raw = headers['RateLimit'];
  }

  if (typeof raw === 'string') {
    const match = raw.match(/remaining=(\d+)/i);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
};

/**
 * Formats a duration in seconds to MM:SS string.
 * Clamps at 00:00.
 */
export const formatCountdown = (seconds) => {
  if (typeof seconds !== 'number' || seconds <= 0 || !Number.isFinite(seconds)) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(mins)}:${pad(secs)}`;
};

/**
 * Client-side cooldown hook for HTTP 429 rate limiting.
 *
 * Characteristics:
 * - Purely in-memory / component-scoped (no localStorage/sessionStorage)
 * - Uses real-time delta from targetEndTime to prevent timer drift
 * - Automatically cleans up timer on component unmount
 * - Automatically re-enables submission when countdown reaches 00:00
 * - Zero polling / zero repeated API requests during cooldown
 */
export const useRateLimitCooldown = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [policyText, setPolicyText] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const timerRef = useRef(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const clearCooldown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSecondsRemaining(0);
    setIsRateLimited(false);
    setPolicyText('');
    setRemainingAttempts(null);
  }, []);

  const startCooldown = useCallback((initialSeconds, options = {}) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (options.policyText) {
      setPolicyText(options.policyText);
    }
    if (options.remainingAttempts !== undefined) {
      setRemainingAttempts(options.remainingAttempts);
    }

    const secs = Number(initialSeconds);

    // If Retry-After is missing or invalid, do NOT guess a fake duration.
    // Set isRateLimited true without a running countdown.
    if (!secs || secs <= 0 || !Number.isFinite(secs)) {
      setIsRateLimited(true);
      setSecondsRemaining(0);
      return;
    }

    setIsRateLimited(true);
    setSecondsRemaining(secs);

    const targetEndTime = Date.now() + secs * 1000;

    timerRef.current = setInterval(() => {
      const remainingMs = targetEndTime - Date.now();
      const currentSecs = Math.max(0, Math.ceil(remainingMs / 1000));

      if (currentSecs <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setSecondsRemaining(0);
        setIsRateLimited(false);
        setPolicyText('');
        setRemainingAttempts(null);
      } else {
        setSecondsRemaining(currentSecs);
      }
    }, 1000);
  }, []);

  return {
    isRateLimited,
    secondsRemaining,
    formattedCountdown: formatCountdown(secondsRemaining),
    policyText,
    remainingAttempts,
    startCooldown,
    clearCooldown
  };
};

export default useRateLimitCooldown;
