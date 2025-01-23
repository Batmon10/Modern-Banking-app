import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Eye, EyeOff, CreditCard, PiggyBank, Ban, Power, ChevronDown, ChevronRight, Trash2, Search } from 'lucide-react';

interface Account {
  id: string;
  type: 'checking' | 'savings';
  accountNumber: string;
  balance: number;
  userEmail: string;
  createdAt: string;
  status?: 'active' | 'blocked';
}

interface Card {
  id: string;
  type: string;
  cardType: 'credit' | 'debit';
  number: string;
  expiryDate: string;
  status: 'active' | 'inactive';
  nameOnCard: string;
  userEmail: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  isAdmin?: boolean;
}

interface UserGroup {
  user: User;
  accounts: Account[];
  cards: Card[];
  totalBalance: number;
}

interface AdminAccountsDialogProps {
  onClose: () => void;
}

export default function AdminAccountsDialog({ onClose }: AdminAccountsDialogProps) {
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    balance: '',
    type: ''
  });
  const [showCardNumbers, setShowCardNumbers] = useState<{[key: string]: boolean}>({});
  const [showAccountNumbers, setShowAccountNumbers] = useState<{[key: string]: boolean}>({});
  const [expandedUsers, setExpandedUsers] = useState<{[key: string]: boolean}>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allAccounts: Account[] = JSON.parse(localStorage.getItem('accounts') || '[]');
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const allCards: Card[] = JSON.parse(localStorage.getItem('cards') || '[]');

    // Group data by user
    const groups = allUsers
      .filter(user => !user.isAdmin) // Filter out admin users
      .map(user => {
        const userAccounts = allAccounts.filter(acc => acc.userEmail === user.email);
        const userCards = allCards.filter(card => card.userEmail === user.email);
        const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);

        return {
          user,
          accounts: userAccounts,
          cards: userCards,
          totalBalance
        };
      });

    setUserGroups(groups);
    
    // Initialize expanded state for all users
    const initialExpandedState = groups.reduce((acc: {[key: string]: boolean}, group) => {
      acc[group.user.email] = false; // Initially collapsed
      return acc;
    }, {});
    setExpandedUsers(initialExpandedState);
  };

  const handleSaveAccount = (accountId: string) => {
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const updatedAccounts = allAccounts.map((account: Account) => {
      if (account.id === accountId) {
        return {
          ...account,
          balance: parseFloat(editForm.balance) || 0,
          type: editForm.type || account.type
        };
      }
      return account;
    });

    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    loadData();
    setEditingAccount(null);
  };

  const toggleAccountStatus = (accountId: string, currentStatus?: string) => {
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const updatedAccounts = allAccounts.map((account: Account) => {
      if (account.id === accountId) {
        return {
          ...account,
          status: currentStatus === 'blocked' ? 'active' : 'blocked'
        };
      }
      return account;
    });

    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    loadData();
  };

  const handleDeleteAccount = (accountId: string) => {
    const allAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const updatedAccounts = allAccounts.filter((account: Account) => account.id !== accountId);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    loadData();
    setShowDeleteConfirm(null);
  };

  const formatAccountNumber = (number: string | undefined, visible: boolean) => {
    if (!number) return '••••';
    if (visible) {
      return number.match(/.{1,4}/g)?.join(' ') || number;
    }
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  const toggleNumberVisibility = (id: string, type: 'card' | 'account') => {
    if (type === 'card') {
      setShowCardNumbers(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } else {
      setShowAccountNumbers(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };

  const toggleUserExpanded = (email: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const filteredGroups = userGroups.filter(group => {
    const searchString = `${group.user.firstName} ${group.user.lastName} ${group.user.email}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Accounts Management</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {filteredGroups.map(group => (
              <div key={group.user.email} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleUserExpanded(group.user.email)}
                >
                  <div className="flex items-center">
                    {expandedUsers[group.user.email] ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{group.user.firstName} {group.user.lastName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{group.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">Total Balance: ${group.totalBalance.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.accounts.length} Account{group.accounts.length !== 1 ? 's' : ''} • 
                      {group.cards.length} Card{group.cards.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {expandedUsers[group.user.email] && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Accounts</h5>
                      <div className="space-y-2">
                        {group.accounts.map(account => (
                          <div key={account.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center">
                              {account.type === 'checking' ? (
                                <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                              ) : (
                                <PiggyBank className="h-5 w-5 text-green-500 mr-2" />
                              )}
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900 dark:text-white capitalize">{account.type}</span>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <div className="flex items-center">
                                    <span className="font-mono text-gray-900 dark:text-white">
                                      {formatAccountNumber(account.accountNumber, showAccountNumbers[account.id])}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleNumberVisibility(account.id, 'account');
                                      }}
                                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                      {showAccountNumbers[account.id] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Created on {new Date(account.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {editingAccount === account.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={editForm.balance}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, balance: e.target.value }))}
                                    className="border rounded px-2 py-1 w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                  <select
                                    value={editForm.type}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                    className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  >
                                    <option value="checking">Checking</option>
                                    <option value="savings">Savings</option>
                                  </select>
                                  <button
                                    onClick={() => handleSaveAccount(account.id)}
                                    className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                                  >
                                    <Save className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAccount(null)}
                                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-medium text-gray-900 dark:text-white">${account.balance.toFixed(2)}</span>
                                  <button
                                    onClick={() => {
                                      setEditingAccount(account.id);
                                      setEditForm({
                                        balance: account.balance.toString(),
                                        type: account.type
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => toggleAccountStatus(account.id, account.status)}
                                    className={`flex items-center px-3 py-1 rounded-full ${
                                      account.status !== 'blocked'
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                    }`}
                                  >
                                    {account.status !== 'blocked' ? (
                                      <>
                                        <Ban className="h-4 w-4 mr-1" />
                                        Block
                                      </>
                                    ) : (
                                      <>
                                        <Power className="h-4 w-4 mr-1" />
                                        Unblock
                                      </>
                                    )}
                                  </button>
                                  {showDeleteConfirm === account.id ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-red-600 dark:text-red-400">Confirm delete?</span>
                                      <button
                                        onClick={() => handleDeleteAccount(account.id)}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowDeleteConfirm(account.id)}
                                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        {group.accounts.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No accounts</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No users found matching your search criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}