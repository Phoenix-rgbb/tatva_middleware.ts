import { Transaction, Product, Category, BackupData, IntegrationConfig } from '@/types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smb_transactions',
  PRODUCTS: 'smb_products',
  CATEGORIES: 'smb_categories',
  INTEGRATIONS: 'smb_integrations',
  PREFERENCES: 'smb_preferences',
  LAST_SYNC: 'smb_last_sync',
} as const;

class Database {
  private transactions: Transaction[] = [];
  private products: Product[] = [];
  private categories: Category[] = [];
  private integrations: IntegrationConfig[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultCategories();
  }

  private loadFromStorage() {
    try {
      this.transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
      this.products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      this.categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      this.integrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTEGRATIONS) || '[]');
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(this.integrations));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  private initializeDefaultCategories() {
    if (this.categories.length === 0) {
      this.categories = [
        { id: '1', name: 'Sales', type: 'income', color: '#10b981', icon: 'TrendingUp' },
        { id: '2', name: 'Services', type: 'income', color: '#3b82f6', icon: 'Briefcase' },
        { id: '3', name: 'Rent', type: 'expense', color: '#ef4444', icon: 'Home' },
        { id: '4', name: 'Utilities', type: 'expense', color: '#f59e0b', icon: 'Zap' },
        { id: '5', name: 'Salary', type: 'expense', color: '#8b5cf6', icon: 'Users' },
        { id: '6', name: 'Supplies', type: 'expense', color: '#ec4899', icon: 'Package' },
        { id: '7', name: 'Electronics', type: 'product', color: '#06b6d4', icon: 'Laptop' },
        { id: '8', name: 'Groceries', type: 'product', color: '#84cc16', icon: 'ShoppingCart' },
        { id: '9', name: 'Clothing', type: 'product', color: '#a855f7', icon: 'Shirt' },
        { id: '10', name: 'Other', type: 'income', color: '#6b7280', icon: 'DollarSign' },
      ];
      this.saveToStorage();
    }
  }

  getTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.transactions.push(newTransaction);

    if (newTransaction.productId && newTransaction.type === 'income') {
      const product = this.products.find(p => p.id === newTransaction.productId);
      if (product) {
        product.stockQuantity -= 1;
        product.updatedAt = new Date().toISOString();
      }
    }

    this.saveToStorage();
    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.transactions[index];
  }

  deleteTransaction(id: string): boolean {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.transactions.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  getProducts(): Product[] {
    return [...this.products].sort((a, b) => a.name.localeCompare(b.name));
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.push(newProduct);
    this.saveToStorage();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  getLowStockProducts(): Product[] {
    return this.products.filter(p => p.stockQuantity <= p.lowStockThreshold);
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  addCategory(category: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };

    this.categories.push(newCategory);
    this.saveToStorage();
    return newCategory;
  }

  getIntegrations(): IntegrationConfig[] {
    return [...this.integrations];
  }

  updateIntegration(id: string, updates: Partial<IntegrationConfig>): IntegrationConfig | null {
    const index = this.integrations.findIndex(i => i.id === id);
    if (index === -1) {
      const newIntegration: IntegrationConfig = {
        id,
        name: updates.name || '',
        type: updates.type as any,
        enabled: updates.enabled || false,
        settings: updates.settings || {},
        ...updates,
      };
      this.integrations.push(newIntegration);
      this.saveToStorage();
      return newIntegration;
    }

    this.integrations[index] = {
      ...this.integrations[index],
      ...updates,
    };

    this.saveToStorage();
    return this.integrations[index];
  }

  exportData(): BackupData {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      transactions: this.transactions,
      products: this.products,
      categories: this.categories,
      preferences: JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) || '{}'),
    };
  }

  importData(data: BackupData): void {
    this.transactions = data.transactions || [];
    this.products = data.products || [];
    this.categories = data.categories || [];
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
    }
    this.saveToStorage();
  }

  clearAllData(): void {
    this.transactions = [];
    this.products = [];
    this.categories = [];
    this.integrations = [];
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.initializeDefaultCategories();
    this.saveToStorage();
  }
}

export const db = new Database();
