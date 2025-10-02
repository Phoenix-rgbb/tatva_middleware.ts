import { useState, useEffect, useCallback } from 'react';
import { 
  Transaction, 
  Product, 
  Customer, 
  BusinessSettings, 
  DashboardStats,
  StorageManager, 
  STORAGE_KEYS,
  generateId,
  calculateProfit,
  getDateRange,
  filterTransactionsByDateRange
} from '@/lib/storage';

// Transactions Hook
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = () => {
      const stored = StorageManager.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      setTransactions(stored);
      setLoading(false);
    };
    loadTransactions();
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
    };
    
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    StorageManager.set(STORAGE_KEYS.TRANSACTIONS, updated);
    return newTransaction;
  }, [transactions]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    setTransactions(updated);
    StorageManager.set(STORAGE_KEYS.TRANSACTIONS, updated);
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    StorageManager.set(STORAGE_KEYS.TRANSACTIONS, updated);
  }, [transactions]);

  const getTransactionsByDateRange = useCallback((days: number) => {
    const { start, end } = getDateRange(days);
    return filterTransactionsByDateRange(transactions, start, end);
  }, [transactions]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDateRange,
  };
};

// Products Hook
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = () => {
      const stored = StorageManager.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
      setProducts(stored);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: generateId(),
      dateAdded: now,
      lastUpdated: now,
    };
    
    const updated = [newProduct, ...products];
    setProducts(updated);
    StorageManager.set(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  }, [products]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
    );
    setProducts(updated);
    StorageManager.set(STORAGE_KEYS.PRODUCTS, updated);
  }, [products]);

  const deleteProduct = useCallback((id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    StorageManager.set(STORAGE_KEYS.PRODUCTS, updated);
  }, [products]);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.quantity <= p.minStock && p.isActive);
  }, [products]);

  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(p => p.category === category && p.isActive);
  }, [products]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getProductsByCategory,
  };
};

// Customers Hook
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = () => {
      const stored = StorageManager.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
      setCustomers(stored);
      setLoading(false);
    };
    loadCustomers();
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'dateAdded' | 'totalPurchases'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      dateAdded: new Date().toISOString(),
      totalPurchases: 0,
    };
    
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    StorageManager.set(STORAGE_KEYS.CUSTOMERS, updated);
    return newCustomer;
  }, [customers]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    const updated = customers.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setCustomers(updated);
    StorageManager.set(STORAGE_KEYS.CUSTOMERS, updated);
  }, [customers]);

  const deleteCustomer = useCallback((id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    StorageManager.set(STORAGE_KEYS.CUSTOMERS, updated);
  }, [customers]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};

// Settings Hook
export const useSettings = () => {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: '',
    ownerName: '',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    language: 'en',
    theme: 'system',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      const stored = StorageManager.get<BusinessSettings>(STORAGE_KEYS.SETTINGS, {
        businessName: '',
        ownerName: '',
        currency: '₹',
        timezone: 'Asia/Kolkata',
        language: 'en',
        theme: 'system',
      });
      setSettings(stored);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const updateSettings = useCallback((updates: Partial<BusinessSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    StorageManager.set(STORAGE_KEYS.SETTINGS, updated);
  }, [settings]);

  return {
    settings,
    loading,
    updateSettings,
  };
};

// Dashboard Stats Hook
export const useStats = () => {
  const { transactions } = useTransactions();
  const { products } = useProducts();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTransactions: 0,
    topProducts: [],
    recentTransactions: [],
    monthlyTrends: [],
  });
  const [todayStats, setTodayStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      // Overall stats
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netProfit = totalIncome - totalExpenses;
      
      // Today's stats
      const today = new Date().toDateString();
      const todayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === today
      );
      
      const todayIncome = todayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const todayExpenses = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
        });
        
        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        monthlyTrends.push({
          month: monthStr,
          income: monthIncome,
          expenses: monthExpenses,
          profit: monthIncome - monthExpenses,
        });
      }

      setStats({
        totalIncome,
        totalExpenses,
        netProfit,
        totalTransactions: transactions.length,
        topProducts: products.slice(0, 5),
        recentTransactions: transactions.slice(0, 10),
        monthlyTrends,
      });

      setTodayStats({
        totalIncome: todayIncome,
        totalExpenses: todayExpenses,
        netProfit: todayIncome - todayExpenses,
        totalTransactions: todayTransactions.length,
      });

      setLoading(false);
    };

    calculateStats();
  }, [transactions, products]);

  return {
    stats,
    todayStats,
    loading,
  };
};