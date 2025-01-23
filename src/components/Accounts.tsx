import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, PiggyBank, CheckCircle, Plus, History, DollarSign, Eye, EyeOff } from 'lucide-react';
import AccountTransactions from './AccountTransactions';
import NewTransaction from './NewTransaction';

interface Account {
  id: string;
  type: 'checking' | 'savings';
  accountNumber: string;
  balance: number;
  userEmail: string;
  createdAt: string;
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
  const [visibleAccountNumbers, setVisibleAccountNumbers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const userAccounts = allAccounts.filter(
      (account: Account & { userEmail: string }) => account.userEmail === currentUserEmail
    );
    setAccounts(userAccounts);
  }, []);

  const generateAccountNumber = () => {
    return Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join('');
  };

  const handleCreateAccount = (type: 'checking' | 'savings') => {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    
    const newAccount = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      accountNumber: generateAccountNumber(),
      balance: 0,
      userEmail: currentUserEmail,
      createdAt: new Date().toISOString()
    };

    const updatedAccounts = [...allAccounts, newAccount];
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
    setAccounts(prev => [...prev, newAccount]);
    setShowNewAccountForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const toggleAccountNumberVisibility = (accountId: string) => {
    setVisibleAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const formatAccountNumber = (number: string, visible: boolean) => {
    if (visible) {
      return number.match(/.{1,4}/g)?.join(' ') || number;
    }
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Account created successfully!</span>
        </div>
      )}

      {showTransactionSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Transaction completed successfully!</span>
        </div>
      )}

      {selectedAccountId && (
        <AccountTransactions 
          accountId={selectedAccountId} 
          onClose={() => setSelectedAccountId(null)} 
        />
      )}

      {showNewTransaction && (
        <NewTransaction
          onClose={() => setShowNewTransaction(false)}
          onSuccess={() => {
            setShowTransactionSuccess(true);
            setTimeout(() => setShowTransactionSuccess(false), 2000);
            const currentUserEmail = localStorage.getItem('currentUserEmail');
            const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const userAccounts = allAccounts.filter(
              (account: Account) => account.userEmail === currentUserEmail
            );
            setAccounts(userAccounts);
          }}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Accounts</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowNewTransaction(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            New Transaction
          </button>
          {!showNewAccountForm && (
            <button
              onClick={() => setShowNewAccountForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Open New Account
            </button>
          )}
        </div>
      </div>

      {showNewAccountForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Account Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleCreateAccount('checking')}
              className="p-4 border rounded-lg hover:border-blue-400 flex items-center"
            >
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div className="ml-3 text-left">
                <div className="font-medium">Checking Account</div>
                <div className="text-sm text-gray-500">For everyday transactions</div>
              </div>
            </button>

            <button
              onClick={() => handleCreateAccount('savings')}
              className="p-4 border rounded-lg hover:border-blue-400 flex items-center"
            >
              <PiggyBank className="h-6 w-6 text-blue-600" />
              <div className="ml-3 text-left">
                <div className="font-medium">Savings Account</div>
                <div className="text-sm text-gray-500">Earn interest on your savings</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold capitalize">{account.type} Account</h3>
                <div className="flex items-center mt-1">
                  <p className="text-sm text-gray-500 font-mono">
                    {formatAccountNumber(account.accountNumber, visibleAccountNumbers[account.id])}
                  </p>
                  <button
                    onClick={() => toggleAccountNumberVisibility(account.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    {visibleAccountNumbers[account.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {account.type === 'checking' ? (
                <CreditCard className="h-6 w-6 text-blue-600" />
              ) : (
                <PiggyBank className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Available Balance</div>
              <div className="text-2xl font-bold">${account.balance.toFixed(2)}</div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedAccountId(account.id)}
                className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <History className="h-4 w-4 mr-1" />
                View Transactions
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showNewAccountForm && (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500 mb-4">Get started by opening your first account</p>
          <button
            onClick={() => setShowNewAccountForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Open New Account
          </button>
        </div>
      )}
    </div>
  );
}