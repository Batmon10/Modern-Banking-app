import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Clock, ArrowUpRight, ArrowDownLeft, CreditCard, Ban, Power, User, DollarSign, Shield } from 'lucide-react';

interface Log {
  id: string;
  type: 'account' | 'transaction' | 'card' | 'auth' | 'user';
  action: string;
  details: string;
  userEmail: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

interface AdminLogsDialogProps {
  onClose: () => void;
}

export default function AdminLogsDialog({ onClose }: AdminLogsDialogProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const storedLogs = JSON.parse(localStorage.getItem('bankLogs') || '[]');
    setLogs(storedLogs.sort((a: Log, b: Log) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'account':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'transaction':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'card':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'auth':
        return <Shield className="h-5 w-5 text-orange-500" />;
      case 'user':
        return <User className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const filterLogs = () => {
    return logs.filter(log => {
      // Type filter
      if (selectedType !== 'all' && log.type !== selectedType) return false;

      // Date range filter
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (dateRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (logDate < today) return false;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (logDate < weekAgo) return false;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (logDate < monthAgo) return false;
      }

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.userEmail.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Bank Activity Logs</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="account">Accounts</option>
              <option value="transaction">Transactions</option>
              <option value="card">Cards</option>
              <option value="auth">Authentication</option>
              <option value="user">Users</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="space-y-3">
            {filterLogs().map((log) => (
              <div key={log.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-gray-50">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</p>
                        <p className="text-sm text-gray-500 mt-1">{log.userEmail}</p>
                      </div>
                    </div>
                    {log.amount !== undefined && (
                      <p className="text-sm font-medium mt-2">
                        Amount: ${log.amount.toFixed(2)}
                      </p>
                    )}
                    {log.status && (
                      <p className={`text-sm font-medium mt-2 ${
                        log.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Status: {log.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filterLogs().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No logs found matching your criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}