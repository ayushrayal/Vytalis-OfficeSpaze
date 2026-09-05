import React from 'react';

const KpiCard = ({ icon: Icon, label, value, subtext, badgeText, badgeColor = 'bg-warm-bg text-black' }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-brand-red/30 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-black tracking-tight">{value}</p>
        {subtext && <p className="text-[11px] text-muted-text mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
};

export default KpiCard;
