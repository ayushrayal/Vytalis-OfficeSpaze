import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

/**
 * Accessible rate-limit alert component for authentication pages.
 * Displays title, security reason, policy guideline, and dynamic live countdown badge.
 */
export const RateLimitAlert = ({
  title = 'Too many login attempts',
  description = 'For your security, login has been temporarily paused.',
  policyText = '',
  remainingAttempts = null,
  secondsRemaining = 0,
  formattedCountdown = '00:00'
}) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="anim-element mb-5 p-4 rounded-xl bg-soft-red border border-brand-red/25 text-brand-red shadow-2xs transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-full bg-brand-red/10 text-brand-red shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-sm font-bold text-brand-red tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {description}
          </p>

          {policyText && (
            <p className="text-[11px] text-neutral-500 font-medium">
              {policyText}
            </p>
          )}

          {remainingAttempts !== null && remainingAttempts > 0 && (
            <p className="text-[11px] text-neutral-500 font-medium">
              Attempts remaining: {remainingAttempts}
            </p>
          )}

          {secondsRemaining > 0 ? (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-brand-red/20 text-brand-red font-mono font-bold text-xs shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-brand-red animate-pulse" aria-hidden="true" />
                <span>Try again in {formattedCountdown}</span>
              </span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-brand-red pt-1">
              Too many attempts. Please try again later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateLimitAlert;
