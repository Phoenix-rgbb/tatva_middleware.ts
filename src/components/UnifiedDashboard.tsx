import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Users,
  ShoppingCart,
  Target,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Star,
  BarChart3
} from "lucide-react";
import { db } from '@/lib/database';
import { businessAnalytics } from '@/lib/businessAnalytics';
import { initializeSampleBusinessData } from '@/lib/sampleBusinessData';

export function UnifiedDashboard() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    // Initialize sample data if needed
    initializeSampleBusinessData();
    
    const unsubscribe = db.subscribe(() => {
      setRefreshKey(prev => prev + 1);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Get real business data from analytics service
  const businessMetrics = React.useMemo(() => {
    return businessAnalytics.calculateBusinessMetrics();
  }, [refreshKey]);

  const transactions = React.useMemo(() => {
    return db.getTransactions();
  }, [refreshKey]);

  const topProducts = React.useMemo(() => {
    return businessAnalytics.getTopProducts().slice(0, 3);
  }, [refreshKey]);

  const teamTasks = React.useMemo(() => {
    return businessAnalytics.getTasks().slice(0, 4);
  }, [refreshKey]);

  const recentActivities = React.useMemo(() => {
    return businessAnalytics.getActivities().slice(0, 5);
  }, [refreshKey]);

  // Calculate financial metrics
  const financialMetrics = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = monthlyIncome - monthlyExpenses;
    const profitMargin = monthlyIncome > 0 ? (netProfit / monthlyIncome) * 100 : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      netProfit,
      profitMargin,
      isPositive: netProfit >= 0
    };
  }, [transactions]);

  // Get expense categories
  const expenseCategories = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleAddTask = React.useCallback(() => {
    const newTask = {
      title: 'New Business Task',
      assignee: 'Team Member',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      priority: 'medium' as const,
      department: 'Operations'
    };
    
    businessAnalytics.addTask(newTask);
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Business Dashboard</h1>
            <p className="text-muted-foreground">Complete overview of your business performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.monthlyIncome)}</p>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    businessMetrics.isGrowthPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {businessMetrics.isGrowthPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(businessMetrics.monthlyGrowthRate).toFixed(1)}%
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Clients</p>
                  <p className="text-2xl font-bold text-white">{businessMetrics.newClients}</p>
                  <div className="flex items-center gap-1 text-xs mt-1 text-blue-400">
                    <TrendingUp className="w-3 h-3" />
                    +12.5%
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders Fulfilled</p>
                  <p className="text-2xl font-bold text-white">{businessMetrics.ordersFulfilled}</p>
                  <div className="flex items-center gap-1 text-xs mt-1 text-cyan-400">
                    <TrendingUp className="w-3 h-3" />
                    +8.3%
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.netProfit)}</p>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    financialMetrics.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {financialMetrics.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(financialMetrics.profitMargin).toFixed(1)}%
                  </div>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Financial Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-lg font-semibold">Income & Expenses</CardTitle>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                {/* Financial Chart */}
                <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 opacity-20 blur-sm animate-pulse"></div>
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-green-400 opacity-30 blur-md"></div>
                      
                      <div className="absolute inset-6 rounded-full bg-gray-900 border-4 border-gray-800 shadow-2xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {formatCurrency(financialMetrics.netProfit)}
                          </div>
                          <div className={`flex items-center justify-center text-sm ${
                            financialMetrics.isPositive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {financialMetrics.isPositive ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-semibold">{Math.abs(financialMetrics.profitMargin).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Income</span>
                    <span className="text-sm font-semibold text-white">{formatCurrency(financialMetrics.monthlyIncome)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Expenses</span>
                    <span className="text-sm font-semibold text-white">{formatCurrency(financialMetrics.monthlyExpenses)}</span>
                  </div>
                </div>

                {/* Top Expense Categories */}
                <div className="w-full space-y-3">
                  {expenseCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-blue-500/20' : 
                          index === 1 ? 'bg-purple-500/20' : 'bg-gray-500/20'
                        }`}>
                          <div className={`w-4 h-4 rounded ${
                            index === 0 ? 'bg-blue-500' : 
                            index === 1 ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">This Month</span>
                        <div className="text-sm font-semibold text-white">{formatCurrency(category.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Top Products & Tasks */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Products */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-white text-lg font-semibold">Top Products</CardTitle>
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                          <span className="text-cyan-400 font-bold text-xs">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white truncate">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{formatCurrency(product.revenue)}</div>
                        <div className={`text-xs flex items-center gap-1 ${
                          product.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {product.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(product.change).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No products data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Tasks */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-white text-lg font-semibold">Team Tasks</CardTitle>
                <Button onClick={handleAddTask} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamTasks.length > 0 ? (
                  teamTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{task.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{task.assignee}</span>
                          <Calendar className="w-3 h-3 ml-2" />
                          <span>{formatDate(task.deadline)}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-white text-lg font-semibold">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border-l-4 border-cyan-500/30">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        {activity.type === 'sale' ? <DollarSign className="w-4 h-4 text-cyan-400" /> :
                         activity.type === 'task' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                         activity.type === 'order' ? <ShoppingCart className="w-4 h-4 text-blue-400" /> :
                         <Package className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{activity.description}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{activity.department}</span>
                          {activity.amount && (
                            <span className="text-xs font-bold text-cyan-400">
                              {formatCurrency(activity.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
