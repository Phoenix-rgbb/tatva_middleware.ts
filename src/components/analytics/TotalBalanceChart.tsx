import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BalanceData {
  day: string;
  replenishment: number;
  cashback: number;
}

interface TotalBalanceChartProps {
  data: BalanceData[];
}

export function TotalBalanceChart({ data }: TotalBalanceChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300 text-sm">{entry.name}:</span>
              <span className="text-white font-semibold">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    if (payload && payload[dataKey] === Math.max(...data.map(d => Number(d[dataKey as keyof BalanceData])))) {
      return (
        <g>
          <circle 
            cx={cx} 
            cy={cy} 
            r={4} 
            fill={dataKey === 'replenishment' ? '#FF1493' : '#00FFFF'}
            stroke="#fff" 
            strokeWidth={2}
          />
          <foreignObject x={cx - 25} y={cy - 35} width={50} height={20}>
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded text-center">
              {formatCurrency(payload[dataKey])}
            </div>
          </foreignObject>
        </g>
      );
    }
    return null;
  };

  return (
    <div className="
      relative backdrop-blur-xl rounded-2xl p-6
      bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-cyan-600/20
      border border-cyan-500/30
      shadow-2xl hover:shadow-cyan-500/10
      transition-all duration-300
      overflow-hidden
    ">
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-lg font-semibold">Total Balance</h3>
          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-gray-300">Replenishment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-300">Cashback</span>
              </div>
            </div>
            <select className="
              bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 
              text-gray-300 text-sm backdrop-blur-sm
              focus:outline-none focus:border-cyan-500/50
            ">
              <option>This week</option>
              <option>Last week</option>
              <option>This month</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Replenishment Line */}
              <Line
                type="monotone"
                dataKey="replenishment"
                stroke="#FF1493"
                strokeWidth={3}
                dot={<CustomDot dataKey="replenishment" />}
                activeDot={{ r: 6, fill: '#FF1493', stroke: '#fff', strokeWidth: 2 }}
                name="Replenishment"
              />
              
              {/* Cashback Line */}
              <Line
                type="monotone"
                dataKey="cashback"
                stroke="#00FFFF"
                strokeWidth={3}
                dot={<CustomDot dataKey="cashback" />}
                activeDot={{ r: 6, fill: '#00FFFF', stroke: '#fff', strokeWidth: 2 }}
                name="Cashback"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
    </div>
  );
}
