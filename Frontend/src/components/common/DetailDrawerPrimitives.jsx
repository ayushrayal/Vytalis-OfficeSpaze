import React from 'react';
import { ExternalLink, FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Format currency in INR format (e.g. ₹1,50,000)
 */
export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount));
};

/**
 * DetailSection: Grouped section container with heading and optional icon.
 */
export const DetailSection = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`space-y-3 font-urbanist ${className}`}>
    {title && (
      <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
        {Icon && <Icon className="w-4 h-4 text-[#ED1F23]" />}
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">{title}</h4>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">{children}</div>
  </div>
);

/**
 * DetailBadge: Semantic status/type pill.
 */
export const DetailBadge = ({ status, variant }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase();
  
  let styles = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  let Icon = null;

  if (variant === 'active' || normalized === 'active' || normalized === 'paid' || normalized === 'registor') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle;
  } else if (variant === 'expired' || normalized === 'expired' || normalized === 'due') {
    styles = 'bg-[#ED1F23]/10 text-[#ED1F23] border-[#ED1F23]/20';
    Icon = AlertCircle;
  } else if (normalized === 'paused' || normalized === 'non registor') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = Clock;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles} font-urbanist`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {status}
    </span>
  );
};

/**
 * DetailRow: Displays label and value with responsive layout and link support.
 */
export const DetailRow = ({
  label,
  value,
  fullWidth = false,
  isCurrency = false,
  isEmail = false,
  isPhone = false,
  isUrl = false,
  isDocument = false,
  documentUrl = null,
  documentName = null,
  isCode = false,
  isMultiline = false,
  badgeVariant = null,
  className = ''
}) => {
  const renderValue = () => {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      return <span className="text-neutral-400 text-xs italic">Not provided</span>;
    }

    if (badgeVariant || typeof value === 'boolean') {
      const displayVal = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
      return <DetailBadge status={displayVal} variant={badgeVariant} />;
    }

    if (isCurrency) {
      return <span className="font-bold text-neutral-900">{formatCurrencyINR(value)}</span>;
    }

    if (isEmail && value) {
      return (
        <a
          href={`mailto:${value}`}
          className="text-[#ED1F23] hover:underline font-medium break-all inline-flex items-center gap-1"
        >
          {value}
        </a>
      );
    }

    if (isPhone && value) {
      return (
        <a
          href={`tel:${value}`}
          className="text-neutral-900 hover:text-[#ED1F23] font-medium break-all inline-flex items-center gap-1"
        >
          {value}
        </a>
      );
    }

    if (isUrl && value) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ED1F23] hover:underline font-medium break-all inline-flex items-center gap-1"
        >
          <span>{value}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      );
    }

    if (isDocument && documentUrl) {
      return (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-semibold hover:bg-neutral-200 transition-all border border-neutral-200"
        >
          <FileText className="w-4 h-4 text-[#ED1F23]" />
          <span className="truncate max-w-[180px]">{documentName || 'View Document'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        </a>
      );
    }

    if (isCode) {
      return (
        <code className="text-xs bg-neutral-100 px-2 py-1 rounded font-mono text-neutral-800 break-all inline-block">
          {value}
        </code>
      );
    }

    if (isMultiline) {
      return (
        <p className="text-neutral-800 text-xs font-medium leading-relaxed whitespace-pre-wrap bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
          {value}
        </p>
      );
    }

    return <span className="text-neutral-900 font-medium text-sm break-words">{String(value)}</span>;
  };

  return (
    <div className={`${fullWidth ? 'sm:col-span-2' : ''} space-y-1 font-urbanist ${className}`}>
      <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
        {label}
      </span>
      <div>{renderValue()}</div>
    </div>
  );
};
