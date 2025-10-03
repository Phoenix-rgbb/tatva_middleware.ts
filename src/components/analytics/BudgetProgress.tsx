import React from 'react';

interface BudgetItem {
  name: string;
  current: number;
  target: number;
  color: string;
}

interface BudgetProgressProps {
  budgets: BudgetItem[];
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="
      relative backdrop-blur-xl rounded-2xl p-6
      bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-teal-600/20
      border border-teal-500/30
      shadow-2xl hover:shadow-teal-500/10
      transition-all duration-300
      overflow-hidden
    ">
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-lg font-semibold">Planning</h3>
          <button className="
            bg-cyan-500/20 hover:bg-cyan-500/30 
            border border-cyan-500/30 hover:border-cyan-500/50
            text-cyan-400 hover:text-cyan-300
            px-3 py-1 rounded-lg text-sm font-medium
            transition-all duration-200
            backdrop-blur-sm
          ">
            Add new
          </button>
        </div>

        {/* Budget Items */}
        <div className="space-y-6">
          {budgets.map((budget, index) => {
            const percentage = getProgressPercentage(budget.current, budget.target);
            const isCompleted = percentage >= 100;
            
            return (
              <div key={index} className="space-y-3">
                {/* Budget Header */}
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{budget.name}</span>
                  <span className="text-gray-300 text-sm">
                    {formatCurrency(budget.current)}/{formatCurrency(budget.target)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  {/* Background bar */}
                  <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    {/* Progress fill */}
                    <div 
                      className={`
                        h-full rounded-full transition-all duration-700 ease-out
                        ${isCompleted 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                          : `bg-gradient-to-r ${budget.color}`
                        }
                        shadow-lg
                      `}
                      style={{ 
                        width: `${percentage}%`,
                        boxShadow: `0 0 10px ${isCompleted ? '#10B981' : budget.color.split(' ')[1]}40`
                      }}
                    />
                  </div>

                  {/* Progress percentage */}
                  <div className="absolute -top-6 right-0">
                    <span className={`
                      text-xs font-semibold px-2 py-1 rounded-full
                      ${isCompleted 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }
                    `}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Goal achieved!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 pt-6 border-t border-gray-600/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Total Progress</span>
            <span className="text-white font-semibold">
              {budgets.filter(b => getProgressPercentage(b.current, b.target) >= 100).length} of {budgets.length} completed
            </span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-cyan-500/10 rounded-full blur-lg" />
    </div>
  );
}
