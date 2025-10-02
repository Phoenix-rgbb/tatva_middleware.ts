import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useTransactions } from '@/hooks/useStorage';
import { formatCurrency } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfitLossData {
  date: string;
  income: number;
  expenses: number;
  profit: number;
  cumulativeProfit: number;
}

interface ProfitLossChartProps {
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export function ProfitLossChart({ period = 'month' }: ProfitLossChartProps) {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<'area' | 'composed'>('area');
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const chartData = React.useMemo(() => {
    const now = new Date();
    const data: ProfitLossData[] = [];
    let cumulativeProfit = 0;
    
    // Determine the number of periods and date format
    const periods = {
      week: { count: 7, format: (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }) },
      month: { count: 30, format: (date: Date) => date.getDate().toString() },
      quarter: { count: 90, format: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
      year: { count: 365, format: (date: Date) => date.toLocaleDateString('en-US', { month: 'short' }) }
    };
    
    const { count, format } = periods[selectedPeriod];
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => 
        t.time.startsWith(dateStr)
      );
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const profit = income - expenses;
      cumulativeProfit += profit;
      
      data.push({
        date: format(date),
        income,
        expenses,
        profit,
        cumulativeProfit
      });
    }
    
    return data;
  }, [transactions, selectedPeriod]);

  const stats = React.useMemo(() => {
    const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0);
    const totalProfit = totalIncome - totalExpenses;
    const avgDailyProfit = chartData.length > 0 ? totalProfit / chartData.length : 0;
    
    return {
      totalIncome,
      totalExpenses,
      totalProfit,
      avgDailyProfit,
      profitMargin: totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No transaction data available</p>
          <p className="text-sm">Add some transactions to see profit/loss analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className={`text-xl font-bold ${
                  stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.totalProfit)}
                </p>
              </div>
              {stats.totalProfit >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className={`text-xl font-bold ${
                  stats.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.profitMargin.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={selectedPeriod === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
          <Button
            variant={chartType === 'composed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('composed')}
          >
            Combined
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                fill="url(#profitGradient)"
                strokeWidth={2}
                name="Daily Profit"
              />
              <Area
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="#3b82f6"
                fill="rgba(59, 130, 246, 0.1)"
                strokeWidth={2}
                name="Cumulative Profit"
              />
            </AreaChart>
          ) : (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[2, 2, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="cumulativeProfit" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Cumulative Profit"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}