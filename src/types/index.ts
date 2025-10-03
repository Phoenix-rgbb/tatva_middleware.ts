export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod?: string;
  productId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'product';
  color: string;
  icon?: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  transactions: Transaction[];
  products: Product[];
  categories: Category[];
  preferences: any;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  expenseRatio: number;
  growthRate: number;
  topProducts: Array<{ product: Product; revenue: number; quantity: number }>;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  trends: {
    daily: Array<{ date: string; income: number; expense: number; profit: number }>;
    weekly: Array<{ week: string; income: number; expense: number; profit: number }>;
    monthly: Array<{ month: string; income: number; expense: number; profit: number }>;
  };
}

export interface AlertConfig {
  id: string;
  type: 'low_stock' | 'cash_flow' | 'expense_spike' | 'revenue_drop';
  enabled: boolean;
  threshold?: number;
  message: string;
}

export interface VoiceCommand {
  command: string;
  intent: 'add_transaction' | 'query_data' | 'show_analytics' | 'check_stock';
  parameters: Record<string, any>;
  language: 'en' | 'hi' | 'mr';
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'tally' | 'zoho' | 'shopify' | 'whatsapp' | 'excel';
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string;
  settings: Record<string, any>;
}
