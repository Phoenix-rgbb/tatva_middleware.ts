import React from 'react';
import { BusinessKPIChart } from './business/BusinessKPIChart';
import { TopProducts } from './business/TopProducts';
import { TeamTasks } from './business/TeamTasks';
import { CompanyResources } from './business/CompanyResources';
import { RecentActivity } from './business/RecentActivity';
import { db } from '@/lib/database';

export function BusinessDashboard() {
  const [transactions, setTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadData = () => {
      setTransactions(db.getTransactions());
    };
    
    loadData();
    const unsubscribe = db.subscribe(() => loadData());
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Map transaction categories to business departments
  const mapCategoryToDepartment = (category: string): string => {
    const mapping: Record<string, string> = {
      'Food': 'Operations',
      'Transport': 'Operations',
      'Shopping': 'Marketing',
      'Entertainment': 'Marketing',
      'Home': 'Operations',
      'Vacation': 'Marketing',
      'Healthcare': 'Support',
      'Education': 'Development',
      'Utilities': 'Operations',
      'Insurance': 'Support'
    };
    return mapping[category] || 'Other';
  };

  // Calculate business KPI data from transactions
  const businessKPIData = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const colors = {
      'Marketing': '#FF1493',
      'Operations': '#00FFFF', 
      'Support': '#32CD32',
      'Sales': '#FF6347',
      'Development': '#9370DB',
      'Other': '#FFD700'
    };

    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        // Map transaction categories to business departments
        const department = mapCategoryToDepartment(transaction.category);
        categoryTotals[department] = (categoryTotals[department] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name as keyof typeof colors] || colors.Other
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [transactions]);

  // Calculate center metric (Monthly Growth Rate)
  const centerMetric = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthRevenue = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === lastMonth && 
               date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const growthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      label: 'Monthly Growth',
      value: Math.abs(growthRate),
      percentage: growthRate,
      isPositive: growthRate >= 0
    };
  }, [transactions]);

  // Key business metrics
  const keyMetrics = React.useMemo(() => {
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCustomers = new Set(transactions.map(t => t.description)).size;
    const totalOrders = transactions.filter(t => t.type === 'income').length;
    const conversionRate = totalOrders > 0 ? (totalOrders / (totalCustomers * 2)) * 100 : 0;

    return [
      {
        label: 'New Clients',
        value: totalCustomers,
        change: 12.5,
        icon: 'users'
      },
      {
        label: 'Orders Fulfilled',
        value: totalOrders,
        change: 8.3,
        icon: 'cart'
      },
      {
        label: 'Leads Converted',
        value: Math.round(conversionRate),
        change: -2.1,
        icon: 'target'
      },
      {
        label: 'Monthly Revenue',
        value: totalRevenue,
        change: centerMetric.percentage,
        icon: 'dollar'
      }
    ];
  }, [transactions, centerMetric]);

  // Sample top products data (derived from transactions)
  const topProducts = React.useMemo(() => {
    const productMap: Record<string, any> = {};
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const productName = t.description || 'Unknown Product';
        if (!productMap[productName]) {
          productMap[productName] = {
            id: productName.toLowerCase().replace(/\s+/g, '-'),
            name: productName,
            category: t.category || 'General',
            revenue: 0,
            units: 0,
            change: Math.random() * 20 - 10, // Random change for demo
            rating: 4 + Math.random()
          };
        }
        productMap[productName].revenue += t.amount;
        productMap[productName].units += 1;
      });

    return Object.values(productMap)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [transactions]);

  // Sample team tasks data
  const teamTasks = [
    {
      id: '1',
      title: 'Q4 Marketing Campaign Review',
      assignee: 'Sarah Johnson',
      priority: 'high' as const,
      status: 'in_progress' as const,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 75,
      department: 'Marketing'
    },
    {
      id: '2',
      title: 'Customer Onboarding Process Update',
      assignee: 'Mike Chen',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 30,
      department: 'Operations'
    },
    {
      id: '3',
      title: 'Financial Report Generation',
      assignee: 'Emily Davis',
      priority: 'high' as const,
      status: 'completed' as const,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      department: 'Finance'
    },
    {
      id: '4',
      title: 'Product Feature Testing',
      assignee: 'Alex Rodriguez',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 60,
      department: 'Development'
    },
    {
      id: '5',
      title: 'Client Feedback Analysis',
      assignee: 'Lisa Wang',
      priority: 'low' as const,
      status: 'pending' as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 15,
      department: 'Support'
    }
  ];

  // Sample company resources data
  const companyResources = [
    {
      id: '1',
      name: 'Microsoft 365 Business',
      type: 'saas' as const,
      status: 'active' as const,
      cost: 1500,
      renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      usage: 85,
      maxUsage: 100,
      description: 'Office suite and collaboration tools'
    },
    {
      id: '2',
      name: 'AWS Cloud Infrastructure',
      type: 'infrastructure' as const,
      status: 'active' as const,
      cost: 8500,
      renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      usage: 72,
      maxUsage: 100,
      description: 'Cloud hosting and computing services'
    },
    {
      id: '3',
      name: 'Salesforce CRM',
      type: 'saas' as const,
      status: 'expiring' as const,
      cost: 3200,
      renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      usage: 90,
      maxUsage: 100,
      description: 'Customer relationship management'
    },
    {
      id: '4',
      name: 'Slack Business+',
      type: 'tool' as const,
      status: 'active' as const,
      cost: 800,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: 95,
      maxUsage: 100,
      description: 'Team communication platform'
    }
  ];

  // Sample recent activities (derived from transactions and business events)
  const recentActivities = React.useMemo(() => {
    const activities = transactions.slice(0, 10).map((transaction, index) => ({
      id: transaction.id || index.toString(),
      type: transaction.type === 'income' ? 'sale' as const : 'order' as const,
      title: transaction.type === 'income' ? 'New Sale Completed' : 'Business Expense',
      description: transaction.description || 'Transaction processed',
      amount: transaction.amount,
      timestamp: transaction.date,
      status: 'completed' as const,
      client: transaction.type === 'income' ? 'Customer' : undefined,
      department: mapCategoryToDepartment(transaction.category)
    }));

    // Add some business-specific activities
    const businessActivities = [
      {
        id: 'meeting-1',
        type: 'meeting' as const,
        title: 'Client Strategy Meeting',
        description: 'Quarterly review with key stakeholders',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        client: 'TechCorp Inc.',
        department: 'Sales'
      },
      {
        id: 'support-1',
        type: 'support' as const,
        title: 'Customer Support Ticket',
        description: 'Resolved billing inquiry for premium customer',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        priority: 'high' as const,
        department: 'Support'
      }
    ];

    return [...businessActivities, ...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);
  }, [transactions]);

  const totalBudget = 50000;
  const currentBalance = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) - 
    transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddTask = () => {
    console.log('Add new task');
  };

  const handleViewAllTasks = () => {
    console.log('View all tasks');
  };

  const handleViewAllActivities = () => {
    console.log('View all activities');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Business Management Dashboard</h1>
          <p className="text-gray-400">Comprehensive business insights and performance metrics</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
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
