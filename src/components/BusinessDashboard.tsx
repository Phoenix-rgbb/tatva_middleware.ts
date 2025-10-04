import React from 'react';
import { BusinessKPIChart } from './business/BusinessKPIChart';
import { TopProducts } from './business/TopProducts';
import { TeamTasks } from './business/TeamTasks';
import { CompanyResources } from './business/CompanyResources';
import { RecentActivity } from './business/RecentActivity';
import { db } from '@/lib/database';
import { businessAnalytics } from '@/lib/businessAnalytics';
import { initializeSampleBusinessData } from '@/lib/sampleBusinessData';

export function BusinessDashboard() {
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
  const businessKPIData = React.useMemo(() => {
    return businessAnalytics.calculateBusinessKPIs();
  }, [refreshKey]);

  const businessMetrics = React.useMemo(() => {
    return businessAnalytics.calculateBusinessMetrics();
  }, [refreshKey]);

  const centerMetric = React.useMemo(() => ({
    label: 'Monthly Growth',
    value: businessMetrics.monthlyRevenue,
    percentage: businessMetrics.monthlyGrowthRate,
    isPositive: businessMetrics.isGrowthPositive
  }), [businessMetrics]);

  const keyMetrics = React.useMemo(() => [
    {
      label: 'New Clients',
      value: businessMetrics.newClients,
      change: businessMetrics.monthlyGrowthRate * 0.5,
      icon: 'users'
    },
    {
      label: 'Orders Fulfilled',
      value: businessMetrics.ordersFulfilled,
      change: businessMetrics.monthlyGrowthRate * 0.3,
      icon: 'cart'
    },
    {
      label: 'Leads Converted',
      value: businessMetrics.leadsConverted,
      change: businessMetrics.monthlyGrowthRate * 0.4,
      icon: 'target'
    },
    {
      label: 'Monthly Revenue',
      value: businessMetrics.monthlyRevenue,
      change: businessMetrics.monthlyGrowthRate,
      icon: 'dollar'
    }
  ], [businessMetrics]);

  const topProducts = React.useMemo(() => {
    return businessAnalytics.getTopProducts().map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      revenue: product.revenue,
      units: product.quantity,
      change: product.change,
      rating: 4 + Math.random()
    }));
  }, [refreshKey]);

  const teamTasks = React.useMemo(() => {
    return businessAnalytics.getTasks().map(task => ({
      id: task.id,
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
      dueDate: task.deadline,
      progress: task.status === 'completed' ? 100 : 
               task.status === 'in_progress' ? 60 : 
               task.status === 'overdue' ? 25 : 30,
      department: task.department
    }));
  }, [refreshKey]);

  const companyResources = React.useMemo(() => {
    return businessAnalytics.getResources().map(resource => ({
      id: resource.id,
      name: resource.name,
      type: resource.type === 'software' ? 'saas' as const :
            resource.type === 'hardware' ? 'infrastructure' as const :
            resource.type === 'inventory' ? 'tool' as const :
            'subscription' as const,
      status: resource.status === 'expired' ? 'expired' as const :
              resource.status === 'inactive' ? 'inactive' as const :
              resource.renewalDate && new Date(resource.renewalDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? 'expiring' as const :
              'active' as const,
      cost: resource.cost,
      renewalDate: resource.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: Math.floor(Math.random() * 30) + 70,
      maxUsage: 100,
      description: `${resource.type} resource`
    }));
  }, [refreshKey]);

  const recentActivities = React.useMemo(() => {
    return businessAnalytics.getActivities().map(activity => ({
      id: activity.id,
      type: activity.type === 'expense' ? 'inventory' as const :
            activity.type === 'task' ? 'support' as const :
            activity.type as 'order' | 'client' | 'project' | 'sale' | 'meeting' | 'support' | 'inventory' | 'communication',
      title: activity.type === 'sale' ? 'New Sale Completed' :
             activity.type === 'expense' ? 'Business Expense' :
             activity.type === 'task' ? 'Task Update' :
             activity.type === 'order' ? 'Order Processed' :
             activity.type === 'client' ? 'Client Activity' :
             activity.type === 'project' ? 'Project Update' : 'Business Activity',
      description: activity.description,
      amount: activity.amount,
      timestamp: activity.timestamp,
      status: activity.status as 'completed' | 'pending' | 'in_progress' | 'cancelled' | undefined,
      client: activity.client,
      department: activity.department,
      priority: activity.type === 'task' ? 'high' as const : undefined
    }));
  }, [refreshKey]);

  const totalBudget = 50000;
  const currentBalance = React.useMemo(() => {
    const transactions = db.getTransactions();
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) - 
      transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [refreshKey]);

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

  const handleViewAllTasks = React.useCallback(() => {
    console.log('View all tasks - navigate to tasks page');
  }, []);

  const handleUpdateTask = React.useCallback((taskId: string, updates: any) => {
    businessAnalytics.updateTask(taskId, updates);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleViewAllActivities = React.useCallback(() => {
    console.log('View all activities - navigate to activities page');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Business Management Dashboard</h1>
          <p className="text-gray-400">Real-time business insights and performance metrics</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Business Performance Overview */}
          <div className="xl:col-span-1 space-y-6">
            <BusinessKPIChart
              kpiData={businessKPIData}
              centerMetric={centerMetric}
              keyMetrics={keyMetrics}
            />
          </div>

          {/* Middle Column - Business Insights */}
          <div className="xl:col-span-1 space-y-6">
            <TopProducts products={topProducts} />
            <TeamTasks 
              tasks={teamTasks}
              onAddTask={handleAddTask}
              onViewAll={handleViewAllTasks}
              onUpdateTask={handleUpdateTask}
            />
          </div>

          {/* Right Column - Company Assets & Resources */}
          <div className="xl:col-span-1 space-y-6">
            <CompanyResources
              resources={companyResources}
              totalBudget={totalBudget}
              currentBalance={currentBalance}
            />
            <RecentActivity
              activities={recentActivities}
              onViewAll={handleViewAllActivities}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
