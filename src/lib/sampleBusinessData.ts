import { db } from './database';
import { businessAnalytics } from './businessAnalytics';

export function initializeSampleBusinessData() {
  // Check if we already have business data
  const existingTransactions = db.getTransactions();
  if (existingTransactions.length > 10) {
    return; // Already has data
  }

  // Add sample products first
  const products = [
    {
      name: 'Business Consulting Service',
      category: 'Services',
      sku: 'BCS-001',
      costPrice: 500,
      sellingPrice: 1500,
      stockQuantity: 100,
      lowStockThreshold: 10,
      description: 'Professional business consulting services'
    },
    {
      name: 'Digital Marketing Package',
      category: 'Services',
      sku: 'DMP-002',
      costPrice: 800,
      sellingPrice: 2000,
      stockQuantity: 50,
      lowStockThreshold: 5,
      description: 'Complete digital marketing solution'
    },
    {
      name: 'Software Development',
      category: 'Services',
      sku: 'SD-003',
      costPrice: 2000,
      sellingPrice: 5000,
      stockQuantity: 25,
      lowStockThreshold: 3,
      description: 'Custom software development services'
    },
    {
      name: 'Office Supplies Bundle',
      category: 'Products',
      sku: 'OSB-004',
      costPrice: 100,
      sellingPrice: 250,
      stockQuantity: 200,
      lowStockThreshold: 20,
      description: 'Complete office supplies package'
    }
  ];

  // Add products to database
  const addedProducts = products.map(product => db.addProduct(product));

  // Add sample business transactions
  const currentDate = new Date();
  const transactions = [
    // Income transactions (sales)
    {
      type: 'income' as const,
      amount: 15000,
      category: 'Services',
      description: 'Business Consulting - Q4 Strategy',
      date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Bank Transfer',
      productId: addedProducts[0].id
    },
    {
      type: 'income' as const,
      amount: 20000,
      category: 'Services',
      description: 'Digital Marketing Campaign',
      date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Credit Card',
      productId: addedProducts[1].id
    },
    {
      type: 'income' as const,
      amount: 50000,
      category: 'Services',
      description: 'Custom ERP Development',
      date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Bank Transfer',
      productId: addedProducts[2].id
    },
    {
      type: 'income' as const,
      amount: 2500,
      category: 'Sales',
      description: 'Office Supplies - Corporate Order',
      date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Cash',
      productId: addedProducts[3].id
    },
    {
      type: 'income' as const,
      amount: 18000,
      category: 'Services',
      description: 'SEO Optimization Service',
      date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'UPI'
    },
    
    // Business expense transactions
    {
      type: 'expense' as const,
      amount: 5000,
      category: 'Salary',
      description: 'Employee Salary - Development Team',
      date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Bank Transfer'
    },
    {
      type: 'expense' as const,
      amount: 1200,
      category: 'Software',
      description: 'Microsoft Office 365 Subscription',
      date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Credit Card'
    },
    {
      type: 'expense' as const,
      amount: 3500,
      category: 'Rent',
      description: 'Office Rent - Monthly',
      date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Bank Transfer'
    },
    {
      type: 'expense' as const,
      amount: 800,
      category: 'Utilities',
      description: 'Internet & Phone Bills',
      date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Auto Debit'
    },
    {
      type: 'expense' as const,
      amount: 2500,
      category: 'Marketing',
      description: 'Google Ads Campaign',
      date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Credit Card'
    },
    {
      type: 'expense' as const,
      amount: 1500,
      category: 'Supplies',
      description: 'Office Equipment & Supplies',
      date: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Cash'
    },
    {
      type: 'expense' as const,
      amount: 4000,
      category: 'Training',
      description: 'Team Training & Development',
      date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Bank Transfer'
    }
  ];

  // Add transactions to database
  transactions.forEach(transaction => db.addTransaction(transaction));

  // Add some business tasks
  const tasks = [
    {
      title: 'Complete Q4 Financial Analysis',
      assignee: 'Finance Manager',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress' as const,
      priority: 'high' as const,
      department: 'Finance'
    },
    {
      title: 'Launch New Marketing Campaign',
      assignee: 'Marketing Team',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      priority: 'high' as const,
      department: 'Marketing'
    },
    {
      title: 'Client Onboarding Process Review',
      assignee: 'Operations Manager',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      priority: 'medium' as const,
      department: 'Operations'
    },
    {
      title: 'Update CRM System',
      assignee: 'IT Team',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      priority: 'medium' as const,
      department: 'IT'
    },
    {
      title: 'Prepare Monthly Sales Report',
      assignee: 'Sales Manager',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      priority: 'high' as const,
      department: 'Sales'
    }
  ];

  // Add tasks to business analytics
  tasks.forEach(task => businessAnalytics.addTask(task));

  // Add some company resources
  const resources = [
    {
      name: 'Salesforce CRM Professional',
      type: 'subscription' as const,
      cost: 3500,
      status: 'active' as const,
      renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'AWS Cloud Infrastructure',
      type: 'subscription' as const,
      cost: 8500,
      status: 'active' as const,
      renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Adobe Creative Suite',
      type: 'software' as const,
      cost: 2400,
      status: 'active' as const,
      renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Office Furniture & Equipment',
      type: 'hardware' as const,
      cost: 15000,
      status: 'active' as const,
      quantity: 25
    },
    {
      name: 'Zoom Business Plan',
      type: 'subscription' as const,
      cost: 1200,
      status: 'active' as const,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Add resources to business analytics
  resources.forEach(resource => businessAnalytics.addResource(resource));

  console.log('✅ Sample business data initialized successfully!');
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    initializeSampleBusinessData();
  }, 1000);
}
