import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
}

interface ExpenseDonutChartProps {
  data: ExpenseData[];
  totalAmount: number;
}

export function ExpenseDonutChart({ data, totalAmount }: ExpenseDonutChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.category}</p>
          <p className="text-cyan-400 text-sm">
            {formatCurrency(data.amount)}
          </p>
          <p className="text-gray-400 text-xs">
            {((data.amount / totalAmount) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="
      relative backdrop-blur-xl rounded-2xl p-6
      bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-blue-600/20
      border border-blue-500/30
      shadow-2xl hover:shadow-blue-500/10
      transition-all duration-300
      overflow-hidden
    ">
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-lg font-semibold">All Expenses</h3>
          <select className="
            bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 
            text-gray-300 text-sm backdrop-blur-sm
            focus:outline-none focus:border-cyan-500/50
          ">
            <option>This month</option>
            <option>Last month</option>
            <option>This year</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-white text-2xl font-bold">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-gray-400 text-sm">Total</p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-4 ml-6">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between min-w-[200px]">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-300 text-sm font-medium">
                    {item.category}
                  </span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-cyan-500/10 rounded-full blur-lg" />
    </div>
  );
}
