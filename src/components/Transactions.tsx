import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Search, Filter, CreditCard } from 'lucide-react';

interface Transaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending';
  recipientAccountNumber?: string;
  senderAccountNumber?: string;
}

interface Account {
  id: string;
  type: 'checking' | 'savings';
  accountNumber: string;
  balance: number;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    // Load user accounts
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const userAccounts = allAccounts.filter(
      (account: Account & { userEmail: string }) => account.userEmail === currentUserEmail
    );
    setAccounts(userAccounts);

    // Load all transactions for user's accounts
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTransactions = allTransactions.filter((transaction: Transaction) => {
      const accountIds = userAccounts.map(acc => acc.id);
      return accountIds.includes(transaction.accountId);
    });

    // Sort transactions by date (most recent first)
    const sortedTransactions = userTransactions.sort((a: Transaction, b: Transaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setTransactions(sortedTransactions);
  };

  const getUniqueCategories = () => {
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories);
  };

  const filterTransactions = () => {
    return transactions.filter(transaction => {
      // Filter by type
      if (activeFilter !== 'all' && transaction.type !== activeFilter) return false;

      // Filter by account
      if (selectedAccount !== 'all' && transaction.accountId !== selectedAccount) return false;

      // Filter by category
      if (selectedCategory !== 'all' && transaction.category !== selectedCategory) return false;

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.category.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(searchLower)
        );
      }

      return true;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAccountNumber = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.accountNumber : '';
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Search and Filter Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)} (•••• {account.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-2">
                  {['all', 'credit', 'debit'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                        activeFilter === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filterTransactions().map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownLeft className={`h-5 w-5 ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  ) : (
                    <ArrowUpRight className={`h-5 w-5 ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  )}
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <p className="font-medium">{transaction.description}</p>
                    {transaction.category === 'card_payment' && (
                      <CreditCard className="h-4 w-4 ml-2 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>{formatDate(transaction.date)}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{transaction.category}</span>
                    {transaction.recipientAccountNumber && (
                      <>
                        <span className="mx-2">•</span>
                        <span>To: •••• {transaction.recipientAccountNumber.slice(-4)}</span>
                      </>
                    )}
                    {transaction.senderAccountNumber && (
                      <>
                        <span className="mx-2">•</span>
                        <span>From: •••• {transaction.senderAccountNumber.slice(-4)}</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Account: •••• {getAccountNumber(transaction.accountId).slice(-4)}
                  </div>
                </div>
              </div>
              <span className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        {filterTransactions().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}