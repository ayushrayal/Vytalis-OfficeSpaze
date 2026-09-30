import React from 'react';
import { RefreshCw } from 'lucide-react';
import { LEAD_PRIORITY_CONFIG, PRIORITY_SELECT_OPTIONS } from '../constants/leads.constant';

/**
 * Reusable LeadPriority component.
 * Displays HIGH, MEDIUM, or LOW using the OfficeSpaze design language.
 *
 * @param {Object} props
 * @param {string} props.priority - 'HIGH' | 'MEDIUM' | 'LOW' (defaults to 'MEDIUM')
 * @param {boolean} [props.editable=false] - Whether priority can be changed via select
 * @param {(newPriority: string) => void} [props.onChange] - Callback when priority is selected
 * @param {boolean} [props.isPending=false] - Whether a mutation is currently in-flight
 * @param {'sm'|'md'} [props.size='md'] - Sizing variant
 * @param {string} [props.className=''] - Additional CSS classes
 */
const LeadPriority = ({
  priority,
  editable = false,
  onChange,
  isPending = false,
  size = 'md',
  className = ''
}) => {
  const normPriority = (priority || 'MEDIUM').toUpperCase();
  const cfg = LEAD_PRIORITY_CONFIG[normPriority] || LEAD_PRIORITY_CONFIG.MEDIUM;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px]'
      : 'px-2.5 py-1 text-xs';

  if (!editable) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${cfg.badgeClass} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
        <span>{cfg.label}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <select
        value={normPriority}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={isPending}
        className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all cursor-pointer disabled:opacity-50"
      >
        {PRIORITY_SELECT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${cfg.badgeClass} ${sizeClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
        <span>{cfg.label}</span>
      </span>
      {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />}
    </div>
  );
};

export default LeadPriority;
