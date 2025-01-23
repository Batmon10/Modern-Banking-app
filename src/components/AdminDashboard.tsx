import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Users, Wallet, CreditCard, DollarSign, PiggyBank, Search, Edit, Save, X, History } from 'lucide-react';
import AdminAccountsDialog from './AdminAccountsDialog';
import AdminLogsDialog from './AdminLogsDialog';

interface BankStats {
  totalBalance: number;
  totalAccounts: number;
  totalUsers: number;
  totalCards: number;
  checkingAccounts: number;
  savingsAccounts: number;
  averageBalance: number;
}

export default function AdminDashboard() {
  const [showAccountsDialog, setShowAccountsDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [bankStats, setBankStats] = useState<BankStats>({
    totalBalance: 0,
    totalAccounts: 0,
    totalUsers: 0,
    totalCards: 0,
    checkingAccounts: 0,
    savingsAccounts: 0,
    averageBalance: 0
  });

  useEffect(() => {
    loadBankStats();
  }, [showAccountsDialog]); // Reload when accounts dialog is closed

  const loadBankStats = () => {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');

    const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
    const checkingAccounts = accounts.filter((acc: any) => acc.type === 'checking').length;
    const savingsAccounts = accounts.filter((acc: any) => acc.type === 'savings').length;

    setBankStats({
      totalBalance,
      totalAccounts: accounts.length,
      totalUsers: users.filter((user: any) => !user.isAdmin).length,
      totalCards: cards.length,
      checkingAccounts,
      savingsAccounts,
      averageBalance: accounts.length ? totalBalance / accounts.length : 0
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${bankStats.totalBalance.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bankStats.totalUsers}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <button
          onClick={() => setShowLogsDialog(true)}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">View Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Activity</p>
            </div>
            <History className="h-8 w-8 text-orange-500" />
          </div>
        </button>

        <button
          onClick={() => setShowAccountsDialog(true)}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bankStats.totalAccounts}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-purple-500" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Checking Accounts</span>
                <span>{bankStats.checkingAccounts}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${bankStats.totalAccounts ? (bankStats.checkingAccounts / bankStats.totalAccounts) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Savings Accounts</span>
                <span>{bankStats.savingsAccounts}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${bankStats.totalAccounts ? (bankStats.savingsAccounts / bankStats.totalAccounts) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Average Balance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Average Balance</h3>
          <div className="flex items-center">
            <DollarSign className="h-12 w-12 text-green-500 mr-4" />
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${bankStats.averageBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Per account</p>
            </div>
          </div>
        </div>
      </div>

      {showAccountsDialog && (
        <AdminAccountsDialog onClose={() => setShowAccountsDialog(false)} />
      )}

      {showLogsDialog && (
        <AdminLogsDialog onClose={() => setShowLogsDialog(false)} />
      )}
    </div>
  );
}