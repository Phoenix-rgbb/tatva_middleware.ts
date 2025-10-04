import React from 'react';
import { BalanceCard } from './analytics/BalanceCard';
import { ExpenseDonutChart } from './analytics/ExpenseDonutChart';
import { TotalBalanceChart } from './analytics/TotalBalanceChart';
import { IncomeBarChart } from './analytics/IncomeBarChart';
import { BudgetProgress } from './analytics/BudgetProgress';
import { db } from '@/lib/database';

export function AnalyticsDashboard() {
  const [transactions, setTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadTransactions = () => {
      setTransactions(db.getTransactions());
    };
    
    loadTransactions();
    const unsubscribe = db.subscribe(() => loadTransactions());
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
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

  // Generate trend data for KPI cards based on actual transactions
  const generateTrendData = (baseValue: number) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      });
      
      const dayValue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { value: dayValue };
    });
    
    return last7Days;
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
      .slice(0, 4);
  }, [transactions]);

  // Calculate weekly balance data from actual transactions
  const balanceData = React.useMemo(() => {
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const now = new Date();
    const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      });
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        day,
        replenishment: income,
        cashback: Math.max(0, income - expenses) // Net positive as cashback
      };
    });
  }, [transactions]);

  // Calculate income statistics data from actual transactions
  const incomeData = React.useMemo(() => {
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const now = new Date();
    const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      });
      
      const totalIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        day,
        replenishment: totalIncome,
        cashback: totalExpenses
      };
    });
  }, [transactions]);

  // Calculate budget data from actual transactions
  const budgetData = React.useMemo(() => {
    // Group transactions by category and calculate totals
    const categorySpending: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount;
      });
    
    // Create budget items based on actual spending categories
    const budgetItems = Object.entries(categorySpending)
      .map(([category, spent], index) => {
        const colors = [
          'from-purple-500 to-pink-500',
          'from-blue-500 to-cyan-500',
          'from-green-500 to-emerald-500',
          'from-indigo-500 to-purple-500',
          'from-orange-500 to-red-500',
          'from-teal-500 to-cyan-500'
        ];
        
        // Set realistic targets based on spending patterns
        const target = Math.max(spent * 1.2, spent + 500); // 20% more than current or +500
        
        return {
          name: category,
          current: spent,
          target: target,
          color: colors[index % colors.length]
        };
      })
      .sort((a, b) => b.current - a.current) // Sort by highest spending
      .slice(0, 4); // Top 4 categories
    
    return budgetItems;
  }, [transactions]);

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  // Calculate trend data for KPI cards
  const balanceTrendData = generateTrendData(monthStats.totalBalance);
  const incomeTrendData = generateTrendData(monthStats.totalIncome);
  const expenseTrendData = generateTrendData(monthStats.totalExpenses);

  // Calculate percentage changes based on actual data
  const calculatePercentageChange = (currentValue: number, trendData: Array<{ value: number }>) => {
    if (trendData.length < 2) return 0;
    const previousValue = trendData[trendData.length - 2]?.value || 0;
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const balancePercentage = calculatePercentageChange(monthStats.totalBalance, balanceTrendData);
  const incomePercentage = calculatePercentageChange(monthStats.totalIncome, incomeTrendData);
  const expensePercentage = calculatePercentageChange(monthStats.totalExpenses, expenseTrendData);

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
            percentage={balancePercentage}
            trendData={balanceTrendData}
            variant="balance"
          />
          <BalanceCard
            title="Income"
            value={monthStats.totalIncome}
            percentage={incomePercentage}
            trendData={incomeTrendData}
            variant="income"
          />
          <BalanceCard
            title="Expenses"
            value={monthStats.totalExpenses}
            percentage={expensePercentage}
            trendData={expenseTrendData}
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
