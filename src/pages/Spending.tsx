import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { StatsCard } from "@/components/StatsCard";
import { TrendingDown, Calendar, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useTransactions } from "@/hooks/useStorage";
import { formatCurrency } from "@/lib/storage";

export default function Spending() {
  const { t } = useI18n();
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'overview' | 'trends' | 'categories'>('overview');

  // Calculate spending statistics
  const spendingStats = React.useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().slice(0, 7);
    
    const todayExpenses = transactions
      .filter(t => t.type === 'expense' && t.time.startsWith(today))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && t.time.startsWith(thisMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate top categories
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    
    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
    
    // Calculate growth rate (this month vs last month)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    
    const lastMonthExpenses = transactions
      .filter(t => t.type === 'expense' && t.time.startsWith(lastMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const growthRate = lastMonthExpenses > 0 ? ((monthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
    
    return {
      todayExpenses,
      monthExpenses,
      totalExpenses,
      topCategories,
      growthRate
    };
  }, [transactions]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Spending Analysis
          </h1>
          <p className="text-muted-foreground">Track and analyze your spending patterns</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('overview')}
          >
            <PieChart className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={chartView === 'trends' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('trends')}
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Trends
          </Button>
          <Button
            variant={chartView === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('categories')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Categories
          </Button>
        </div>
      </div>

      {/* Key Spending Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Today's Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(spendingStats.todayExpenses)}</p>
                <p className="text-xs text-white/70">Daily spending</p>
              </div>
              <TrendingDown className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(spendingStats.monthExpenses)}</p>
                <p className="text-xs text-white/70">
                  {spendingStats.growthRate >= 0 ? '+' : ''}{spendingStats.growthRate.toFixed(1)}% vs last month
                </p>
              </div>
              <Calendar className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(spendingStats.totalExpenses)}</p>
                <p className="text-xs text-white/70">All time</p>
              </div>
              <BarChart3 className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Categories</p>
                <p className="text-2xl font-bold">{spendingStats.topCategories.length}</p>
                <p className="text-xs text-white/70">Active spending areas</p>
              </div>
              <PieChart className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Dynamic Content Based on View */}
      {chartView === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart type="pie" transactionType="expense" />
              </CardContent>
            </Card>
            
            {/* Top Spending Categories List */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingStats.topCategories.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>
                        <p className="text-xs text-muted-foreground">
                          {((item.amount / spendingStats.totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Spending vs Income Comparison */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Spending vs Income Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart type="bar" period={selectedPeriod} />
            </CardContent>
          </Card>
        </>
      )}

      {chartView === 'trends' && (
        <>
          {/* Expense Trend Analysis */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Expense Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart metric="expenses" period={selectedPeriod} />
            </CardContent>
          </Card>
          
          {/* Spending Pattern Over Time */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Spending Pattern Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart type="line" period={selectedPeriod} />
            </CardContent>
          </Card>
        </>
      )}

      {chartView === 'categories' && (
        <>
          {/* Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Category Distribution (Bar Chart)</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart type="bar" transactionType="expense" />
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Category Distribution (Pie Chart)</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart type="pie" transactionType="expense" />
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Category Breakdown */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Detailed Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart type="simple" transactionType="expense" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


