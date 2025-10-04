import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Target, DollarSign } from 'lucide-react';

interface KPIData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface BusinessKPIChartProps {
  kpiData: KPIData[];
  centerMetric: {
    label: string;
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  keyMetrics: Array<{
    label: string;
    value: number;
    change: number;
    icon: string;
  }>;
}

export function BusinessKPIChart({ kpiData, centerMetric, keyMetrics }: BusinessKPIChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getIcon = (iconName: string) => {
    const icons = {
      users: Users,
      cart: ShoppingCart,
      target: Target,
      dollar: DollarSign
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Users;
    return <IconComponent className="w-5 h-5" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-cyan-400 font-medium">{data.name}</p>
          <p className="text-white text-lg font-bold">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="
      relative backdrop-blur-xl rounded-2xl p-6 
      bg-gradient-to-br from-gray-900/80 via-blue-900/20 to-gray-900/80
      border border-cyan-500/20
      shadow-2xl hover:shadow-cyan-500/10 
      transition-all duration-300
      overflow-hidden
    ">
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Business KPIs</h3>
        <p className="text-gray-400 text-sm">Key performance indicators overview</p>
      </div>

      {/* KPI Chart and Center Metric */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex-shrink-0">
          {kpiData && kpiData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {kpiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                </ResponsiveContainer>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-2">No KPI data</div>
                <div className="text-gray-400 text-xs">Add business metrics to see chart</div>
              </div>
            </div>
          )}
          
          {/* Center Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-white text-2xl font-bold">
              {centerMetric.value}%
            </p>
            <p className="text-gray-400 text-xs text-center">{centerMetric.label}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs ${
              centerMetric.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {centerMetric.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(centerMetric.percentage).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 lg:ml-6 w-full lg:w-auto">
          {kpiData.map((item, index) => (
            <div key={index} className="flex items-center justify-between min-w-0 lg:min-w-[180px]">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
              <span className="text-white font-medium">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="relative z-10 space-y-3">
        <h4 className="text-lg font-semibold text-white mb-3">Key Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="
              bg-gray-800/50 rounded-lg p-3 border border-gray-700/50
              hover:border-cyan-500/30 transition-colors duration-200
              min-w-0
            ">
              <div className="flex items-center justify-between mb-2">
                <div className="text-cyan-400">
                  {getIcon(metric.icon)}
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  metric.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-1">{metric.label}</p>
              <p className="text-white text-lg font-bold">
                {formatNumber(metric.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
    </div>
  );
}
