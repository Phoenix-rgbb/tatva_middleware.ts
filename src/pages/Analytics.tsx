import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart, DollarSign, Activity, Calendar } from "lucide-react";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { ProfitLossChart } from "@/components/charts/ProfitLossChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { useTransactions, useStats } from "@/hooks/useStorage";
import { formatCurrency } from "@/lib/storage";

export default function Analytics() {
  const { transactions } = useTransactions();
  const { stats } = useStats();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');

  const analyticsStats = React.useMemo(() => {
    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    
    // Calculate growth (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const recentIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.time) >= last30Days)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.time) >= previous30Days && new Date(t.time) < last30Days)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const growthRate = previousIncome > 0 ? ((recentIncome - previousIncome) / previousIncome) * 100 : 0;
    
    const categories = [...new Set(transactions.map(t => t.category))].length;
    
    return {
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      growthRate,
      categories,
      totalTransactions
    };
  }, [transactions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Deep insights into your business performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('overview')}
          >
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={selectedView === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('detailed')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Detailed
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsStats.totalIncome)}</p>
                <p className="text-xs text-white/70">
                  {analyticsStats.growthRate >= 0 ? '+' : ''}{analyticsStats.growthRate.toFixed(1)}% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Profit Margin</p>
                <p className="text-2xl font-bold">{analyticsStats.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-white/70">Current margin rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Active Categories</p>
                <p className="text-2xl font-bold">{analyticsStats.categories}</p>
                <p className="text-xs text-white/70">Business categories</p>
              </div>
              <PieChart className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Transactions</p>
                <p className="text-2xl font-bold">{analyticsStats.totalTransactions}</p>
                <p className="text-xs text-white/70">All time</p>
              </div>
              <BarChart3 className="h-8 w-8 text-white/80" />
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
            <Calendar className="mr-2 h-4 w-4" />
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>
      
      {selectedView === 'overview' ? (
        <>
          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart type="line" period={selectedPeriod} />
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart type="pie" transactionType="all" />
              </CardContent>
            </Card>
          </div>
          
          {/* Profit/Loss Analysis */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Profit & Loss Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitLossChart period={selectedPeriod} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 gap-6">
            {/* Income Trends */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Income Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart metric="income" period={selectedPeriod} />
              </CardContent>
            </Card>
            
            {/* Expense Trends */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Expense Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart metric="expenses" period={selectedPeriod} />
              </CardContent>
            </Card>
            
            {/* Transaction Volume */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Transaction Volume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart metric="transactions" period={selectedPeriod} />
              </CardContent>
            </Card>
            
            {/* Category Breakdown - Multiple Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Income by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryChart type="bar" transactionType="income" />
                </CardContent>
              </Card>
              
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryChart type="bar" transactionType="expense" />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}