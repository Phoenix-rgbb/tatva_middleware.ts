import React from 'react';
import { Server, Wifi, Shield, Database, Cloud, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'saas' | 'infrastructure' | 'subscription' | 'tool';
  status: 'active' | 'inactive' | 'expiring' | 'expired';
  cost: number;
  renewalDate: string;
  usage?: number;
  maxUsage?: number;
  description?: string;
}

interface CompanyResourcesProps {
  resources: Resource[];
  totalBudget: number;
  currentBalance: number;
}

export function CompanyResources({ resources, totalBudget, currentBalance }: CompanyResourcesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'saas':
        return <Cloud className="w-5 h-5" />;
      case 'infrastructure':
        return <Server className="w-5 h-5" />;
      case 'subscription':
        return <CreditCard className="w-5 h-5" />;
      case 'tool':
        return <Database className="w-5 h-5" />;
      default:
        return <Wifi className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'expiring':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'expired':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'inactive':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Resource['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expiring':
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const totalMonthlyCost = resources.reduce((sum, resource) => sum + resource.cost, 0);
  const activeResources = resources.filter(r => r.status === 'active').length;
  const expiringResources = resources.filter(r => r.status === 'expiring').length;

  const budgetUsage = totalBudget > 0 ? (totalMonthlyCost / totalBudget) * 100 : 0;

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
      <div className="relative z-10 mb-6">
        <h3 className="text-xl font-bold text-white mb-1">Company Resources</h3>
        <p className="text-gray-400 text-sm">SaaS subscriptions & infrastructure</p>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-cyan-500/10 rounded-lg p-2 sm:p-3 border border-cyan-500/30 text-center min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-cyan-400">{activeResources}</p>
          <p className="text-gray-400 text-xs">Active</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-2 sm:p-3 border border-yellow-500/30 text-center min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-yellow-400">{expiringResources}</p>
          <p className="text-gray-400 text-xs">Expiring</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50 text-center min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-white">{resources.length}</p>
          <p className="text-gray-400 text-xs">Total</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="relative z-10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 mb-6 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-gray-400 text-sm">Monthly Budget</p>
            <p className="text-white text-xl font-bold">{formatCurrency(totalMonthlyCost)}</p>
            <p className="text-gray-400 text-xs">of {formatCurrency(totalBudget)} allocated</p>
          </div>
          <div className="text-cyan-400">
            <CreditCard className="w-8 h-8" />
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Budget Usage</span>
            <span>{budgetUsage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                budgetUsage > 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                budgetUsage > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="relative z-10 space-y-3 max-h-80 overflow-y-auto">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div key={resource.id} className="
              bg-gray-800/50 rounded-lg p-4 border border-gray-700/50
              hover:border-cyan-500/30 hover:bg-gray-800/70
              transition-all duration-200 group
            ">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-cyan-400 mt-1 flex-shrink-0">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors mb-1 truncate">
                      {resource.name}
                    </h4>
                    {resource.description && (
                      <p className="text-gray-400 text-sm mb-2 truncate">{resource.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Monthly Cost</p>
                        <p className="text-white font-bold text-sm">{formatCurrency(resource.cost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Renewal</p>
                        <p className="text-white font-medium text-sm">{formatDate(resource.renewalDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(resource.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                </div>
              </div>

              {/* Usage Bar (if available) */}
              {resource.usage !== undefined && resource.maxUsage && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Usage</span>
                    <span>{resource.usage} / {resource.maxUsage}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        (resource.usage / resource.maxUsage) > 0.9 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                        (resource.usage / resource.maxUsage) > 0.7 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${(resource.usage / resource.maxUsage) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Server className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No Resources Found</h4>
            <p className="text-gray-500 text-sm">
              Add company resources and subscriptions to track costs
            </p>
          </div>
        )}
      </div>

      {/* Current Balance */}
      <div className="relative z-10 mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Current Business Balance</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(currentBalance)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentBalance > totalMonthlyCost ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
          }`}>
            {currentBalance > totalMonthlyCost ? 'Healthy' : 'Low Balance'}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
    </div>
  );
}
