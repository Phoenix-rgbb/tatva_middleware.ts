import { Transaction, Product } from '@/types';
import { db } from './database';

export interface BusinessKPI {
  name: string;
  value: number;
  color: string;
  percentage?: number;
  [key: string]: string | number | undefined;
}

export interface BusinessMetrics {
  monthlyGrowthRate: number;
  totalRevenue: number;
  customerRetention: number;
  newClients: number;
  ordersFulfilled: number;
  leadsConverted: number;
  monthlyRevenue: number;
  isGrowthPositive: boolean;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  change: number;
  category: string;
}

export interface BusinessTask {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  department: string;
}

export interface CompanyResource {
  id: string;
  name: string;
  type: 'software' | 'hardware' | 'subscription' | 'inventory';
  cost: number;
  status: 'active' | 'inactive' | 'expired';
  renewalDate?: string;
  quantity?: number;
}

export interface BusinessActivity {
  id: string;
  type: 'order' | 'client' | 'project' | 'sale' | 'expense' | 'task';
  description: string;
  timestamp: string;
  amount?: number;
  status: 'completed' | 'pending' | 'failed';
  client?: string;
  department?: string;
}

class BusinessAnalyticsService {
  private tasks: BusinessTask[] = [];
  private resources: CompanyResource[] = [];
  private activities: BusinessActivity[] = [];

  constructor() {
    this.initializeBusinessData();
  }

  private initializeBusinessData() {
    // Initialize with some business structure if empty
    if (this.tasks.length === 0) {
      this.loadTasksFromStorage();
    }
    if (this.resources.length === 0) {
      this.loadResourcesFromStorage();
    }
    if (this.activities.length === 0) {
      this.loadActivitiesFromStorage();
    }
  }

