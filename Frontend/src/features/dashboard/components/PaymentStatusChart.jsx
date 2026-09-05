import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { calculateSumByField, formatINR } from '../utils/dashboard.utils';

const PaymentStatusChart = ({ data }) => {
  const utilityBills = data?.utilityBills || [];
  const dueUtilityBills = data?.dueUtilityBills || [];
  const salaries = data?.salaries || [];

  const utilityDue = calculateSumByField(dueUtilityBills, 'billAmount');
  const utilityPaid = calculateSumByField(
    utilityBills.filter((b) => b.status === 'Paid'),
    'billAmount'
  );

  const salaryDue = calculateSumByField(
    salaries.filter((s) => s.status === 'Due'),
    'employeeSalary'
  );
  const salaryPaid = calculateSumByField(
    salaries.filter((s) => s.status === 'Paid'),
    'employeeSalary'
  );

  const chartData = [
    { name: 'Utility Bills', Due: utilityDue, Paid: utilityPaid },
    { name: 'Salaries', Due: salaryDue, Paid: salaryPaid }
  ];

  const hasData = chartData.some((item) => item.Due > 0 || item.Paid > 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black">Paid vs Due Comparison</h3>
        <p className="text-xs text-muted-text">Monetary totals breakdown across financial modules.</p>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-xs text-muted-text bg-warm-bg/50 rounded-xl border border-dashed border-border">
          No financial payment data available
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#505050' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#505050' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px'
                }}
                formatter={(value) => [formatINR(value)]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Due" fill="#ED1F23" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusChart;
