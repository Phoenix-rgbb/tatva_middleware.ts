import React from 'react';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  DollarSign, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  Package,
  MessageSquare,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'order' | 'client' | 'project' | 'sale' | 'meeting' | 'support' | 'inventory' | 'communication';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status?: 'completed' | 'pending' | 'in_progress' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  client?: string;
  department?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  onViewAll?: () => void;
}

export function RecentActivity({ activities, onViewAll }: RecentActivityProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5" />;
      case 'client':
        return <Users className="w-5 h-5" />;
      case 'project':
        return <FileText className="w-5 h-5" />;
      case 'sale':
        return <DollarSign className="w-5 h-5" />;
      case 'meeting':
        return <Calendar className="w-5 h-5" />;
      case 'support':
        return <MessageSquare className="w-5 h-5" />;
      case 'inventory':
        return <Package className="w-5 h-5" />;
      case 'communication':
        return <Mail className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'order':
        return 'text-blue-400 bg-blue-500/20';
      case 'client':
        return 'text-green-400 bg-green-500/20';
      case 'project':
        return 'text-purple-400 bg-purple-500/20';
      case 'sale':
        return 'text-cyan-400 bg-cyan-500/20';
      case 'meeting':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'support':
        return 'text-orange-400 bg-orange-500/20';
      case 'inventory':
        return 'text-indigo-400 bg-indigo-500/20';
      case 'communication':
        return 'text-pink-400 bg-pink-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status?: Activity['status']) => {
    if (!status) return '';
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority?: Activity['priority']) => {
    if (!priority) return '';
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
          <h3 className="text-xl font-bold text-white mb-1">Recent Business Activity</h3>
          <p className="text-gray-400 text-sm">Latest updates and interactions</p>
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="
              px-3 py-1 rounded-lg border border-cyan-500/30 
              text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50
              transition-all duration-200 text-sm font-medium
            "
          >
            View All
          </button>
        )}
      </div>

      {/* Activity Feed */}
      <div className="relative z-10 space-y-4 max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          sortedDates.slice(0, 3).map(date => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-medium text-gray-400">
                  {formatDateHeader(date)}
                </h4>
                <div className="flex-1 h-px bg-gray-700/50" />
              </div>

              {/* Activities for this date */}
              <div className="space-y-3">
                {groupedActivities[date].slice(0, 5).map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`
                      bg-gray-800/50 rounded-lg p-4 border-l-4 border-gray-700/50
                      hover:border-cyan-500/30 hover:bg-gray-800/70
                      transition-all duration-200 group
                      ${getPriorityColor(activity.priority)}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${getActivityColor(activity.type)}
                      `}>
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                              {activity.title}
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">
                              {activity.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-3">
                            {activity.amount && (
                              <span className="text-cyan-400 font-bold text-sm">
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                            <span className="text-gray-500 text-xs whitespace-nowrap">
                              {formatTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {activity.client && (
                            <span className="px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs">
                              {activity.client}
                            </span>
                          )}
                          {activity.department && (
                            <span className="px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs">
                              {activity.department}
                            </span>
                          )}
                          {activity.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No Recent Activity</h4>
            <p className="text-gray-500 text-sm">
              Business activities will appear here as they happen
            </p>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {activities.length > 0 && (
        <div className="relative z-10 mt-6 pt-4 border-t border-gray-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{activities.length}</p>
              <p className="text-gray-400 text-xs">Total Activities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {activities.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-gray-400 text-xs">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">
                {activities.filter(a => a.amount && a.amount > 0).length}
              </p>
              <p className="text-gray-400 text-xs">Revenue Events</p>
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
    </div>
  );
}
