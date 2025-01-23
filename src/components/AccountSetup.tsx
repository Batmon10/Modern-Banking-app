import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, CreditCard, PiggyBank } from 'lucide-react';

interface AccountSetupProps {
  email: string;
  onComplete: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

interface Account {
  id: string;
  type: 'checking' | 'savings';
  accountNumber: string;
  balance: number;
  userEmail: string;
  createdAt: string;
}

export default function AccountSetup({ email, onComplete, darkMode }: AccountSetupProps) {
  const [selectedAccount, setSelectedAccount] = useState<'checking' | 'savings' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [existingAccounts, setExistingAccounts] = useState<Account[]>([]);

  useEffect(() => {
    // Load user's existing accounts
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const userAccounts = accounts.filter((acc: Account) => acc.userEmail === email);
    setExistingAccounts(userAccounts);
  }, [email]);

  const generateAccountNumber = () => {
    return Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join('');
  };

  const handleCreateAccount = () => {
    if (!selectedAccount) {
      setError('Please select an account type');
      return;
    }

    // Check if user already has this type of account
    const hasAccountType = existingAccounts.some(acc => acc.type === selectedAccount);
    if (hasAccountType) {
      setError(`You already have a ${selectedAccount} account`);
      return;
    }

    const newAccount: Account = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedAccount,
      accountNumber: generateAccountNumber(),
      balance: 0,
      userEmail: email,
      createdAt: new Date().toISOString()
    };

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    localStorage.setItem('accounts', JSON.stringify([...accounts, newAccount]));
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50'
    }`}>
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Account created successfully!</span>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Choose Your First Account
        </h2>
        <p className={`mt-2 text-center text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Select the type of account you'd like to open
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="space-y-4">
            <button
              onClick={() => setSelectedAccount('checking')}
              className={`w-full p-6 border rounded-lg text-left transition-all ${
                selectedAccount === 'checking'
                  ? darkMode 
                    ? 'border-blue-400 bg-blue-900/50'
                    : 'border-blue-600 bg-blue-50'
                  : darkMode
                    ? 'border-gray-600 hover:border-blue-400'
                    : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <div className={`text-lg font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Checking Account
                  </div>
                  <div className={`text-sm mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Perfect for everyday transactions, bills, and direct deposits
                  </div>
                  <ul className={`text-sm mt-2 space-y-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <li>• No minimum balance required</li>
                    <li>• Free online banking</li>
                    <li>• Mobile check deposits</li>
                  </ul>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedAccount('savings')}
              className={`w-full p-6 border rounded-lg text-left transition-all ${
                selectedAccount === 'savings'
                  ? darkMode 
                    ? 'border-blue-400 bg-blue-900/50'
                    : 'border-blue-600 bg-blue-50'
                  : darkMode
                    ? 'border-gray-600 hover:border-blue-400'
                    : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <PiggyBank className={`h-6 w-6 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <div className={`text-lg font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Savings Account
                  </div>
                  <div className={`text-sm mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Earn interest while saving for your future goals
                  </div>
                  <ul className={`text-sm mt-2 space-y-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <li>• Competitive interest rates</li>
                    <li>• Automatic savings options</li>
                    <li>• Goal-based savings tools</li>
                  </ul>
                </div>
              </div>
            </button>

            {error && (
              <div className={`text-sm p-2 rounded-md ${
                darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <button
              onClick={handleCreateAccount}
              disabled={!selectedAccount}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all ${
                selectedAccount
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Create {selectedAccount ? selectedAccount.charAt(0).toUpperCase() + selectedAccount.slice(1) : ''} Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}