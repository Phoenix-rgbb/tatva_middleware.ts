import React from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, User, Calendar, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  progress?: number;
  department?: string;
}

interface TeamTasksProps {
  tasks: Task[];
  onAddTask?: () => void;
  onViewAll?: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

export function TeamTasks({ tasks, onAddTask, onViewAll, onUpdateTask }: TeamTasksProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'overdue':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  };

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

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
          <h3 className="text-xl font-bold text-white mb-1">Team Tasks & Actions</h3>
          <p className="text-gray-400 text-sm">Current assignments and deadlines</p>
        </div>
        <button 
          onClick={onAddTask}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg 
            bg-cyan-500/20 border border-cyan-500/30 text-cyan-400
            hover:bg-cyan-500/30 hover:border-cyan-500/50
            transition-all duration-200 text-sm font-medium
          "
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Task Statistics */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-white">{taskStats.total}</p>
          <p className="text-gray-400 text-xs">Total</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 text-center min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
          <p className="text-gray-400 text-xs">Active</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 text-center min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-green-400">{taskStats.completed}</p>
          <p className="text-gray-400 text-xs">Done</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30 text-center min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-red-400">{taskStats.overdue}</p>
          <p className="text-gray-400 text-xs">Overdue</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Overall Completion Rate</span>
          <span>{completionRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="relative z-10 space-y-3 max-h-80 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.slice(0, 6).map((task) => (
            <div key={task.id} className="
              bg-gray-800/50 rounded-lg p-4 border border-gray-700/50
              hover:border-cyan-500/30 hover:bg-gray-800/70
              transition-all duration-200 group
            ">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status)}
                    <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors truncate">
                      {task.title}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    {task.department && (
                      <span className="px-2 py-1 rounded-full bg-gray-700/50 text-xs flex-shrink-0">
                        {task.department}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Bar (if available) */}
              {task.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No Tasks Assigned</h4>
            <p className="text-gray-500 text-sm mb-4">
              Create tasks to track team progress and deadlines
            </p>
            <button 
              onClick={onAddTask}
              className="
                px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 
                text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm
              "
            >
              Create First Task
            </button>
          </div>
        )}
      </div>

      {/* View All Button */}
      {tasks.length > 6 && (
        <div className="relative z-10 mt-4 pt-4 border-t border-gray-700/50">
          <button 
            onClick={onViewAll}
            className="
              w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
              border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 
              hover:border-cyan-500/50 transition-all duration-200 text-sm font-medium
            "
          >
            View All Tasks
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
    </div>
  );
}
