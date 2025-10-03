import { Transaction, Product, AnalyticsMetrics } from '@/types';
import { startOfDay, startOfWeek, startOfMonth, format, subDays, subWeeks, subMonths } from 'date-fns';

export class AnalyticsEngine {
  calculateMetrics(transactions: Transaction[], products: Product[]): AnalyticsMetrics {
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    const previousPeriodRevenue = this.getPreviousPeriodRevenue(transactions);
    const growthRate = previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0;

    const topProducts = this.getTopProducts(transactions, products);
    const topCategories = this.getTopCategories(transactions);
    const trends = this.calculateTrends(transactions);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      expenseRatio,
      growthRate,
      topProducts,
      topCategories,
      trends,
    };
  }

  private getPreviousPeriodRevenue(transactions: Transaction[]): number {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sixtyDaysAgo = subDays(new Date(), 60);

    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && date >= sixtyDaysAgo && date < thirtyDaysAgo;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private getTopProducts(transactions: Transaction[], products: Product[]) {
    const productStats = new Map<string, { revenue: number; quantity: number }>();

    transactions
      .filter(t => t.type === 'income' && t.productId)
      .forEach(t => {
        const current = productStats.get(t.productId!) || { revenue: 0, quantity: 0 };
        productStats.set(t.productId!, {
          revenue: current.revenue + t.amount,
          quantity: current.quantity + 1,
        });
      });

    const results = Array.from(productStats.entries())
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        return product ? { product, ...stats } : null;
      })
      .filter(Boolean) as Array<{ product: Product; revenue: number; quantity: number }>;

    return results.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  private getTopCategories(transactions: Transaction[]) {
    const categoryStats = new Map<string, number>();
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    transactions.forEach(t => {
      const current = categoryStats.get(t.category) || 0;
      categoryStats.set(t.category, current + t.amount);
    });

    return Array.from(categoryStats.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  private calculateTrends(transactions: Transaction[]) {
    const daily = this.calculateDailyTrends(transactions);
    const weekly = this.calculateWeeklyTrends(transactions);
    const monthly = this.calculateMonthlyTrends(transactions);

    return { daily, weekly, monthly };
  }

  private calculateDailyTrends(transactions: Transaction[]) {
    const days = 30;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayTransactions = transactions.filter(t => {
        const tDate = startOfDay(new Date(t.date));
        return tDate.getTime() === dayStart.getTime();
      });

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        date: format(date, 'MMM dd'),
        income,
        expense,
        profit: income - expense,
      });
    }

    return trends;
  }

  private calculateWeeklyTrends(transactions: Transaction[]) {
    const weeks = 12;
    const trends = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const date = subWeeks(new Date(), i);
      const weekStart = startOfWeek(date);
      const weekTransactions = transactions.filter(t => {
        const tDate = startOfWeek(new Date(t.date));
        return tDate.getTime() === weekStart.getTime();
      });

      const income = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        week: format(weekStart, 'MMM dd'),
        income,
        expense,
        profit: income - expense,
      });
    }

    return trends;
  }

  private calculateMonthlyTrends(transactions: Transaction[]) {
    const months = 12;
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthTransactions = transactions.filter(t => {
        const tDate = startOfMonth(new Date(t.date));
        return tDate.getTime() === monthStart.getTime();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        month: format(monthStart, 'MMM yyyy'),
        income,
        expense,
        profit: income - expense,
      });
    }

    return trends;
  }

  detectAlerts(transactions: Transaction[], products: Product[]) {
    const alerts = [];

    const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockThreshold);
    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'low_stock',
        severity: 'warning',
        message: `${lowStockProducts.length} products are low on stock`,
        products: lowStockProducts,
      });
    }

    const recentTransactions = transactions
      .filter(t => new Date(t.date) >= subDays(new Date(), 7))
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousWeekExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
      })
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (previousWeekExpenses > 0 && recentTransactions > previousWeekExpenses * 1.3) {
      alerts.push({
        type: 'expense_spike',
        severity: 'warning',
        message: `Expenses increased by ${((recentTransactions - previousWeekExpenses) / previousWeekExpenses * 100).toFixed(1)}% this week`,
      });
    }

    const recentRevenue = transactions
      .filter(t => new Date(t.date) >= subDays(new Date(), 7))
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousWeekRevenue = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
      })
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    if (previousWeekRevenue > 0 && recentRevenue < previousWeekRevenue * 0.7) {
      alerts.push({
        type: 'revenue_drop',
        severity: 'error',
        message: `Revenue dropped by ${((previousWeekRevenue - recentRevenue) / previousWeekRevenue * 100).toFixed(1)}% this week`,
      });
    }

    return alerts;
  }

  exportToCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method'];
    const rows = transactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.description,
      t.amount.toString(),
      t.paymentMethod || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  exportToJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}

export const analytics = new AnalyticsEngine();
