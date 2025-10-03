import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/database';
import { analytics } from '@/lib/analytics';
import { AnalyticsMetrics } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, TriangleAlert as AlertTriangle, Download, ChartArea as TrendChart } from 'lucide-react';
import { Line, Bar, Pie } from 'recharts';
import { ResponsiveContainer, LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AdvancedAnalytics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadAnalytics();
    const unsubscribe = db.subscribe(() => loadAnalytics());
    return unsubscribe;
  }, []);

  const loadAnalytics = () => {
    const transactions = db.getTransactions();
    const products = db.getProducts();
    const metricsData = analytics.calculateMetrics(transactions, products);
    const alertsData = analytics.detectAlerts(transactions, products);

    setMetrics(metricsData);
    setAlerts(alertsData);
  };

  const handleExport = () => {
    if (!metrics) return;

    const data = analytics.exportToJSON({
      metrics,
      alerts,
      exportDate: new Date().toISOString(),
    });

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const trendData = metrics.trends[timeRange];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics</h1>
          <p className="text-slate-600 mt-1">Deep insights into your business performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-900">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <p className="text-slate-900">{alert.message}</p>
                  <Badge variant="outline" className={
                    alert.severity === 'error' ? 'border-red-500 text-red-700' : 'border-amber-500 text-amber-700'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{metrics.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">Net profit ratio</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{metrics.growthRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">vs previous period</p>
              </div>
              {metrics.growthRate >= 0 ? (
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Expense Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{metrics.expenseRatio.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">of total revenue</p>
              </div>
              <DollarSign className="w-8 h-8 text-violet-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">₹{metrics.netProfit.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Total earnings</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Expense Trends</CardTitle>
            <CardDescription>Income vs expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.topCategories.slice(0, 7)}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${entry.percentage.toFixed(0)}%`}
                >
                  {metrics.topCategories.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.topProducts.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product.name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No product data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Highest spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topCategories.slice(0, 8).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-20 text-right">
                      ₹{cat.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 w-12 text-right">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">₹{metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500">All income sources</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">₹{metrics.totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-500">All costs and purchases</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Net Profit</p>
              <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ₹{metrics.netProfit.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Revenue minus expenses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
