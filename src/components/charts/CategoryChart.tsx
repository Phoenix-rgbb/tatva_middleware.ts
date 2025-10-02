import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useTransactions } from '@/hooks/useStorage';
import { formatCurrency } from '@/lib/storage';
import { Button } from '@/components/ui/button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

interface CategoryChartProps {
  type?: 'pie' | 'bar' | 'simple';
  transactionType?: 'expense' | 'income' | 'all';
}

export function CategoryChart({ type = 'simple', transactionType = 'expense' }: CategoryChartProps) {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'simple'>(type);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate category data from transactions
  const categoryData = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions
      .filter(t => transactionType === 'all' || t.type === transactionType)
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ 
        name, 
        value, 
        percentage: total > 0 ? (value / total) * 100 : 0,
        fill: COLORS[Object.keys(categoryTotals).indexOf(name) % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [transactions, transactionType]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.fill }}>
            {`Amount: ${formatCurrency(data.value)}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`${data.percentage.toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  if (categoryData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No {transactionType} data available</p>
          <p className="text-sm">Add some {transactionType} transactions to see the breakdown</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                fill="#8884d8"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.fill }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(category.value)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300 hover:brightness-110"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.fill
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex gap-2 justify-end">
        <Button
          variant={chartType === 'simple' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('simple')}
        >
          Simple
        </Button>
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('pie')}
        >
          <PieChartIcon className="mr-1 h-4 w-4" />
          Pie
        </Button>
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
        >
          <BarChart3 className="mr-1 h-4 w-4" />
          Bar
        </Button>
      </div>

      {/* Chart */}
      <div className={chartType === 'simple' ? 'h-auto' : 'h-[300px]'}>
        {renderChart()}
      </div>
      
      {/* Summary */}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total {transactionType === 'expense' ? 'Expenses' : transactionType === 'income' ? 'Income' : 'Amount'}</span>
          <span className="font-bold text-lg">
            {formatCurrency(categoryData.reduce((sum, cat) => sum + cat.value, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}