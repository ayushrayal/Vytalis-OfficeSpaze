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

const SpaceDistributionChart = ({ data }) => {
  const virtualOffices = data?.virtualOffices || [];
  const managedOffices = data?.managedOffices || [];
  const coworkSpaces = data?.coworkSpaces || [];
  const dedicatedSpaces = data?.dedicatedSpaces || [];

  const chartData = [
    { name: 'Virtual', count: virtualOffices.length, fill: '#3b82f6' },
    { name: 'Managed', count: managedOffices.length, fill: '#6366f1' },
    { name: 'Cowork', count: coworkSpaces.length, fill: '#f59e0b' },
    { name: 'Dedicated', count: dedicatedSpaces.length, fill: '#10b981' }
  ];

  const hasData = chartData.some((item) => item.count > 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black">Space Distribution</h3>
        <p className="text-xs text-muted-text">Record counts across workspace modules.</p>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-xs text-muted-text bg-warm-bg/50 rounded-xl border border-dashed border-border">
          No space records created yet
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#505050' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#505050' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SpaceDistributionChart;
