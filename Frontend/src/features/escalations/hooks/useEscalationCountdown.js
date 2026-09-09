import { useState, useEffect } from 'react';

/**
 * Lightweight client-side countdown hook.
 * Ticks locally every interval (default: 10 seconds) to update remaining time and SLA urgency
 * without spamming the backend with network requests.
 */
export const useEscalationCountdown = (intervalMs = 10000) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};

export default useEscalationCountdown;
