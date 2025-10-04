import React from 'react';
import { TrendingUp, TrendingDown, Package, Star, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  revenue: number;
  units: number;
  change: number;
  rating?: number;
}

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);

  return (
    <div className="
      relative backdrop-blur-xl rounded-2xl p-6 
      bg-gradient-to-br from-gray-900/80 via-blue-900/20 to-gray-900/80
      border border-cyan-500/20
      shadow-2xl hover:shadow-cyan-500/10 
      transition-all duration-300
      overflow-hidden
    ">
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Top Products & Services</h3>
          <p className="text-gray-400 text-sm">Best performing items this month</p>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Analytics</span>
        </div>
      </div>

      {/* Total Revenue Summary */}
      <div className="relative z-10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 mb-6 border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-cyan-400">
            <Package className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="relative z-10 space-y-4">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.id} className="
              bg-gray-800/50 rounded-lg p-4 border border-gray-700/50
              hover:border-cyan-500/30 hover:bg-gray-800/70
              transition-all duration-200 group
            ">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="
                      w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20
                      flex items-center justify-center border border-cyan-500/30
                    ">
                      <span className="text-cyan-400 font-bold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-gray-400 text-sm">{product.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-gray-400 text-xs">Revenue</p>
                        <p className="text-white font-bold">{formatCurrency(product.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Units Sold</p>
                        <p className="text-white font-bold">{formatNumber(product.units)}</p>
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.change >= 0 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {product.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(product.change).toFixed(1)}%
                    </div>
                  </div>

                  {/* Progress bar for revenue contribution */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Revenue Contribution</span>
                      <span>{((product.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(product.revenue / totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No Products Found</h4>
            <p className="text-gray-500 text-sm">
              Add products to your inventory to see top performers
            </p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {products.length > 0 && (
        <div className="relative z-10 mt-6 pt-4 border-t border-gray-700/50">
          <button className="
            w-full py-2 px-4 rounded-lg border border-cyan-500/30 
            text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50
            transition-all duration-200 text-sm font-medium
          ">
            View All Products & Analytics
          </button>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
    </div>
  );
}