  private loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem('business_tasks');
      this.tasks = stored ? JSON.parse(stored) : this.getDefaultTasks();
      if (this.tasks.length === 0) {
        this.tasks = this.getDefaultTasks();
        this.saveTasksToStorage();
      }
    } catch (error) {
      this.tasks = this.getDefaultTasks();
    }
  }

  private loadResourcesFromStorage() {
    try {
      const stored = localStorage.getItem('business_resources');
      this.resources = stored ? JSON.parse(stored) : this.getDefaultResources();
      if (this.resources.length === 0) {
        this.resources = this.getDefaultResources();
        this.saveResourcesToStorage();
      }
    } catch (error) {
      this.resources = this.getDefaultResources();
    }
  }

  private loadActivitiesFromStorage() {
    try {
      const stored = localStorage.getItem('business_activities');
      this.activities = stored ? JSON.parse(stored) : [];
    } catch (error) {
      this.activities = [];
    }
  }

  private saveTasksToStorage() {
    localStorage.setItem('business_tasks', JSON.stringify(this.tasks));
  }

  private saveResourcesToStorage() {
    localStorage.setItem('business_resources', JSON.stringify(this.resources));
  }

  private saveActivitiesToStorage() {
    localStorage.setItem('business_activities', JSON.stringify(this.activities));
  }

  private getDefaultTasks(): BusinessTask[] {
    return [
      {
        id: '1',
        title: 'Review Q4 Financial Reports',
        assignee: 'Finance Team',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        priority: 'high',
        department: 'Finance'
      },
      {
        id: '2',
        title: 'Update Product Inventory',
        assignee: 'Operations Team',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium',
        department: 'Operations'
      },
      {
        id: '3',
        title: 'Client Onboarding Process',
        assignee: 'Sales Team',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        priority: 'high',
        department: 'Sales'
      }
    ];
  }

  private getDefaultResources(): CompanyResource[] {
    return [
      {
        id: '1',
        name: 'Office 365 Business',
        type: 'subscription',
        cost: 12.50,
        status: 'active',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'Accounting Software',
        type: 'software',
        cost: 29.99,
        status: 'active',
        renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Office Supplies',
        type: 'inventory',
        cost: 250.00,
        status: 'active',
        quantity: 50
      }
    ];
  }

  calculateBusinessKPIs(): BusinessKPI[] {
    const transactions = db.getTransactions();
    const products = db.getProducts();

    // Calculate department-wise expenses
    const departmentExpenses: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const department = this.mapCategoryToDepartment(transaction.category);
        departmentExpenses[department] = (departmentExpenses[department] || 0) + transaction.amount;
      });

    const total = Object.values(departmentExpenses).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(departmentExpenses)
      .map(([name, value]) => ({
        name,
        value,
        color: this.getDepartmentColor(name),
        percentage: total > 0 ? (value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }

  calculateBusinessMetrics(): BusinessMetrics {
    const transactions = db.getTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month revenue
    const currentMonthRevenue = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Last month revenue
    const lastMonthRevenue = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === lastMonth && 
               date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate growth rate
    const monthlyGrowthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Total revenue (last 12 months)
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate other metrics
    const newClients = this.calculateNewClients();
    const ordersFulfilled = this.calculateOrdersFulfilled();
    const leadsConverted = this.calculateLeadsConverted();

    return {
      monthlyGrowthRate,
      totalRevenue,
      customerRetention: 85, // This would be calculated from customer data
      newClients,
      ordersFulfilled,
      leadsConverted,
      monthlyRevenue: currentMonthRevenue,
      isGrowthPositive: monthlyGrowthRate >= 0
    };
  }

  getTopProducts(): TopProduct[] {
    const transactions = db.getTransactions();
    const products = db.getProducts();
    
    const productStats: Record<string, { revenue: number; quantity: number }> = {};

    // Calculate revenue and quantity for each product
    transactions
      .filter(t => t.type === 'income' && t.productId)
      .forEach(transaction => {
        const productId = transaction.productId!;
        if (!productStats[productId]) {
          productStats[productId] = { revenue: 0, quantity: 0 };
        }
        productStats[productId].revenue += transaction.amount;
        productStats[productId].quantity += 1;
      });

    // Convert to TopProduct array
    return Object.entries(productStats)
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          revenue: stats.revenue,
          quantity: stats.quantity,
          change: Math.random() * 20 - 10, // This would be calculated from historical data
          category: product?.category || 'Other'
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  getTasks(): BusinessTask[] {
    return [...this.tasks];
  }

  addTask(task: Omit<BusinessTask, 'id'>): BusinessTask {
    const newTask: BusinessTask = {
      ...task,
      id: crypto.randomUUID()
    };
    this.tasks.push(newTask);
    this.saveTasksToStorage();
    
    // Add activity log
    this.addActivity({
      type: 'task',
      description: `New task created: ${task.title}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      department: task.department
    });

    return newTask;
  }

  updateTask(id: string, updates: Partial<BusinessTask>): BusinessTask | null {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.tasks[index] = { ...this.tasks[index], ...updates };
    this.saveTasksToStorage();

    // Add activity log
    this.addActivity({
      type: 'task',
      description: `Task updated: ${this.tasks[index].title}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      department: this.tasks[index].department
    });

    return this.tasks[index];
  }

  getResources(): CompanyResource[] {
    return [...this.resources];
  }

  addResource(resource: Omit<CompanyResource, 'id'>): CompanyResource {
    const newResource: CompanyResource = {
      ...resource,
      id: crypto.randomUUID()
    };
    this.resources.push(newResource);
    this.saveResourcesToStorage();

    // Add activity log
    this.addActivity({
      type: 'expense',
      description: `New resource added: ${resource.name}`,
      timestamp: new Date().toISOString(),
      amount: resource.cost,
      status: 'completed'
    });

    return newResource;
  }

  getActivities(): BusinessActivity[] {
    // Combine stored activities with recent transaction activities
    const transactionActivities = this.generateActivitiesFromTransactions();
    const allActivities = [...this.activities, ...transactionActivities];
    
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }

  addActivity(activity: Omit<BusinessActivity, 'id'>): BusinessActivity {
    const newActivity: BusinessActivity = {
      ...activity,
      id: crypto.randomUUID()
    };
    this.activities.push(newActivity);
    this.saveActivitiesToStorage();
    return newActivity;
  }

  private generateActivitiesFromTransactions(): BusinessActivity[] {
    const transactions = db.getTransactions().slice(0, 10); // Last 10 transactions
    
    return transactions.map(transaction => ({
      id: `tx_${transaction.id}`,
      type: transaction.type === 'income' ? 'sale' : 'expense',
      description: transaction.type === 'income' 
        ? `Sale: ${transaction.description}` 
        : `Expense: ${transaction.description}`,
      timestamp: transaction.date,
      amount: transaction.amount,
      status: 'completed' as const,
      client: transaction.type === 'income' ? 'Customer' : undefined,
      department: this.mapCategoryToDepartment(transaction.category)
    }));
  }

  private calculateNewClients(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // This would typically come from a customer database
    // For now, estimate based on income transactions
    const incomeTransactions = db.getTransactions()
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      });

    // Estimate unique clients (simplified)
    return Math.floor(incomeTransactions.length / 3);
  }

  private calculateOrdersFulfilled(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return db.getTransactions()
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      }).length;
  }

  private calculateLeadsConverted(): number {
    // This would typically come from a CRM system
    // For now, estimate based on sales data
    return Math.floor(this.calculateOrdersFulfilled() * 0.3);
  }

  private mapCategoryToDepartment(category: string): string {
    const mapping: Record<string, string> = {
      'Sales': 'Sales',
      'Services': 'Sales',
      'Rent': 'Operations',
      'Utilities': 'Operations',
      'Salary': 'HR',
      'Supplies': 'Operations',
      'Marketing': 'Marketing',
      'Advertising': 'Marketing',
      'Training': 'HR',
      'Software': 'IT',
      'Hardware': 'IT'
    };
    return mapping[category] || 'Other';
  }

  private getDepartmentColor(department: string): string {
    const colors: Record<string, string> = {
      'Sales': '#10b981',
      'Marketing': '#3b82f6',
      'Operations': '#f59e0b',
      'HR': '#8b5cf6',
      'IT': '#06b6d4',
      'Finance': '#ef4444',
      'Other': '#6b7280'
    };
    return colors[department] || colors.Other;
  }
}

export const businessAnalytics = new BusinessAnalyticsService();
