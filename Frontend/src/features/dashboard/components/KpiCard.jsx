import React from 'react';

const KpiCard = ({ icon: Icon, label, value, subtext, badgeText, badgeColor = 'bg-warm-bg text-black' }) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs hover:border-brand-red/30 transition-all duration-200 flex flex-col justify-between min-w-0">
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-1 truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-extrabold text-black tracking-tight truncate">{value}</p>
        {subtext && <p className="text-[11px] text-muted-text mt-1 font-medium truncate">{subtext}</p>}
      </div>
    </div>
  );
};

export default KpiCard;
