import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Shared modern FilterSelect dropdown component for Vytalis OfficeSpaze.
 * Replaces native <select> elements with an enterprise, accessible, and polished dropdown.
 */
const FilterSelect = ({
  label,
  value,
  options = [],
  onChange,
  placeholder = 'Select...',
  icon: Icon,
  disabled = false,
  className = '',
  menuClassName = '',
  align = 'left', // 'left' | 'right'
  ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState('bottom'); // 'bottom' | 'top'
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const triggerId = useId();

  // Normalize options to { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    const val = opt.value !== undefined ? opt.value : opt.id;
    const lbl = opt.label !== undefined ? opt.label : String(val);
    return {
      value: val,
      label: lbl,
      icon: opt.icon
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Handle click outside and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleGlobalKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen]);

  // Determine whether to open downwards or upwards based on viewport space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen]);

  // Sync highlighted option on open
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, normalizedOptions]);

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || (label ? `${label} filter` : 'Filter select')}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 bg-neutral-50/90 hover:bg-neutral-100/90 active:bg-neutral-200/70 border border-neutral-200/90 rounded-xl text-xs font-semibold text-black transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-black/10 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
          {Icon && (
            <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          )}
          {label && (
            <span className="text-neutral-500 font-medium whitespace-nowrap">
              {label}:
            </span>
          )}
          <span className="font-bold text-black truncate">
            {displayText}
          </span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180 text-black' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          aria-labelledby={triggerId}
          className={`absolute min-w-[160px] w-max max-w-[calc(100vw-2.5rem)] bg-white border border-neutral-200 rounded-xl shadow-xl p-1 z-50 max-h-64 overflow-y-auto animate-in fade-in duration-150 ${
            placement === 'top'
              ? 'bottom-full mb-1.5 slide-in-from-bottom-1'
              : 'top-full mt-1.5 slide-in-from-top-1'
          } ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;

            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-neutral-100 text-black font-bold'
                    : isHighlighted
                    ? 'bg-neutral-50 text-black font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                }`}
              >
                <span className="w-3.5 flex items-center justify-center shrink-0">
                  {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
                </span>
                {opt.icon && <opt.icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
