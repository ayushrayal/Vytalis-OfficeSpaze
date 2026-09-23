import React from 'react';
import { CheckCircle2, Building2, Building, Users, Briefcase, HelpCircle } from 'lucide-react';

const TYPE_CONFIG = {
  VIRTUAL_OFFICE: { label: 'Virtual Office', icon: Building2, color: '#3b82f6', barColor: 'bg-blue-600' },
  MANAGED_OFFICE: { label: 'Managed Office', icon: Building, color: '#6366f1', barColor: 'bg-indigo-600' },
  COWORK_SPACE: { label: 'Cowork Space', icon: Users, color: '#f59e0b', barColor: 'bg-amber-600' },
  DEDICATED_SPACE: { label: 'Dedicated Space', icon: Briefcase, color: '#10b981', barColor: 'bg-emerald-600' },
  OTHER: { label: 'Other', icon: HelpCircle, color: '#8b5cf6', barColor: 'bg-purple-600' }
};

const ConversionTypeChart = ({ conversionSummary = {}, isLoading = false }) => {
  const byType = conversionSummary?.byType || {};
  const totalConverted = conversionSummary?.totalConverted || 0;
  const conversionRate = conversionSummary?.conversionRate || 0;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="w-36 h-4 bg-neutral-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-warm-bg rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">
            Conversions by Type
          </h3>
          <p className="text-xs text-muted-text">
            Official Phase 4A converted business outcomes breakdown.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-text uppercase">Total Converted</span>
          <p className="text-base font-bold text-emerald-600">
            {totalConverted} <span className="text-xs font-normal text-muted-text">({conversionRate}%)</span>
          </p>
        </div>
      </div>

      {totalConverted === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-muted-text bg-warm-bg/50 rounded-xl border border-dashed border-border">
          No conversions recorded in this period
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(TYPE_CONFIG).map(([key, config]) => {
            const data = byType[key] || { count: 0, percentage: 0 };
            const Icon = config.icon;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-text" />
                    <span className="font-semibold text-black">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-black font-bold">{data.count}</span>
                    <span className="text-muted-text text-[11px]">({data.percentage}%)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-warm-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, data.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversionTypeChart;
