import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTransactions } from '@/hooks/useStorage';
import { formatCurrency } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TrendData {
  date: string;
  value: number;
  movingAverage: number;
  growth: number;
}

interface TrendChartProps {
  metric?: 'income' | 'expenses' | 'profit' | 'transactions';
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export function TrendChart({ metric = 'profit', period = 'month' }: TrendChartProps) {
  const { transactions } = useTransactions();
  const [selectedMetric, setSelectedMetric] = useState(metric);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [chartType, setChartType] = useState<'line' | 'scatter'>('line');

  const trendData = React.useMemo(() => {
    const now = new Date();
    const data: TrendData[] = [];
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => 
        t.time.startsWith(dateStr)
      );
      
      let value = 0;
      switch (selectedMetric) {
        case 'income':
          value = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          break;
        case 'expenses':
          value = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          break;
        case 'profit':
          const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expenses = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          value = income - expenses;
          break;
        case 'transactions':
          value = dayTransactions.length;
          break;
      }
      
      data.push({
        date: selectedPeriod === 'week' 
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.getDate().toString(),
        value,
        movingAverage: 0, // Will be calculated below
        growth: 0 // Will be calculated below
      });
    }
    
    // Calculate moving average (7-day)
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - 6);
      const slice = data.slice(start, i + 1);
      data[i].movingAverage = slice.reduce((sum, d) => sum + d.value, 0) / slice.length;
      
      // Calculate growth rate
      if (i > 0) {
        const prevValue = data[i - 1].value;
        data[i].growth = prevValue !== 0 ? ((data[i].value - prevValue) / prevValue) * 100 : 0;
      }
    }
    
    return data;
  }, [transactions, selectedMetric, selectedPeriod]);

  const stats = React.useMemo(() => {
    if (trendData.length === 0) return { trend: 0, avgGrowth: 0, volatility: 0 };
    
    const values = trendData.map(d => d.value);
    const growthRates = trendData.slice(1).map(d => d.growth);
    
    const trend = values.length > 1 ? 
      ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;
    
    const avgGrowth = growthRates.length > 0 ? 
      growthRates.reduce((sum, g) => sum + g, 0) / growthRates.length : 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);
    
    return { trend, avgGrowth, volatility };
  }, [trendData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name === 'growth' 
                ? `${entry.name}: ${entry.value.toFixed(1)}%`
                : `${entry.name}: ${selectedMetric === 'transactions' ? entry.value : formatCurrency(entry.value)}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (trendData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No data available for trend analysis</p>
          <p className="text-sm">Add some transactions to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Trend</p>
                <p className={`text-xl font-bold ${
                  stats.trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
                </p>
              </div>
              {stats.trend >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Growth</p>
              <p className={`text-xl font-bold ${
                stats.avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.avgGrowth >= 0 ? '+' : ''}{stats.avgGrowth.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Volatility</p>
              <p className="text-xl font-bold text-blue-600">
                {selectedMetric === 'transactions' 
                  ? stats.volatility.toFixed(1)
                  : formatCurrency(stats.volatility)
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {(['income', 'expenses', 'profit', 'transactions'] as const).map((m) => (
            <Button
              key={m}
              variant={selectedMetric === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Button>
          ))}
        </div>
        
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
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'scatter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('scatter')}
          >
            Scatter
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={trendData}>
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
                tickFormatter={(value) => 
                  selectedMetric === 'transactions' 
                    ? value.toString()
                    : `₹${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              />
              <Line 
                type="monotone" 
                dataKey="movingAverage" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="7-Day Average"
              />
            </LineChart>
          ) : (
            <ScatterChart data={trendData}>
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
                tickFormatter={(value) => 
                  selectedMetric === 'transactions' 
                    ? value.toString()
                    : `₹${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter 
                dataKey="value" 
                fill="#3b82f6"
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
