import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, X, Search, AlertCircle, Clock } from 'lucide-react';

interface Account {
  id: string;
  type: 'checking' | 'savings';
  accountNumber: string;
  balance: number;
  userEmail: string;
}

interface NewTransactionProps {
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'credit' | 'debit';
}

interface RecipientInfo {
  accountNumber: string;
  userEmail: string;
  firstName: string;
  lastName: string;
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

export default function NewTransaction({ onClose, onSuccess, initialType }: NewTransactionProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    type: initialType || 'debit',
    amount: '',
    description: '',
    category: 'other',
    recipientAccountNumber: ''
  });
  const [error, setError] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [showRecipientDialog, setShowRecipientDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const userAccounts = allAccounts.filter(
      (account: Account) => account.userEmail === currentUserEmail
    );
    setAccounts(userAccounts);
    if (userAccounts.length > 0) {
      setFormData(prev => ({ ...prev, accountId: userAccounts[0].id }));
    }
  }, []);

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

  const verifyRecipientAccount = () => {
    if (!formData.recipientAccountNumber) {
      setError('Please enter recipient account number');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Get all accounts and users
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');

    // Find recipient account
    const recipientAccount = allAccounts.find(
      (acc: Account) => acc.accountNumber === formData.recipientAccountNumber
    );

    if (!recipientAccount) {
      setError('Account not found');
      setIsVerifying(false);
      return;
    }

    // Find recipient user
    const recipientUser = allUsers.find(
      (user: any) => user.email === recipientAccount.userEmail
    );

    if (!recipientUser) {
      setError('Recipient information not found');
      setIsVerifying(false);
      return;
    }

    // Set recipient info and show dialog
    setRecipientInfo({
      accountNumber: recipientAccount.accountNumber,
      userEmail: recipientUser.email,
      firstName: recipientUser.firstName,
      lastName: recipientUser.lastName
    });
    setShowRecipientDialog(true);
    setIsVerifying(false);
  };

  const processTransaction = async () => {
    const amount = parseFloat(formData.amount);
    const selectedAccount = accounts.find(acc => acc.id === formData.accountId);

    if (formData.type === 'credit') {
      // Create money request
      const moneyRequests = JSON.parse(localStorage.getItem('moneyRequests') || '[]');
      const newRequest: MoneyRequest = {
        id: Math.random().toString(36).substr(2, 9),
        requesterId: selectedAccount!.id,
        requesterAccountNumber: selectedAccount!.accountNumber,
        requesterName: `${recipientInfo!.firstName} ${recipientInfo!.lastName}`,
        senderAccountNumber: formData.recipientAccountNumber,
        amount: amount,
        description: formData.description,
        status: 'pending',
        date: new Date().toISOString()
      };
      
      moneyRequests.push(newRequest);
      localStorage.setItem('moneyRequests', JSON.stringify(moneyRequests));
    } else {
      // Create new transaction for sender
      const newSenderTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        accountId: formData.accountId,
        type: 'debit',
        amount: amount,
        description: formData.description,
        category: formData.category,
        date: new Date().toISOString(),
        status: 'completed',
        recipientAccountNumber: formData.recipientAccountNumber
      };

      // Create corresponding credit transaction for recipient
      const newRecipientTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        accountId: formData.recipientAccountNumber,
        type: 'credit',
        amount: amount,
        description: `Transfer from ${selectedAccount?.accountNumber}`,
        category: 'transfer',
        date: new Date().toISOString(),
        status: 'completed',
        senderAccountNumber: selectedAccount?.accountNumber
      };

      // Update transactions in localStorage
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.push(newSenderTransaction, newRecipientTransaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));

      // Update account balances
      const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const updatedAccounts = allAccounts.map((acc: Account) => {
        if (acc.id === formData.accountId) {
          return {
            ...acc,
            balance: acc.balance - amount
          };
        }
        if (acc.accountNumber === formData.recipientAccountNumber) {
          return {
            ...acc,
            balance: acc.balance + amount
          };
        }
        return acc;
      });
      localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.accountId || !formData.amount || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.recipientAccountNumber) {
      setError('Please enter recipient account number');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
    
    if (formData.type === 'debit' && selectedAccount && selectedAccount.balance < amount) {
      setError('Insufficient funds');
      return;
    }

    // Set random processing time between 10 and 40 seconds
    const randomTime = Math.floor(Math.random() * 31) + 10;
    setProcessingTime(randomTime);
    setIsProcessing(true);

    // Process the transaction after the delay
    await new Promise(resolve => setTimeout(resolve, randomTime * 1000));
    await processTransaction();
    
    setIsProcessing(false);
    onSuccess();
    onClose();
  };

  const categories = [
    'Income',
    'Bills',
    'Shopping',
    'Entertainment',
    'Dining',
    'Transport',
    'Healthcare',
    'Education',
    'Transfer',
    'Other'
  ];

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Processing Transaction</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we process your transaction. This may take up to {processingTime} seconds.
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
          <h3 className="text-lg font-semibold">
            {formData.type === 'credit' ? 'Request Money' : 'Send Money'}
          </h3>
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
              value={formData.accountId}
              onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
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
            <label className="block text-sm font-medium text-gray-700">
              {formData.type === 'credit' ? "Sender's Account Number" : "Recipient's Account Number"}
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={formData.recipientAccountNumber}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, recipientAccountNumber: e.target.value }));
                  setRecipientInfo(null);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter account number"
              />
              <button
                type="button"
                onClick={verifyRecipientAccount}
                disabled={isVerifying}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isVerifying ? (
                  <Search className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify'
                )}
              </button>
            </div>
            {recipientInfo && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  {formData.type === 'credit' ? 'Sender' : 'Recipient'}: {recipientInfo.firstName} {recipientInfo.lastName}
                </p>
              </div>
            )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.toLowerCase()} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!recipientInfo}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {formData.type === 'credit' ? 'Request Money' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}