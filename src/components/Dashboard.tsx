import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Wallet, Send, History, Clock, X } from 'lucide-react';
import NewTransaction from './NewTransaction';

interface Account {
  id: string;
  type: 'checking' | 'savings';
  accountNumber: string;
  balance: number;
}

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

interface MoneyRequest {
  id: string;
  requesterId: string;
  requesterAccountNumber: string;
  requesterName: string;
  senderAccountNumber: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

interface QuickTransferProps {
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

function QuickTransfer({ onClose, accounts, onSuccess }: QuickTransferProps) {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(prev => ({
        ...prev,
        fromAccountId: accounts[0].id
      }));
    }
  }, [accounts]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessing && processingTime > 0) {
      timer = setInterval(() => {
        setProcessingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isProcessing, processingTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fromAccountId || !formData.toAccountId) {
      setError('Please select both accounts');
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Cannot transfer to the same account');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) {
      setError('Insufficient funds');
      return;
    }

    // Set random processing time between 10 and 40 seconds
    const randomTime = Math.floor(Math.random() * 31) + 10;
    setProcessingTime(randomTime);
    setIsProcessing(true);

    // Process after delay
    await new Promise(resolve => setTimeout(resolve, randomTime * 1000));

    // Create transactions
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransactions = [
      {
        id: Math.random().toString(36).substr(2, 9),
        accountId: formData.fromAccountId,
        type: 'debit',
        amount,
        description: `Transfer to ${accounts.find(acc => acc.id === formData.toAccountId)?.type} account`,
        category: 'transfer',
        date: new Date().toISOString(),
        status: 'completed',
        recipientAccountNumber: accounts.find(acc => acc.id === formData.toAccountId)?.accountNumber
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        accountId: formData.toAccountId,
        type: 'credit',
        amount,
        description: `Transfer from ${accounts.find(acc => acc.id === formData.fromAccountId)?.type} account`,
        category: 'transfer',
        date: new Date().toISOString(),
        status: 'completed',
        senderAccountNumber: accounts.find(acc => acc.id === formData.fromAccountId)?.accountNumber
      }
    ];

    // Update account balances
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const updatedAccounts = allAccounts.map((acc: Account) => {
      if (acc.id === formData.fromAccountId) {
        return { ...acc, balance: acc.balance - amount };
      }
      if (acc.id === formData.toAccountId) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    localStorage.setItem('transactions', JSON.stringify([...transactions, ...newTransactions]));
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));

    setIsProcessing(false);
    onSuccess();
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Processing Transfer</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we process your transfer. This may take up to {processingTime} seconds.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((40 - processingTime) / 40) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Time remaining: {processingTime} seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Quick Transfer</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Account</label>
            <select
              value={formData.fromAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, fromAccountId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)} (•••• {account.accountNumber.slice(-4)}) - ${account.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">To Account</label>
            <select
              value={formData.toAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, toAccountId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)} (•••• {account.accountNumber.slice(-4)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'send' | 'request' | null>(null);
  const [pendingRequests, setPendingRequests] = useState<MoneyRequest[]>([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [showQuickTransfer, setShowQuickTransfer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const userAccounts = allAccounts.filter(
      (account: Account & { userEmail: string }) => account.userEmail === currentUserEmail
    );
    setAccounts(userAccounts);

    // Load transactions for all user accounts
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

    // Load pending money requests
    const allRequests = JSON.parse(localStorage.getItem('moneyRequests') || '[]');
    const userRequests = allRequests.filter((request: MoneyRequest) => {
      const userAccountNumbers = userAccounts.map(acc => acc.accountNumber);
      return (
        request.status === 'pending' && 
        (userAccountNumbers.includes(request.senderAccountNumber) || 
         userAccountNumbers.includes(request.requesterAccountNumber))
      );
    });
    setPendingRequests(userRequests);
  };

  const handleTransactionSuccess = () => {
    loadData();
    setShowNewTransaction(false);
    setSelectedAction(null);
    setShowQuickTransfer(false);
  };

  const handleQuickAction = (action: 'send' | 'request' | 'quick') => {
    if (action === 'quick') {
      setShowQuickTransfer(true);
    } else {
      setSelectedAction(action);
      setShowNewTransaction(true);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    const allRequests = JSON.parse(localStorage.getItem('moneyRequests') || '[]');
    const request = allRequests.find((r: MoneyRequest) => r.id === requestId);
    
    if (request) {
      if (action === 'approve') {
        // Create transactions for both parties
        const newTransactions = [
          {
            id: Math.random().toString(36).substr(2, 9),
            accountId: request.senderAccountNumber,
            type: 'debit',
            amount: request.amount,
            description: request.description,
            category: 'transfer',
            date: new Date().toISOString(),
            status: 'completed',
            recipientAccountNumber: request.requesterAccountNumber
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            accountId: request.requesterAccountNumber,
            type: 'credit',
            amount: request.amount,
            description: request.description,
            category: 'transfer',
            date: new Date().toISOString(),
            status: 'completed',
            senderAccountNumber: request.senderAccountNumber
          }
        ];

        // Update account balances
        const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        const updatedAccounts = allAccounts.map((acc: Account) => {
          if (acc.accountNumber === request.senderAccountNumber) {
            return { ...acc, balance: acc.balance - request.amount };
          }
          if (acc.accountNumber === request.requesterAccountNumber) {
            return { ...acc, balance: acc.balance + request.amount };
          }
          return acc;
        });

        // Save transactions and updated accounts
        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        localStorage.setItem('transactions', JSON.stringify([...existingTransactions, ...newTransactions]));
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
      }

      // Update request status
      const updatedRequests = allRequests.map((r: MoneyRequest) => 
        r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      );
      localStorage.setItem('moneyRequests', JSON.stringify(updatedRequests));

      // Reload data
      loadData();
    }
  };

  return (
    <div className="p-4">
      {/* Accounts Section */}
      <div className="space-y-4 mb-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 capitalize">{account.type} Account</p>
                <h2 className="text-3xl font-bold mt-1">
                  ${account.balance.toFixed(2)}
                </h2>
              </div>
              <Wallet className="h-8 w-8" />
            </div>
            <div className="flex justify-between mt-4">
              <div>
                <p className="text-blue-100 text-sm">Account Number</p>
                <p className="font-medium">•••• {account.accountNumber.slice(-4)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <button
          onClick={() => handleQuickAction('send')}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50"
        >
          <div className="bg-blue-50 p-2 rounded-lg">
            <Send className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm mt-2">Send</span>
        </button>
        <button
          onClick={() => handleQuickAction('request')}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50"
        >
          <div className="bg-blue-50 p-2 rounded-lg">
            <ArrowDownLeft className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm mt-2">Request</span>
        </button>
        {accounts.length > 1 && (
          <button
            onClick={() => handleQuickAction('quick')}
            className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50"
          >
            <div className="bg-blue-50 p-2 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm mt-2">Quick Transfer</span>
          </button>
        )}
        <button 
          onClick={() => setShowPendingRequests(!showPendingRequests)}
          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 relative"
        >
          <div className="bg-blue-50 p-2 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm mt-2">Pending</span>
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Requests Section */}
      {showPendingRequests && pendingRequests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.description}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      {request.requesterName} • ${request.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(request.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequestAction(request.id, 'approve')}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white p-4 rounded-lg shadow-sm"
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
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {transaction.category}
                      </span>
                      {transaction.recipientAccountNumber && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            To: •••• {transaction.recipientAccountNumber.slice(-4)}
                          </span>
                        </>
                      )}
                      {transaction.senderAccountNumber && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            From: •••• {transaction.senderAccountNumber.slice(-4)}
                          </span>
                        </>
                      )}
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

          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </div>

      {showNewTransaction && (
        <NewTransaction
          onClose={() => {
            setShowNewTransaction(false);
            setSelectedAction(null);
          }}
          onSuccess={handleTransactionSuccess}
          initialType={selectedAction === 'send' ? 'debit' : 'credit'}
        />
      )}

      {showQuickTransfer && (
        <QuickTransfer
          onClose={() => setShowQuickTransfer(false)}
          accounts={accounts}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}