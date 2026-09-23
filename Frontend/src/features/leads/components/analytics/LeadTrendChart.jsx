import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white p-3 rounded-xl shadow-lg border border-neutral-800 text-xs space-y-1">
        <p className="font-semibold text-neutral-300">{label}</p>
        <div className="space-y-0.5">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const LeadTrendChart = ({ trends = [], isLoading = false }) => {
  const hasData = trends.some((t) => (t.leads || 0) > 0 || (t.conversions || 0) > 0);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse" />
        <div className="h-64 bg-warm-bg rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">
            Lead & Conversion Trends
          </h3>
          <p className="text-xs text-muted-text">
            Daily incoming leads and official converted outcomes across Asia/Kolkata dates.
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-text bg-warm-bg/50 rounded-xl border border-dashed border-border gap-1">
          <p className="font-medium text-black">No lead activity recorded for this period</p>
          <p className="text-[11px] text-muted-text">Try expanding your date range filter.</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#505050' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => {
                  if (!val) return '';
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#505050' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads Created"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#leadGrad)"
              />
              <Area
                type="monotone"
                dataKey="conversions"
                name="Conversions"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#convGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LeadTrendChart;
