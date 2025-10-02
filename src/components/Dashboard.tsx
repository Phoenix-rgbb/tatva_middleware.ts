import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Plus, 
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useTransactions, useProducts, useStats } from "@/hooks/useStorage";
import { formatCurrency, formatTime } from "@/lib/storage";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { TrendChart } from "@/components/charts/TrendChart";

export function Dashboard() {
  const { transactions } = useTransactions();
  const { products, getLowStockProducts } = useProducts();
  const { todayStats, stats, loading } = useStats();

  const lowStockProducts = getLowStockProducts();
  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your business overview for today
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Today's Income</p>
                <p className="text-2xl font-bold">{formatCurrency(todayStats.totalIncome)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">vs yesterday</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Today's Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(todayStats.totalExpenses)}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-xs">vs yesterday</span>
                </div>
              </div>
              <ArrowDownRight className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Net Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(todayStats.netProfit)}</p>
                <div className="flex items-center mt-1">
                  {todayStats.netProfit >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs">today</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Transactions</p>
                <p className="text-2xl font-bold">{todayStats.totalTransactions}</p>
                <div className="flex items-center mt-1">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  <span className="text-xs">today</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Products */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-xl font-semibold">{products.length}</p>
              </div>
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-xl font-semibold text-orange-600">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.totalIncome)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Income vs Expenses (7 Days)</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart type="line" period="week" />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Expense Categories</CardTitle>
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryChart type="pie" transactionType="expense" />
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Profit Trend Analysis</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <TrendChart metric="profit" period="month" />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.item}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} • {formatTime(transaction.time)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                <p className="mb-4">Start by adding your first transaction</p>
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Low Stock Alert</CardTitle>
            <Button variant="ghost" size="sm">
              Manage Stock
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">
                        {product.quantity} left
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">All products in stock</h3>
                <p className="mb-4">Your inventory levels look good!</p>
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  View Products
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}