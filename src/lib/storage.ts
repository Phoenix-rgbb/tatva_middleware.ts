// Data types for the application
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  item: string;
  category: string;
  date: string;
  time: string;
  description?: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank_transfer';
  tags?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  description?: string;
  barcode?: string;
  supplier?: string;
  dateAdded: string;
  lastUpdated: string;
  isActive: boolean;
  images?: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchase?: string;
  dateAdded: string;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  currency: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalTransactions: number;
  topProducts: Product[];
  recentTransactions: Transaction[];
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }[];
}

// Storage keys
export const STORAGE_KEYS = {
  TRANSACTIONS: 'vachak_transactions',
  PRODUCTS: 'vachak_products',
  CUSTOMERS: 'vachak_customers',
  SETTINGS: 'vachak_settings',
  USER_PROFILE: 'vachak_user_profile',
  BACKUP_DATA: 'vachak_backup',
} as const;

// Storage utilities
export class StorageManager {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key ${key}:`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  static exportData(): string {
    const data = {
      transactions: this.get(STORAGE_KEYS.TRANSACTIONS, []),
      products: this.get(STORAGE_KEYS.PRODUCTS, []),
      customers: this.get(STORAGE_KEYS.CUSTOMERS, []),
      settings: this.get(STORAGE_KEYS.SETTINGS, {}),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.transactions) this.set(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.products) this.set(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.customers) this.set(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number, currency = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN');
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const calculateProfit = (transactions: Transaction[]): number => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return income - expenses;
};

export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start, end };
};

export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};