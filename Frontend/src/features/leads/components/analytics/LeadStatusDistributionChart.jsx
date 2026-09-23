import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const STATUS_CONFIG = {
  NEW: { label: 'New', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700' },
  CONTACTED: { label: 'Contacted', color: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  FOLLOW_UP: { label: 'Follow Up', color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700' },
  QUALIFIED: { label: 'Qualified', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' },
  CONVERTED: { label: 'Converted', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  LOST: { label: 'Lost', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700' }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black text-white p-2.5 rounded-xl shadow-lg border border-neutral-800 text-xs space-y-1">
        <p className="font-semibold text-neutral-300">{data.statusLabel}</p>
        <p className="text-white font-bold">{data.count} leads ({data.percentage}%)</p>
      </div>
    );
  }
  return null;
};

const LeadStatusDistributionChart = ({ statusDistribution = {}, isLoading = false }) => {
  const chartData = Object.entries(STATUS_CONFIG).map(([key, config]) => {
    const stat = statusDistribution[key] || { count: 0, percentage: 0 };
    return {
      statusKey: key,
      statusLabel: config.label,
      count: stat.count || 0,
      percentage: stat.percentage || 0,
      fill: config.color
    };
  });

  const hasData = chartData.some((item) => item.count > 0);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="w-40 h-4 bg-neutral-200 rounded animate-pulse" />
        <div className="h-52 bg-warm-bg rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black">
          Current Lead Status Distribution
        </h3>
        <p className="text-xs text-muted-text">
          Distribution of matched leads across operational status categories.
        </p>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-xs text-muted-text bg-warm-bg/50 rounded-xl border border-dashed border-border">
          No lead records found for this period
        </div>
      ) : (
        <>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="statusLabel"
                  tick={{ fontSize: 11, fill: '#505050' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#505050' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-border">
            {chartData.map((item) => {
              const config = STATUS_CONFIG[item.statusKey];
              return (
                <div
                  key={item.statusKey}
                  className={`p-2.5 rounded-xl border border-border/50 flex flex-col justify-between ${config.bg}`}
                >
                  <span className={`text-[11px] font-bold ${config.text}`}>
                    {config.label}
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold text-black">{item.count}</span>
                    <span className="text-[10px] font-semibold text-muted-text">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LeadStatusDistributionChart;
