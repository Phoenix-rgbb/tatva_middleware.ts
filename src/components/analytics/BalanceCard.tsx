import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  value: number;
  percentage: number;
  trendData: Array<{ value: number }>;
  variant?: 'balance' | 'income' | 'expense';
}

export function BalanceCard({ 
  title, 
  value, 
  percentage, 
  trendData, 
  variant = 'balance' 
}: BalanceCardProps) {
  const isPositive = percentage >= 0;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          gradient: 'from-cyan-500/20 via-teal-500/15 to-cyan-600/20',
          border: 'border-cyan-500/30',
          lineColor: '#00FFFF'
        };
      case 'expense':
        return {
          gradient: 'from-blue-500/20 via-indigo-500/15 to-blue-600/20',
          border: 'border-blue-500/30',
          lineColor: '#3B82F6'
        };
      default:
        return {
          gradient: 'from-cyan-400/20 via-blue-500/15 to-cyan-500/20',
          border: 'border-cyan-400/30',
          lineColor: '#22D3EE'
        };
    }
  };

  const styles = getVariantStyles();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={`
      relative backdrop-blur-xl rounded-2xl p-6 
      bg-gradient-to-br ${styles.gradient}
      border ${styles.border}
      shadow-2xl hover:shadow-cyan-500/10 
      transition-all duration-300 hover:-translate-y-1
      overflow-hidden
    `}>
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-300 text-sm font-medium mb-1">{title}</p>
            <p className="text-white text-3xl font-bold">
              {formatCurrency(value)}
            </p>
          </div>
          
          {/* Trend indicator */}
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
            ${isPositive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }
          `}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(percentage).toFixed(1)}%
          </div>
        </div>

        {/* Mini trend chart */}
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={styles.lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: styles.lineColor }}
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
