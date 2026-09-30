import React from 'react';
import FilterSelect from '../../../components/ui/FilterSelect';
import { LEAD_PRIORITY_CONFIG, PRIORITY_SELECT_OPTIONS } from '../constants/leads.constant';

const PRIORITY_DROPDOWN_OPTIONS = PRIORITY_SELECT_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
  dotClass: LEAD_PRIORITY_CONFIG[opt.value]?.dotClass
}));

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
      <FilterSelect
        value={normPriority}
        onChange={(val) => onChange && onChange(val)}
        options={PRIORITY_DROPDOWN_OPTIONS}
        disabled={isPending}
        isPending={isPending}
        className="w-full sm:w-auto min-w-[130px]"
        buttonClassName="bg-white py-1.5 px-3 border-neutral-200"
      />
    </div>
  );
};

export default LeadPriority;
