import React from 'react';
import { BalanceCard } from './analytics/BalanceCard';
import { ExpenseDonutChart } from './analytics/ExpenseDonutChart';
import { TotalBalanceChart } from './analytics/TotalBalanceChart';
import { IncomeBarChart } from './analytics/IncomeBarChart';
import { BudgetProgress } from './analytics/BudgetProgress';
import { useTransactions, useStats } from '@/hooks/useStorage';

export function AnalyticsDashboard() {
  const { transactions } = useTransactions();
  const { todayStats, stats } = useStats();
  
  // Calculate monthly stats from transactions
  const monthStats = React.useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses
    };
  }, [transactions]);

  // Generate trend data for KPI cards
  const generateTrendData = (baseValue: number, variance: number = 0.1) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue * (1 + (Math.random() - 0.5) * variance)
    }));
  };

  // Calculate expense breakdown from transactions
  const expenseData = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const colors = {
      'Shopping': '#FF1493',
      'Home': '#00FFFF', 
      'Vacation': '#8A2BE2',
      'Food': '#32CD32',
      'Transport': '#FF6347',
      'Entertainment': '#FFD700',
      'Other': '#9370DB'
    };

    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        color: colors[category as keyof typeof colors] || colors.Other
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4); // Top 4 categories
  }, [transactions]);

  // Generate weekly balance data
  const balanceData = React.useMemo(() => {
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    return days.map(day => ({
      day,
      replenishment: Math.floor(Math.random() * 3000) + 1000,
      cashback: Math.floor(Math.random() * 1500) + 500
    }));
  }, []);

  // Generate income statistics data
  const incomeData = React.useMemo(() => {
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    return days.map(day => ({
      day,
      replenishment: Math.floor(Math.random() * 4000) + 1000,
      cashback: Math.floor(Math.random() * 2000) + 500
    }));
  }, []);

  // Budget planning data
  const budgetData = [
    {
      name: 'Visit to USA',
      current: 3100,
      target: 4000,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Car',
      current: 2000,
      target: 10000,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Computer',
      current: 2100,
      target: 3200,
      color: 'from-cyan-500 to-teal-500'
    },
    {
      name: 'Phone for mom',
      current: 1680,
      target: 1800,
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive financial insights and trends</p>
        </div>

        {/* Top Row - KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard
            title="Total Balance"
            value={monthStats.totalBalance}
            percentage={14.1}
            trendData={generateTrendData(monthStats.totalBalance)}
            variant="balance"
          />
          <BalanceCard
            title="Income"
            value={monthStats.totalIncome}
            percentage={18.2}
            trendData={generateTrendData(monthStats.totalIncome)}
            variant="income"
          />
          <BalanceCard
            title="Expenses"
            value={monthStats.totalExpenses}
            percentage={-2.4}
            trendData={generateTrendData(monthStats.totalExpenses)}
            variant="expense"
          />
        </div>

        {/* Middle Row - Expense Breakdown & Total Balance Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ExpenseDonutChart
            data={expenseData}
            totalAmount={totalExpenses}
          />
          <TotalBalanceChart data={balanceData} />
        </div>

        {/* Bottom Row - Income Statistics & Planning Progress */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <IncomeBarChart data={incomeData} />
          <BudgetProgress budgets={budgetData} />
        </div>

        {/* Additional Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Quick Stats Cards */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-xl p-4 border border-emerald-500/30">
            <div className="text-emerald-400 text-sm font-medium">Avg Daily Income</div>
            <div className="text-white text-2xl font-bold mt-1">
              ${(monthStats.totalIncome / 30).toFixed(0)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl p-4 border border-red-500/30">
            <div className="text-red-400 text-sm font-medium">Avg Daily Expense</div>
            <div className="text-white text-2xl font-bold mt-1">
              ${(monthStats.totalExpenses / 30).toFixed(0)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
            <div className="text-blue-400 text-sm font-medium">Savings Rate</div>
            <div className="text-white text-2xl font-bold mt-1">
              {((monthStats.totalIncome - monthStats.totalExpenses) / monthStats.totalIncome * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
            <div className="text-purple-400 text-sm font-medium">Transactions</div>
            <div className="text-white text-2xl font-bold mt-1">
              {transactions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
